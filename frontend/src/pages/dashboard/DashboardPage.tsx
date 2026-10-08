import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { transactionService } from '../../services/transactionService';
import { accountService } from '../../services/accountService';
import { categoryService } from '../../services/categoryService';
import { TransactionResponse } from '../../types/transaction';
import { Account } from '../../types/account';
import { Category } from '../../types/category';
import Sidebar from '../../components/layout/Sidebar';
import { TopHeader } from '../../components/layout/TopHeader';
import { AddTransactionModal } from '../../components/modals/AddTransactionModal';
import { getCategoryIcon } from '../../utils/iconMap';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [currentMonth, setCurrentMonth] = useState<number>(10);
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [selectedAccountId, setSelectedAccountId] = useState<number | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Quick AI Prompt state
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiSuccessMsg, setAiSuccessMsg] = useState<string | null>(null);

  // Time frame tab filter: ALL, TODAY, YESTERDAY, THIS_WEEK, THIS_MONTH
  const [timeFilter, setTimeFilter] = useState<string>('THIS_MONTH');

  // Add/Edit Transaction Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingTx, setEditingTx] = useState<TransactionResponse | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const monthStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
      const [txsResponse, accSummary, catsData] = await Promise.all([
        transactionService.getTransactions({
          month: monthStr,
          accountId: selectedAccountId
        }),
        accountService.getAccounts(),
        categoryService.getCategories()
      ]);
      const accsList = accSummary?.accounts || [];
      setTransactions(txsResponse.content || []);
      setAccounts(accsList);
      setCategories(catsData);
    } catch (err: any) {
      console.error('Failed to load dashboard data', err);
      setError('Không thể tải dữ liệu giao dịch hoặc tài khoản từ máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentMonth, currentYear, selectedAccountId]);

  const handleDeleteTransaction = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa giao dịch này?')) return;
    try {
      await transactionService.deleteTransaction(id);
      fetchData();
    } catch (err) {
      console.error('Delete transaction error', err);
      alert('Không thể xóa giao dịch. Vui lòng thử lại.');
    }
  };

  // KPI Calculations
  const totalBalance = accounts.reduce((acc, curr) => acc + (curr.balance || 0), 0);
  const totalIncome = transactions
    .filter(t => t.type === 'INCOME')
    .reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const totalExpense = transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const savingsRate = totalIncome > 0 ? Math.max(0, Math.round(((totalIncome - totalExpense) / totalIncome) * 100)) : 0;

  // Format currency VND
  const formatVND = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  // Handle Quick AI Prompt submit
  const handleAiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setAiSuccessMsg(null);
    try {
      const lower = aiPrompt.toLowerCase();
      let detectedAmount = 0;
      const numMatch = lower.match(/(\d+[\d\.,]*)\s*(k|nghìn|ngan|tr|triệu|vnd|đ)?/i);
      if (numMatch) {
        let rawNum = parseFloat(numMatch[1].replace(/,/g, ''));
        const unit = numMatch[2]?.toLowerCase();
        if (unit === 'k' || unit === 'nghìn' || unit === 'ngan') rawNum *= 1000;
        else if (unit === 'tr' || unit === 'triệu') rawNum *= 1000000;
        detectedAmount = Math.round(rawNum);
      }

      if (detectedAmount > 0 && accounts.length > 0 && categories.length > 0) {
        const isIncome = lower.includes('thu') || lower.includes('lương') || lower.includes('thưởng') || lower.includes('nhận');
        const defaultCat = categories.find(c => isIncome ? c.type === 'INCOME' : c.type === 'EXPENSE') || categories[0];
        await transactionService.createTransaction({
          accountId: accounts[0].id,
          walletId: accounts[0].id,
          categoryId: defaultCat.id,
          amount: detectedAmount,
          type: isIncome ? 'INCOME' : 'EXPENSE',
          transactionDate: new Date().toISOString().slice(0, 10),
          note: aiPrompt.trim()
        });
        setAiSuccessMsg(`FinMan AI đã tự động ghi nhận: ${formatVND(detectedAmount)}`);
        setAiPrompt('');
        fetchData();
      } else {
        setAiSuccessMsg('FinMan AI đã nhận lệnh: ' + aiPrompt);
        setAiPrompt('');
      }
    } catch (err) {
      console.error('AI prompt error', err);
      setError('FinMan AI không thể xử lý lệnh này lúc này.');
    } finally {
      setAiLoading(false);
    }
  };

  // Filtered transactions by search term and time frame tab
  const filteredTransactions = transactions.filter(t => {
    // Search query filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchSearch = (
        (t.note && t.note.toLowerCase().includes(term)) ||
        (t.categoryName && t.categoryName.toLowerCase().includes(term)) ||
        (t.walletName && t.walletName.toLowerCase().includes(term)) ||
        String(t.amount).includes(term)
      );
      if (!matchSearch) return false;
    }

    // Time frame filter
    if (timeFilter === 'ALL' || !t.transactionDate) return true;
    const txDateStr = t.transactionDate.slice(0, 10);
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);

    if (timeFilter === 'TODAY') {
      return txDateStr === todayStr;
    }
    if (timeFilter === 'YESTERDAY') {
      const yest = new Date(today);
      yest.setDate(yest.getDate() - 1);
      return txDateStr === yest.toISOString().slice(0, 10);
    }
    if (timeFilter === 'THIS_WEEK') {
      const dayOfWeek = today.getDay() || 7;
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - dayOfWeek + 1);
      const startOfWeekStr = startOfWeek.toISOString().slice(0, 10);
      return txDateStr >= startOfWeekStr && txDateStr <= todayStr;
    }
    if (timeFilter === 'THIS_MONTH') {
      const monthPrefix = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
      return txDateStr.startsWith(monthPrefix);
    }
    return true;
  });

  // Group transactions by date
  const groupedTransactions: { [dateStr: string]: TransactionResponse[] } = {};
  filteredTransactions.forEach(tx => {
    const dateKey = tx.transactionDate ? tx.transactionDate.split('T')[0] : 'Hôm nay';
    if (!groupedTransactions[dateKey]) {
      groupedTransactions[dateKey] = [];
    }
    groupedTransactions[dateKey].push(tx);
  });

  return (
    <div className="min-h-screen bg-surface font-sans text-on-surface antialiased">
      {/* Stitch Design Sidebar: Fixed w-72 */}
      <Sidebar onOpenAddModal={() => setIsAddModalOpen(true)} />

      {/* Main Content Workspace: Offset by pl-0 lg:pl-72 */}
      <div className="lg:pl-72">
        {/* Stitch Design Top Header: Fixed h-20 */}
        <TopHeader
          currentMonth={currentMonth}
          setCurrentMonth={setCurrentMonth}
          currentYear={currentYear}
          setCurrentYear={setCurrentYear}
          selectedAccountId={selectedAccountId}
          setSelectedAccountId={setSelectedAccountId}
          accounts={accounts.map(a => ({ id: a.id, name: a.name }))}
          onOpenAddModal={() => setIsAddModalOpen(true)}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />

        {/* Main Dashboard Canvas: pt-20 for fixed header */}
        <main className="relative pt-20 bg-surface min-h-screen">
          <div className="w-full max-w-[1600px] mx-auto px-6 py-6 flex flex-col gap-6">

            {/* Top Level KPI Metrics Strip: 4 Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              
              {/* Card 1: Net Available Balance */}
              <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/20 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                      Tổng số dư khả dụng
                    </span>
                    <span className="material-symbols-outlined text-[18px] text-on-surface-variant cursor-pointer">
                      visibility
                    </span>
                  </div>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                </div>
                <div className="mt-3 mb-2">
                  <div className="text-2xl font-extrabold font-mono text-on-surface tracking-tight">
                    {formatVND(totalBalance)}
                  </div>
                  <p className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-1">
                    <span className="material-symbols-outlined text-[15px]">verified_user</span>
                    {accounts.length} tài khoản đã đồng bộ
                  </p>
                </div>
              </div>

              {/* Card 2: Total Income */}
              <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/20 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                    Tổng Thu nhập T{currentMonth}
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                    <span className="material-symbols-outlined text-[20px]">arrow_downward</span>
                  </div>
                </div>
                <div className="mt-3 mb-2">
                  <div className="text-2xl font-extrabold font-mono text-emerald-600 tracking-tight">
                    +{formatVND(totalIncome)}
                  </div>
                  <span className="text-xs text-on-surface-variant mt-1 block">
                    Tháng {currentMonth}/{currentYear}
                  </span>
                </div>
              </div>

              {/* Card 3: Total Expenses */}
              <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/20 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                    Tổng Chi tiêu T{currentMonth}
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[20px]">arrow_upward</span>
                  </div>
                </div>
                <div className="mt-3 mb-2">
                  <div className="text-2xl font-extrabold font-mono text-primary tracking-tight">
                    -{formatVND(totalExpense)}
                  </div>
                  <span className="text-xs text-on-surface-variant mt-1 block">
                    Tháng {currentMonth}/{currentYear}
                  </span>
                </div>
              </div>

              {/* Card 4: Savings Rate */}
              <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/20 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                    Tỷ lệ tích lũy
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600">
                    <span className="material-symbols-outlined text-[20px]">savings</span>
                  </div>
                </div>
                <div className="mt-3 mb-2">
                  <div className="text-2xl font-extrabold font-mono text-blue-600 tracking-tight">
                    {savingsRate}%
                  </div>
                  <span className="text-xs text-on-surface-variant mt-1 block">
                    Mục tiêu &gt;= 20%
                  </span>
                </div>
              </div>

            </div>

            {/* Smart AI Natural Language Parsing Card (Stitch Design) */}
            <div className="bg-gradient-to-br from-surface-container-lowest via-surface-container-low to-surface-container-highest/40 p-6 rounded-2xl shadow-sm border border-outline-variant/20">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary text-on-primary flex items-center justify-center shadow-sm">
                    <span className="material-symbols-outlined text-[22px]">smart_toy</span>
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-sm text-on-surface tracking-tight">
                      Nhập thông minh AI
                    </h3>
                    <p className="text-xs text-on-surface-variant">
                      Gõ câu tự nhiên bằng tiếng Việt để FinMan tự động trích xuất hạng mục tài chính
                    </p>
                  </div>
                </div>
              </div>

              {/* AI Prompt Input Bar */}
              <form onSubmit={handleAiSubmit} className="bg-surface-container-lowest rounded-xl p-2 shadow-sm border border-outline-variant/30 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary pl-2 text-[22px]">
                  neurology
                </span>
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Ví dụ: 'Vừa đổ xăng 120k bằng VCB' hoặc 'Lương tháng 10 20 triệu'..."
                  className="flex-1 bg-transparent py-2 px-2 text-xs text-on-surface placeholder:text-on-surface-variant focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={aiLoading}
                  className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-on-primary font-semibold text-xs transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[18px]">bolt</span>
                  <span>Bóc tách</span>
                </button>
              </form>

              {aiSuccessMsg && (
                <div className="mt-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-700 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                  <span>{aiSuccessMsg}</span>
                </div>
              )}

              {error && (
                <div className="mt-3 p-3 bg-error/10 border border-error/20 rounded-xl text-xs text-error flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">error</span>
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* Main Content Split Workspace: 12 Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

              {/* LEFT 8 COLUMNS: Transaction Ledger Stage */}
              <div className="lg:col-span-8 flex flex-col gap-6">
                
                <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/20">
                  {/* Top Header of Ledger */}
                  <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 pb-4 border-b border-outline-variant/10">
                    
                    {/* Time Frame Filter Tabs */}
                    <div className="flex items-center p-1 rounded-xl bg-surface-container-low overflow-x-auto max-w-full">
                      {[
                        { key: 'TODAY', label: 'Hôm nay' },
                        { key: 'YESTERDAY', label: 'Hôm qua' },
                        { key: 'THIS_WEEK', label: 'Tuần này' },
                        { key: 'THIS_MONTH', label: `Tháng ${currentMonth}/${currentYear}` },
                      ].map(tab => (
                        <button
                          key={tab.key}
                          onClick={() => setTimeFilter(tab.key)}
                          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                            timeFilter === tab.key
                              ? 'bg-surface-container-lowest text-on-surface shadow-sm'
                              : 'text-on-surface-variant hover:text-on-surface'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {/* Quick Action Button: Thêm mới */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-1 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-on-primary text-xs font-bold shadow-sm transition-all"
                      >
                        <span className="material-symbols-outlined text-[18px]">add</span>
                        <span>Thêm mới</span>
                      </button>
                    </div>
                  </div>

                  {/* Transactions List */}
                  {loading ? (
                    <div className="flex items-center justify-center py-16 text-on-surface-variant text-xs gap-2">
                      <span className="material-symbols-outlined animate-spin text-primary">progress_activity</span>
                      Đang đồng bộ giao dịch...
                    </div>
                  ) : Object.keys(groupedTransactions).length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant">
                      <span className="material-symbols-outlined text-4xl mb-2 text-outline">receipt</span>
                      <p className="text-xs">Chưa có giao dịch nào trong khoảng thời gian này.</p>
                      <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="mt-3 text-xs font-bold text-primary hover:underline"
                      >
                        + Tạo giao dịch đầu tiên
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6 pt-4">
                      {Object.entries(groupedTransactions).map(([dateStr, txList]) => {
                        const dayTotalIncome = txList.filter(t => t.type === 'INCOME').reduce((s, c) => s + c.amount, 0);
                        const dayTotalExpense = txList.filter(t => t.type === 'EXPENSE').reduce((s, c) => s + c.amount, 0);
                        const dayNet = dayTotalIncome - dayTotalExpense;

                        return (
                          <div key={dateStr} className="space-y-2">
                            {/* Date Group Header */}
                            <div className="flex items-center justify-between px-3 py-1.5 bg-surface-container-low/70 rounded-xl text-xs font-semibold text-on-surface-variant">
                              <span className="flex items-center gap-1.5 text-on-surface">
                                <span className="material-symbols-outlined text-sm text-outline">calendar_today</span>
                                {dateStr}
                              </span>
                              <span className={`font-mono text-xs font-bold ${dayNet >= 0 ? 'text-emerald-600' : 'text-primary'}`}>
                                {dayNet >= 0 ? '+' : ''}{formatVND(dayNet)}
                              </span>
                            </div>

                            {/* Transactions in Date Group */}
                            <div className="divide-y divide-outline-variant/10">
                              {txList.map(tx => (
                                <div
                                  key={tx.id}
                                  className="group flex items-center justify-between py-3 px-2 hover:bg-surface-container-low/40 rounded-xl transition-colors"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                      tx.type === 'INCOME'
                                        ? 'bg-emerald-500/10 text-emerald-600'
                                        : 'bg-primary/10 text-primary'
                                    }`}>
                                      <span className="material-symbols-outlined text-xl">
                                        {getCategoryIcon(tx.categoryIcon, tx.type)}
                                      </span>
                                    </div>
                                    <div>
                                      <div className="text-xs font-bold text-on-surface">
                                        {tx.note || tx.categoryName || 'Giao dịch'}
                                      </div>
                                      <div className="text-[11px] text-on-surface-variant flex items-center gap-2 mt-0.5">
                                        <span className="font-medium">{tx.categoryName}</span>
                                        <span>•</span>
                                        <span className="flex items-center gap-0.5">
                                          <span className="material-symbols-outlined text-[10px]">account_balance_wallet</span>
                                          {tx.walletName}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-3">
                                    <span className={`font-mono text-sm font-bold ${
                                      tx.type === 'INCOME' ? 'text-emerald-600' : 'text-primary'
                                    }`}>
                                      {tx.type === 'INCOME' ? '+' : '-'}{formatVND(tx.amount)}
                                    </span>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                      <button
                                        onClick={() => {
                                          setEditingTx(tx);
                                          setIsAddModalOpen(true);
                                        }}
                                        className="text-outline hover:text-primary transition-all p-1"
                                        title="Chỉnh sửa giao dịch"
                                      >
                                        <span className="material-symbols-outlined text-[18px]">edit</span>
                                      </button>
                                      <button
                                        onClick={() => handleDeleteTransaction(tx.id)}
                                        className="text-outline hover:text-primary transition-all p-1"
                                        title="Xóa giao dịch"
                                      >
                                        <span className="material-symbols-outlined text-[18px]">delete</span>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>

              {/* RIGHT 4 COLUMNS: VIP Net Worth, Wallets, and Insights */}
              <div className="lg:col-span-4 flex flex-col gap-6">

                {/* VIP Net Worth Card (Stitch Mockup) */}
                <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-surface-container-low to-primary-container/20 p-6 rounded-2xl border border-primary/20 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-primary uppercase tracking-wider">
                      Tổng tài sản thực (Net Worth)
                    </span>
                    <span className="material-symbols-outlined text-primary text-xl">workspace_premium</span>
                  </div>
                  <div className="text-2xl font-extrabold font-mono text-on-surface mb-2">
                    {formatVND(totalBalance)}
                  </div>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Xin chào <strong className="text-primary">{user?.fullName || 'VIP Member'}</strong>! Dòng tiền của bạn đang ở trạng thái an toàn.
                  </p>
                </div>

                {/* Wallets & Accounts Strip */}
                <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-lg">account_balance_wallet</span>
                      <h4 className="font-heading font-bold text-xs text-on-surface">Ví & Tài khoản</h4>
                    </div>
                    <button
                      onClick={() => navigate('/accounts')}
                      className="text-xs text-primary font-bold hover:underline"
                    >
                      Quản lý
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {accounts.length === 0 ? (
                      <p className="text-xs text-on-surface-variant text-center py-4">Chưa có tài khoản nào.</p>
                    ) : (
                      accounts.map(acc => (
                        <div
                          key={acc.id}
                          onClick={() => setSelectedAccountId(selectedAccountId === acc.id ? undefined : acc.id)}
                          className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                            selectedAccountId === acc.id
                              ? 'border-primary bg-primary/5 shadow-sm'
                              : 'border-outline-variant/20 bg-surface-container-lowest hover:bg-surface-container-low'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                              <span className="material-symbols-outlined text-base">
                                {(acc.type as string) === 'BANK' || acc.type === 'CHECKING' || acc.type === 'SAVINGS' ? 'account_balance' : (acc.type as string) === 'E_WALLET' ? 'phone_android' : acc.type === 'CREDIT' ? 'credit_card' : 'payments'}
                              </span>
                            </div>
                            <div>
                              <div className="text-xs font-bold text-on-surface">{acc.name}</div>
                              <div className="text-[10px] text-on-surface-variant uppercase">{acc.type}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-mono text-xs font-bold text-on-surface">
                              {formatVND(acc.balance || 0)}
                            </div>
                            {selectedAccountId === acc.id && (
                              <span className="text-[10px] text-primary font-bold">Đang lọc</span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <button
                    onClick={() => navigate('/accounts')}
                    className="w-full mt-4 py-2.5 bg-surface-container-low hover:bg-surface-container border border-outline-variant/30 rounded-xl text-xs font-bold text-on-surface flex items-center justify-center gap-2 transition-all"
                  >
                    <span className="material-symbols-outlined text-base">add_card</span>
                    Thêm tài khoản mới
                  </button>
                </div>

                {/* Financial Health Advisory Card */}
                <div className="bg-gradient-to-br from-primary/10 via-surface-container-low to-primary-container/20 p-5 rounded-2xl border border-primary/20 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="material-symbols-outlined text-primary text-xl">psychology</span>
                    <h4 className="font-heading font-bold text-sm text-on-surface">Đánh giá Sức khỏe Tài chính</h4>
                  </div>
                  <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
                    Dựa trên dữ liệu tháng này, tỷ lệ tiết kiệm của bạn đạt <strong className="text-primary">{savingsRate}%</strong>. Chi tiêu ăn uống và giải trí đang trong tầm kiểm soát an toàn.
                  </p>
                  <button 
                    onClick={() => navigate('/reports')}
                    className="w-full py-2.5 bg-primary hover:bg-primary/90 text-on-primary rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2"
                  >
                    Xem báo cáo chuyên sâu
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </button>
                </div>

              </div>

            </div>

          </div>
        </main>

        {/* Add / Edit Transaction Modal (Stitch Glassmorphism) */}
        <AddTransactionModal
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingTx(null);
          }}
          onSuccess={() => {
            fetchData();
            setEditingTx(null);
          }}
          initialTransaction={editingTx}
          accounts={accounts}
          categories={categories}
        />
      </div>
    </div>
  );
};
