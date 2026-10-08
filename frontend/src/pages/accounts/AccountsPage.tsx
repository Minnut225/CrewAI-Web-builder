import React, { useState, useEffect } from 'react';
import { AccountSummary, AccountType, AccountRequest } from '../../types/account';
import { accountService } from '../../services/accountService';
import Sidebar from '../../components/layout/Sidebar';
import { TopHeader } from '../../components/layout/TopHeader';

const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  CASH: 'Tiền mặt',
  CHECKING: 'Tài khoản thanh toán',
  SAVINGS: 'Tiết kiệm',
  CREDIT: 'Thẻ tín dụng',
  INVESTMENT: 'Đầu tư',
  LOAN: 'Khoản vay',
  OTHER: 'Khác'
};

const ACCOUNT_TYPE_ICONS: Record<AccountType, string> = {
  CASH: 'account_balance_wallet',
  CHECKING: 'account_balance',
  SAVINGS: 'savings',
  CREDIT: 'credit_card',
  INVESTMENT: 'trending_up',
  LOAN: 'request_quote',
  OTHER: 'account_balance_wallet'
};

export const AccountsPage: React.FC = () => {
  const [summary, setSummary] = useState<AccountSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showBalance, setShowBalance] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  // Month & Year state for TopHeader synchronization
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
  const [selectedAccountId, setSelectedAccountId] = useState<number | undefined>(undefined);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [amountStr, setAmountStr] = useState<string>('');

  // Form State
  const [formData, setFormData] = useState<AccountRequest>({
    name: '',
    type: 'CASH',
    balance: 0,
    currency: 'VND',
    color: '#006c4a',
    icon: 'account_balance_wallet'
  });

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await accountService.getAccounts();
      setSummary(data);
    } catch (err: any) {
      console.error('Failed to load accounts:', err);
      setError(err?.response?.data?.message || 'Không thể tải danh sách tài khoản từ máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (!raw) {
      setAmountStr('');
      setFormData(prev => ({ ...prev, balance: 0 }));
      return;
    }
    const num = parseInt(raw, 10);
    setAmountStr(num.toLocaleString('vi-VN'));
    setFormData(prev => ({ ...prev, balance: num }));
  };

  const handleOpenModal = (presetType?: AccountType) => {
    setFormData({
      name: '',
      type: presetType || 'CASH',
      balance: 0,
      currency: 'VND',
      color: presetType === 'CREDIT' ? '#b70011' : presetType === 'CHECKING' ? '#004ed0' : '#006c4a',
      icon: ACCOUNT_TYPE_ICONS[presetType || 'CASH']
    });
    setAmountStr('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('Vui lòng nhập tên tài khoản.');
      return;
    }

    try {
      setSubmitting(true);
      setFormError(null);
      await accountService.createAccount(formData);
      setIsModalOpen(false);
      await fetchAccounts();
    } catch (err: any) {
      console.error('Failed to create account:', err);
      setFormError(err?.response?.data?.message || 'Không thể tạo tài khoản mới.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleArchive = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn lưu trữ hoặc khóa tài khoản này?')) return;
    try {
      await accountService.archiveAccount(id);
      await fetchAccounts();
    } catch (err: any) {
      console.error('Failed to archive account:', err);
      alert(err?.response?.data?.message || 'Không thể lưu trữ tài khoản.');
    }
  };

  const formatVND = (amount: number) => {
    if (!showBalance) return '••••••••';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const accountsList = summary?.accounts || [];

  const filteredAccounts = accountsList.filter(acc => {
    const matchesSearch = acc.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'ALL' || acc.type === typeFilter;
    const matchesSelected = !selectedAccountId || acc.id === selectedAccountId;
    return matchesSearch && matchesType && matchesSelected;
  });

  // Categorize accounts for 3-Column Desktop Grid
  const cashAccounts = filteredAccounts.filter(a => a.type === 'CASH');
  const bankAccounts = filteredAccounts.filter(a => a.type === 'CHECKING' || a.type === 'SAVINGS' || a.type === 'INVESTMENT');
  const creditAccounts = filteredAccounts.filter(a => a.type === 'CREDIT' || a.type === 'LOAN' || a.type === 'OTHER');

  const netWorth = summary?.netWorth || 0;
  const totalAssets = summary?.totalAssets || 0;
  const totalLiabilities = summary?.totalLiabilities || 0;

  // Calculate allocation breakdown for Donut visual
  const cashTotal = accountsList.filter(a => a.type === 'CASH').reduce((sum, a) => sum + (a.balance || 0), 0);
  const bankTotal = accountsList.filter(a => a.type === 'CHECKING' || a.type === 'SAVINGS' || a.type === 'INVESTMENT').reduce((sum, a) => sum + (a.balance || 0), 0);
  const totalPositive = (cashTotal + bankTotal) || 1;
  const bankPct = Math.round((bankTotal / totalPositive) * 100);
  const cashPct = 100 - bankPct;

  return (
    <div className="min-h-screen bg-surface font-sans text-on-surface antialiased">
      {/* Stitch Design Dual-Rail Sidebar: Fixed w-72 */}
      <Sidebar onOpenAddModal={() => handleOpenModal('CASH')} />

      {/* Main Workspace container: Offset by lg:pl-72 */}
      <div className="lg:pl-72">
        {/* Stitch Design Top Header: Fixed h-20 */}
        <TopHeader
          currentMonth={currentMonth}
          setCurrentMonth={setCurrentMonth}
          currentYear={currentYear}
          setCurrentYear={setCurrentYear}
          selectedAccountId={selectedAccountId}
          setSelectedAccountId={setSelectedAccountId}
          accounts={accountsList.map(a => ({ id: a.id, name: a.name }))}
          onOpenAddModal={() => handleOpenModal('CASH')}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />

        {/* Main Content Area */}
        <main className="relative pt-20 bg-surface min-h-screen">
          <div className="w-full max-w-[1600px] mx-auto px-6 py-6 flex flex-col gap-6">

            {/* Top Action & Command Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black tracking-tight text-on-surface flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-primary text-[28px]">account_balance</span>
                  Quản lý Tài khoản & Tài sản ròng
                </h1>
                <p className="text-xs text-on-surface-variant mt-1">
                  Quản lý tất cả tài khoản ngân hàng, ví tiền mặt và theo dõi tổng tài sản ròng cá nhân.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowBalance(!showBalance)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-xl text-xs font-bold transition-all shadow-sm"
                  title={showBalance ? "Ẩn số dư" : "Hiện số dư"}
                >
                  <span className="material-symbols-outlined text-base">
                    {showBalance ? 'visibility' : 'visibility_off'}
                  </span>
                  <span>{showBalance ? 'Ẩn số dư' : 'Hiện số dư'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenModal('CASH')}
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-on-primary rounded-xl text-xs font-bold shadow-md shadow-primary/20 active:scale-98 transition-all"
                >
                  <span className="material-symbols-outlined text-base">add_card</span>
                  <span>+ Thêm tài khoản mới</span>
                </button>
              </div>
            </div>

            {/* Error banner if any */}
            {error && (
              <div className="p-4 bg-error-container/40 border border-error/30 rounded-2xl flex items-center justify-between text-on-error-container text-sm font-semibold">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-error">error</span>
                  <span>{error}</span>
                </div>
                <button onClick={fetchAccounts} className="underline text-xs">Thử lại</button>
              </div>
            )}

            {/* Hero Row: VIP Dark Gunmetal Net Worth Card + Allocation Donut Visual */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* VIP Dark Gunmetal Card: Net Worth (lg:col-span-8) */}
              <div className="lg:col-span-8 rounded-2xl bg-gradient-to-br from-[#1E293B] via-[#172134] to-[#0F172A] text-white p-6 sm:p-8 shadow-xl relative overflow-hidden flex flex-col justify-between border border-slate-800">
                {/* Decorative Background Glows */}
                <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>
                <div className="absolute right-12 bottom-8 w-44 h-44 rounded-full bg-primary/10 blur-2xl pointer-events-none"></div>

                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span className="text-[11px] uppercase tracking-wider text-slate-300 font-bold">
                        TÀI SẢN RÒNG HIỆN TẠI (NET WORTH)
                      </span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-white/10 text-slate-300 text-[10px] font-semibold backdrop-blur-sm">
                      Zero-Float VND
                    </span>
                  </div>

                  {/* Net Worth Big Metric */}
                  <div className="mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                    <div className="text-4xl sm:text-5xl font-black font-mono text-white tracking-tight">
                      {formatVND(netWorth)}
                    </div>
                    <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-bold">
                      <span className="material-symbols-outlined text-sm">trending_up</span>
                      <span>{accountsList.length} tài khoản đang quản lý</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    Tổng tài sản thực có trừ đi các nghĩa vụ nợ tín dụng và khoản vay.
                  </p>
                </div>

                {/* Financial Equation Breakdown Strip */}
                <div className="mt-6 pt-4 bg-slate-900/60 rounded-xl p-4 backdrop-blur-md border border-white/5">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex flex-col">
                      <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">● Tổng tài sản thực có</span>
                      <div className="text-xl font-black font-mono text-white mt-1">
                        {formatVND(totalAssets)}
                      </div>
                      <span className="text-[11px] text-slate-400 mt-0.5">Tiền mặt, ngân hàng & đầu tư</span>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-[11px] uppercase tracking-wider text-rose-300 font-bold">● Khoản nợ / Dư nợ thẻ</span>
                      <div className="text-xl font-black font-mono text-rose-300 mt-1">
                        {formatVND(totalLiabilities)}
                      </div>
                      <span className="text-[11px] text-slate-400 mt-0.5">Thẻ tín dụng & vay nợ</span>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-[11px] uppercase tracking-wider text-emerald-300 font-bold">● Thặng dư ròng</span>
                      <div className="text-xl font-black font-mono text-emerald-300 mt-1">
                        {formatVND(netWorth)}
                      </div>
                      <span className="text-[11px] text-slate-400 mt-0.5">
                        Tỷ lệ thanh khoản: {totalAssets > 0 ? Math.round(((totalAssets - totalLiabilities) / totalAssets) * 100) : 100}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Allocation Donut Visual Card (lg:col-span-4) */}
              <div className="lg:col-span-4 bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/20 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-on-surface">Phân bổ dòng vốn</span>
                  <span className="text-[11px] text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-md">
                    Tự động
                  </span>
                </div>

                <div className="flex items-center gap-6 my-4">
                  {/* Inline Donut Chart */}
                  <div className="relative w-28 h-28 shrink-0">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <circle className="stroke-surface-container" cx="18" cy="18" fill="none" r="15.915" strokeWidth="4.5" />
                      {/* Bank Segment */}
                      <circle
                        cx="18" cy="18" fill="none" r="15.915" stroke="#004ed0"
                        strokeDasharray={`${bankPct}, 100`}
                        strokeDashoffset="0"
                        strokeWidth="4.5"
                      />
                      {/* Cash Segment */}
                      <circle
                        cx="18" cy="18" fill="none" r="15.915" stroke="#006c4a"
                        strokeDasharray={`${cashPct}, 100`}
                        strokeDashoffset={`-${bankPct}`}
                        strokeWidth="4.5"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-[10px] text-on-surface-variant font-bold">Tổng ví</span>
                      <span className="text-base font-extrabold text-on-surface">{accountsList.length}</span>
                    </div>
                  </div>

                  {/* Allocation Details Legend */}
                  <div className="flex flex-col gap-2 flex-1 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#004ed0]"></span>
                        <span className="text-on-surface font-medium">Ngân hàng</span>
                      </div>
                      <span className="font-mono font-bold text-on-surface">{bankPct}%</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#006c4a]"></span>
                        <span className="text-on-surface font-medium">Tiền mặt</span>
                      </div>
                      <span className="font-mono font-bold text-on-surface">{cashPct}%</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
                        <span className="text-on-surface font-medium">Khoản nợ</span>
                      </div>
                      <span className="font-mono font-bold text-primary">{formatVND(totalLiabilities)}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-outline-variant/10 flex items-center justify-between text-xs text-on-surface-variant">
                  <span>Trạng thái vốn:</span>
                  <strong className="text-emerald-600 font-bold">Cân bằng & An toàn</strong>
                </div>
              </div>

            </div>

            {/* Filter Pills & Type Switcher */}
            <div className="bg-surface-container-lowest p-3 rounded-2xl border border-outline-variant/20 shadow-sm flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setTypeFilter('ALL')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  typeFilter === 'ALL'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
                }`}
              >
                Tất cả ({accountsList.length})
              </button>
              {Object.entries(ACCOUNT_TYPE_LABELS).map(([typeKey, typeLabel]) => {
                const count = accountsList.filter(a => a.type === typeKey).length;
                return (
                  <button
                    key={typeKey}
                    type="button"
                    onClick={() => setTypeFilter(typeKey)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      typeFilter === typeKey
                        ? 'bg-primary text-on-primary shadow-sm'
                        : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
                    }`}
                  >
                    {typeLabel} {count > 0 && `(${count})`}
                  </button>
                );
              })}
            </div>

            {/* 3-Column Desktop Accounts Grid (Stitch Sections) */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-lg text-on-surface tracking-tight">
                    Hệ thống Tài khoản thanh toán & Thẻ
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant text-[11px] font-bold">
                    3 Nhóm chính
                  </span>
                </div>
              </div>

              {loading ? (
                <div className="py-16 text-center text-on-surface-variant text-sm flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                  Đang tải danh sách tài khoản...
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-start">

                  {/* COLUMN 1: TIỀN MẶT (CASH) */}
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#006c4a]"></span>
                        <span className="text-xs uppercase tracking-wider text-on-surface font-extrabold">TIỀN MẶT</span>
                      </div>
                      <span className="text-xs text-on-surface-variant">{cashAccounts.length} ví</span>
                    </div>

                    {cashAccounts.map(account => (
                      <div
                        key={account.id}
                        className="p-5 rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md border border-outline-variant/20 transition-all flex flex-col justify-between gap-4 group"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shadow-sm">
                              <span className="material-symbols-outlined text-2xl">account_balance_wallet</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-base text-on-surface">{account.name}</span>
                              <span className="text-xs text-on-surface-variant">Ví tiêu dùng hàng ngày</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                              Khả dụng
                            </span>
                            <button
                              type="button"
                              onClick={() => handleArchive(account.id)}
                              className="text-on-surface-variant hover:text-error opacity-0 group-hover:opacity-100 transition-opacity p-1"
                              title="Khóa/Xóa ví"
                            >
                              <span className="material-symbols-outlined text-base">delete</span>
                            </button>
                          </div>
                        </div>

                        <div className="flex flex-col pt-1">
                          <span className="text-[11px] uppercase tracking-wider text-on-surface-variant font-medium">Số dư thực tế</span>
                          <div className="text-2xl font-black font-mono text-on-surface mt-1">
                            {formatVND(account.balance)}
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Add Cash CTA button */}
                    <button
                      type="button"
                      onClick={() => handleOpenModal('CASH')}
                      className="p-3.5 rounded-xl border border-dashed border-outline-variant/40 hover:border-primary/50 bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-on-surface flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-base">add</span>
                      <span>Thêm ví tiền mặt phụ (Heo đất, Ngoại tệ)</span>
                    </button>
                  </div>

                  {/* COLUMN 2: TÀI KHOẢN NGÂN HÀNG (BANK ACCOUNTS) */}
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#004ed0]"></span>
                        <span className="text-xs uppercase tracking-wider text-on-surface font-extrabold">TÀI KHOẢN NGÂN HÀNG</span>
                      </div>
                      <span className="text-xs text-on-surface-variant">{bankAccounts.length} tài khoản</span>
                    </div>

                    {bankAccounts.map(account => (
                      <div
                        key={account.id}
                        className="p-5 rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md border border-outline-variant/20 transition-all flex flex-col justify-between gap-4 group"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#004ed0] flex items-center justify-center shadow-sm">
                              <span className="material-symbols-outlined text-2xl">account_balance</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-base text-on-surface">{account.name}</span>
                              <span className="text-xs text-on-surface-variant">{ACCOUNT_TYPE_LABELS[account.type] || 'Ngân hàng'}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold">
                              24/7 Napas
                            </span>
                            <button
                              type="button"
                              onClick={() => handleArchive(account.id)}
                              className="text-on-surface-variant hover:text-error opacity-0 group-hover:opacity-100 transition-opacity p-1"
                              title="Khóa/Xóa tài khoản"
                            >
                              <span className="material-symbols-outlined text-base">delete</span>
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <div className="flex flex-col">
                            <span className="text-[11px] uppercase tracking-wider text-on-surface-variant font-medium">Số dư khả dụng</span>
                            <div className="text-2xl font-black font-mono text-[#004ed0] mt-1">
                              {formatVND(account.balance)}
                            </div>
                          </div>
                          <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                            100% Khả dụng
                          </span>
                        </div>
                      </div>
                    ))}

                    {/* Add Bank CTA button */}
                    <button
                      type="button"
                      onClick={() => handleOpenModal('CHECKING')}
                      className="p-3.5 rounded-xl border border-dashed border-outline-variant/40 hover:border-[#004ed0]/50 bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-on-surface flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-base text-[#004ed0]">account_balance</span>
                      <span>+ Thêm tài khoản ngân hàng mới</span>
                    </button>
                  </div>

                  {/* COLUMN 3: THẺ TÍN DỤNG & KHOẢN NỢ (CREDIT / LIABILITIES) */}
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
                        <span className="text-xs uppercase tracking-wider text-on-surface font-extrabold">THẺ TÍN DỤNG & KHOẢN NỢ</span>
                      </div>
                      <span className="text-xs text-on-surface-variant">{creditAccounts.length} mục</span>
                    </div>

                    {creditAccounts.length === 0 ? (
                      <div className="p-6 rounded-2xl bg-surface-container-lowest border border-dashed border-outline-variant/30 text-center text-xs text-on-surface-variant">
                        Chưa có thẻ tín dụng hoặc khoản nợ nào được ghi nhận.
                      </div>
                    ) : (
                      creditAccounts.map(account => (
                        <div
                          key={account.id}
                          className="p-5 rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md border border-outline-variant/20 transition-all flex flex-col justify-between gap-4 group"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-11 h-11 rounded-xl bg-rose-50 text-primary flex items-center justify-center shadow-sm">
                                <span className="material-symbols-outlined text-2xl">credit_card</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="font-bold text-base text-on-surface">{account.name}</span>
                                <span className="text-xs text-on-surface-variant">{ACCOUNT_TYPE_LABELS[account.type]}</span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleArchive(account.id)}
                              className="text-on-surface-variant hover:text-error opacity-0 group-hover:opacity-100 transition-opacity p-1"
                              title="Khóa/Xóa thẻ"
                            >
                              <span className="material-symbols-outlined text-base">delete</span>
                            </button>
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <div className="flex flex-col">
                              <span className="text-[11px] uppercase tracking-wider text-on-surface-variant font-medium">Dư nợ hiện tại</span>
                              <div className="text-2xl font-black font-mono text-primary mt-1">
                                {formatVND(account.balance)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}

                    {/* Add Credit CTA button */}
                    <button
                      type="button"
                      onClick={() => handleOpenModal('CREDIT')}
                      className="p-3.5 rounded-xl border border-dashed border-outline-variant/40 hover:border-primary/50 bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-on-surface flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-base text-primary">add_card</span>
                      <span>+ Thêm thẻ tín dụng hoặc khoản vay</span>
                    </button>
                  </div>

                </div>
              )}
            </div>

          </div>
        </main>
      </div>

      {/* Modal Thêm tài khoản mới (Stitch Glassmorphism Design) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all duration-300 animate-in fade-in">
          <section className="bg-surface-container-lowest w-full max-w-xl rounded-3xl shadow-2xl border border-outline-variant/20 flex flex-col max-h-[95vh] overflow-hidden">
            
            {/* Modal Header */}
            <header className="px-7 pt-6 pb-4 border-b border-outline-variant/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl">account_balance_wallet</span>
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-on-surface">Thêm tài khoản mới</h3>
                  <p className="text-xs text-on-surface-variant">Khởi tạo ví tiền mặt, thẻ ngân hàng hoặc thẻ tín dụng mới</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-9 h-9 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface-variant flex items-center justify-center transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </header>

            {/* Modal Body Form */}
            <form onSubmit={handleCreateAccount} className="p-7 space-y-5 overflow-y-auto flex-1">
              {formError && (
                <div className="p-3.5 bg-error-container/40 border border-error/30 rounded-xl text-on-error-container text-xs font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-base text-error">error</span>
                  <span>{formError}</span>
                </div>
              )}

              {/* Account Type Selection */}
              <div>
                <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-2">
                  Loại tài khoản tài chính <span className="text-primary">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['CASH', 'CHECKING', 'SAVINGS', 'CREDIT', 'INVESTMENT', 'LOAN'] as AccountType[]).map((typeKey) => {
                    const isSelected = formData.type === typeKey;
                    return (
                      <button
                        key={typeKey}
                        type="button"
                        onClick={() => setFormData(prev => ({ 
                          ...prev, 
                          type: typeKey,
                          icon: ACCOUNT_TYPE_ICONS[typeKey]
                        }))}
                        className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-primary text-on-primary border-primary shadow-sm'
                            : 'bg-surface-container-low hover:bg-surface-container border-outline-variant/30 text-on-surface'
                        }`}
                      >
                        <span className="material-symbols-outlined text-xl">{ACCOUNT_TYPE_ICONS[typeKey]}</span>
                        <span className="text-xs font-bold truncate">{ACCOUNT_TYPE_LABELS[typeKey]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Account Name */}
              <div>
                <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                  Tên tài khoản / Ngân hàng <span className="text-primary">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ví dụ: Techcombank Priority, Ví heo đất, Thẻ VPBank..."
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm font-semibold text-on-surface focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
                  required
                />
              </div>

              {/* Initial Balance */}
              <div>
                <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                  Số dư ban đầu ({formData.type === 'CREDIT' || formData.type === 'LOAN' ? 'Dư nợ' : 'Khả dụng'})
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={amountStr}
                    onChange={handleAmountChange}
                    placeholder="0"
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-2.5 pr-12 text-lg font-mono font-bold text-on-surface focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-on-surface-variant text-sm">
                    ₫
                  </span>
                </div>
              </div>

              {/* Footer Buttons */}
              <footer className="pt-4 border-t border-outline-variant/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container text-xs font-bold transition-all cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-on-primary text-xs font-bold shadow-md shadow-primary/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-base">check</span>
                      Lưu tài khoản
                    </>
                  )}
                </button>
              </footer>
            </form>
          </section>
        </div>
      )}
    </div>
  );
};

export default AccountsPage;
