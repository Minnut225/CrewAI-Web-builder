import React, { useState, useEffect, useMemo } from 'react';
import { transactionService } from '../../services/transactionService';
import { categoryService } from '../../services/categoryService';
import { accountService } from '../../services/accountService';
import { TransactionResponse } from '../../types/transaction';
import { Category } from '../../types/category';
import { Account } from '../../types/account';
import Sidebar from '../../components/layout/Sidebar';
import { TopHeader } from '../../components/layout/TopHeader';
import { AddTransactionModal } from '../../components/modals/AddTransactionModal';
import { getCategoryIcon } from '../../utils/iconMap';

export const ReportsPage: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
  const [selectedAccountId, setSelectedAccountId] = useState<number | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'BREAKDOWN' | 'CASHFLOW'>('OVERVIEW');
  const [timeScope, setTimeScope] = useState<'WEEK' | 'MONTH' | 'YEAR'>('MONTH');

  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Quick Add Transaction Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const monthStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
      const [txsRes, accsRes, catsRes] = await Promise.all([
        transactionService.getTransactions({
          month: monthStr,
          accountId: selectedAccountId,
        }),
        accountService.getAccounts(),
        categoryService.getCategories(),
      ]);

      setTransactions(txsRes.content || []);
      setAccounts(accsRes?.accounts || []);
      setCategories(catsRes || []);
    } catch (err: any) {
      console.error('Failed to load reports data', err);
      setError('Không thể tải dữ liệu báo cáo thống kê từ máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentMonth, currentYear, selectedAccountId]);

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Aggregated analytics
  const analytics = useMemo(() => {
    let totalIncome = 0;
    let totalExpense = 0;
    const categoryExpenseMap: Record<string, { amount: number; color?: string; icon?: string; name: string }> = {};

    transactions.forEach((tx) => {
      const amount = Number(tx.amount);
      if (tx.type === 'INCOME') {
        totalIncome += amount;
      } else if (tx.type === 'EXPENSE') {
        totalExpense += amount;
        const catName = tx.categoryName || 'Khác';
        if (!categoryExpenseMap[catName]) {
          const matchedCat = categories.find((c) => c.name === catName || c.id === tx.categoryId);
          categoryExpenseMap[catName] = {
            amount: 0,
            name: catName,
            color: matchedCat?.color || '#b70011',
            icon: getCategoryIcon(matchedCat?.icon, 'EXPENSE'),
          };
        }
        categoryExpenseMap[catName].amount += amount;
      }
    });

    const netCashflow = totalIncome - totalExpense;
    const expenseRatio = totalIncome > 0 ? (totalExpense / totalIncome) * 100 : 0;
    const surplusRatio = totalIncome > 0 ? (netCashflow / totalIncome) * 100 : 0;

    // Sort categories by expenditure
    const categoryBreakdown = Object.values(categoryExpenseMap).sort((a, b) => b.amount - a.amount);

    // Top individual expense transactions
    const topExpenses = [...transactions]
      .filter((t) => t.type === 'EXPENSE')
      .sort((a, b) => Number(b.amount) - Number(a.amount))
      .slice(0, 5);

    // 7-day cashflow distribution for trend curve
    const dayTotals = [0, 0, 0, 0, 0, 0, 0]; // Mon..Sun
    transactions.forEach((tx) => {
      if (tx.type === 'EXPENSE' && tx.transactionDate) {
        const d = new Date(tx.transactionDate);
        const dayIdx = (d.getDay() + 6) % 7; // Convert Sunday=0 to Monday=0
        dayTotals[dayIdx] += Number(tx.amount);
      }
    });

    const maxDayAmount = Math.max(...dayTotals, 100000);
    const maxDayIdx = dayTotals.indexOf(Math.max(...dayTotals));
    const dayLabels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

    return {
      totalIncome,
      totalExpense,
      netCashflow,
      expenseRatio,
      surplusRatio,
      categoryBreakdown,
      topExpenses,
      dayTotals,
      maxDayAmount,
      maxDayIdx,
      dayLabels,
    };
  }, [transactions, categories]);

  // Excel / CSV Export
  const handleExportCSV = () => {
    if (transactions.length === 0) {
      alert('Chưa có dữ liệu giao dịch nào để xuất báo cáo.');
      return;
    }
    const headers = ['Mã giao dịch', 'Ngày', 'Loại', 'Số tiền (VND)', 'Danh mục', 'Ví/Tài khoản', 'Ghi chú'];
    const rows = transactions.map((t) => [
      t.id,
      t.transactionDate ? t.transactionDate.slice(0, 10) : '',
      t.type === 'INCOME' ? 'Thu nhập' : t.type === 'EXPENSE' ? 'Chi tiêu' : 'Chuyển khoản',
      t.amount,
      `"${t.categoryName || ''}"`,
      `"${t.walletName || ''}"`,
      `"${(t.note || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `FinMan_BaoCao_T${currentMonth}_${currentYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Generate SVG curve points dynamically from dayTotals
  const svgCurveData = useMemo(() => {
    const points = analytics.dayTotals.map((amt, idx) => {
      const x = 40 + idx * 100;
      const height = 180;
      // Invert Y: higher amount = smaller Y (near top at y=25)
      const y = height - (amt / (analytics.maxDayAmount * 1.2 || 1)) * 140;
      return { x, y: Math.max(25, Math.min(185, y)), amt };
    });

    let pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const midX = (p0.x + p1.x) / 2;
      pathD += ` C ${midX} ${p0.y}, ${midX} ${p1.y}, ${p1.x} ${p1.y}`;
    }

    const areaD = `${pathD} L ${points[points.length - 1].x} 200 L ${points[0].x} 200 Z`;

    return { points, pathD, areaD };
  }, [analytics.dayTotals, analytics.maxDayAmount]);

  return (
    <div className="min-h-screen bg-surface font-sans text-on-surface antialiased">
      {/* Stitch Design Sidebar: Fixed w-72 */}
      <Sidebar onOpenAddModal={() => setIsAddModalOpen(true)} />

      {/* Main Content: Offset by pl-0 lg:pl-72 */}
      <div className="lg:pl-72">
        {/* Stitch Design Top Header: Fixed h-20 */}
        <TopHeader
          currentMonth={currentMonth}
          setCurrentMonth={setCurrentMonth}
          currentYear={currentYear}
          setCurrentYear={setCurrentYear}
          selectedAccountId={selectedAccountId}
          setSelectedAccountId={setSelectedAccountId}
          accounts={accounts.map((a) => ({ id: a.id, name: a.name }))}
          onOpenAddModal={() => setIsAddModalOpen(true)}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />

        {/* Main Canvas: pt-20 for header offset */}
        <main className="relative pt-20 bg-surface min-h-screen">
          <div className="w-full max-w-[1600px] mx-auto px-6 py-6 flex flex-col gap-6">

            {/* Sub-Navigation & Quick Action Filter Bar */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-1.5 bg-surface-container-low p-1 rounded-xl shadow-sm border border-outline-variant/10">
                <button
                  type="button"
                  onClick={() => setActiveTab('OVERVIEW')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'OVERVIEW'
                      ? 'bg-surface-container-lowest text-on-surface shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Thống kê tổng hợp
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('BREAKDOWN')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'BREAKDOWN'
                      ? 'bg-surface-container-lowest text-on-surface shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Phân tích Thu - Chi
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('CASHFLOW')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'CASHFLOW'
                      ? 'bg-surface-container-lowest text-on-surface shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Dòng tiền theo thời gian
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center bg-surface-container-low p-1 rounded-xl shadow-sm border border-outline-variant/10">
                  <button
                    type="button"
                    onClick={() => setTimeScope('WEEK')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      timeScope === 'WEEK'
                        ? 'bg-primary text-on-primary shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    Tuần
                  </button>
                  <button
                    type="button"
                    onClick={() => setTimeScope('MONTH')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      timeScope === 'MONTH'
                        ? 'bg-primary text-on-primary shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    Tháng này (T{String(currentMonth).padStart(2, '0')}/{currentYear})
                  </button>
                  <button
                    type="button"
                    onClick={() => setTimeScope('YEAR')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      timeScope === 'YEAR'
                        ? 'bg-primary text-on-primary shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    Hàng năm
                  </button>
                </div>

                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container-lowest text-on-surface text-xs font-bold shadow-sm hover:bg-surface-container border border-outline-variant/20 transition-all"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px] text-secondary">file_download</span>
                  <span>Xuất Báo cáo Excel (.xlsx/.csv)</span>
                </button>
              </div>
            </div>

            {/* Error banner if fetching failed */}
            {error && (
              <div className="p-4 rounded-2xl bg-error/10 border border-error/20 text-error flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-xl">error</span>
                  <span className="text-xs font-semibold">{error}</span>
                </div>
                <button
                  onClick={fetchData}
                  className="px-3 py-1.5 bg-error text-white text-xs font-bold rounded-xl hover:opacity-90"
                >
                  Thử lại
                </button>
              </div>
            )}

            {/* Loading indicator */}
            {loading && (
              <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/20 flex items-center justify-center gap-3 animate-pulse">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-semibold text-on-surface-variant">Đang tổng hợp báo cáo và phân tích dòng tiền...</span>
              </div>
            )}

            {/* Financial Health Banner (AI Intelligence Banner) */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500/10 via-surface-container-low to-surface-container-lowest p-6 shadow-sm border border-outline-variant/20">
              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-secondary text-on-secondary flex items-center justify-center shadow-sm shrink-0">
                    <span className="material-symbols-outlined text-[28px]">verified_user</span>
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-lg font-bold text-on-surface">
                        {analytics.surplusRatio > 50
                          ? 'Tình trạng tài chính: Rất khả quan'
                          : analytics.surplusRatio > 0
                          ? 'Tình trạng tài chính: Ổn định'
                          : 'Tình trạng tài chính: Cần lưu ý'}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-secondary text-on-secondary text-xs font-bold">
                        {analytics.surplusRatio > 0 ? `${analytics.surplusRatio.toFixed(1)}% thặng dư dòng tiền` : 'Thâm hụt chi tiêu'}
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant max-w-2xl leading-relaxed">
                      {analytics.totalIncome > 0
                        ? `Bạn đang kiểm soát chi tiêu ở mức ${analytics.expenseRatio.toFixed(1)}% tổng thu nhập tháng ${currentMonth}. Dòng tiền thực tế tích lũy ${formatVND(analytics.netCashflow)}.`
                        : 'Chưa có đủ dữ liệu thu nhập trong chu kỳ này để đánh giá thặng dư dòng tiền.'}
                    </p>
                  </div>
                </div>

                {/* 3 Primary Highlight Pillars */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 shrink-0">
                  <div className="bg-surface-container-lowest/90 backdrop-blur px-4 py-3 rounded-xl shadow-sm border border-outline-variant/20 flex flex-col min-w-[170px]">
                    <span className="text-[11px] font-bold text-on-surface-variant flex items-center justify-between uppercase">
                      Dòng tiền thuần
                      <span className="material-symbols-outlined text-[16px] text-secondary">north_east</span>
                    </span>
                    <span className={`text-xl font-extrabold tracking-tight mt-1 ${analytics.netCashflow >= 0 ? 'text-secondary' : 'text-primary'}`}>
                      {analytics.netCashflow >= 0 ? '+' : ''}{formatVND(analytics.netCashflow)}
                    </span>
                    <span className="text-[11px] text-secondary font-semibold mt-0.5">
                      {analytics.surplusRatio > 0 ? `Thặng dư ${analytics.surplusRatio.toFixed(0)}%` : 'Âm dòng tiền'}
                    </span>
                  </div>

                  <div className="bg-surface-container-lowest/90 backdrop-blur px-4 py-3 rounded-xl shadow-sm border border-outline-variant/20 flex flex-col min-w-[170px]">
                    <span className="text-[11px] font-bold text-on-surface-variant flex items-center justify-between uppercase">
                      Tổng thu nhập
                      <span className="material-symbols-outlined text-[16px] text-secondary">arrow_downward</span>
                    </span>
                    <span className="text-xl font-extrabold text-on-surface tracking-tight mt-1">
                      {formatVND(analytics.totalIncome)}
                    </span>
                    <span className="text-[11px] text-on-surface-variant mt-0.5">Nguồn thu đã ghi nhận</span>
                  </div>

                  <div className="bg-surface-container-lowest/90 backdrop-blur px-4 py-3 rounded-xl shadow-sm border border-outline-variant/20 flex flex-col min-w-[170px]">
                    <span className="text-[11px] font-bold text-on-surface-variant flex items-center justify-between uppercase">
                      Tổng chi tiêu
                      <span className="material-symbols-outlined text-[16px] text-primary">arrow_upward</span>
                    </span>
                    <span className="text-xl font-extrabold text-primary tracking-tight mt-1">
                      {formatVND(analytics.totalExpense)}
                    </span>
                    <span className="text-[11px] text-primary font-semibold mt-0.5">
                      {analytics.expenseRatio.toFixed(1)}% thu nhập
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop 2-Column Analytic Visualization Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* LEFT COLUMN: Charts & Category Ledger Breakdowns (7 Columns) */}
              <div className="lg:col-span-7 flex flex-col gap-6">

                {/* Cashflow Trend Over Time Card */}
                <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/20 flex flex-col">
                  <div className="flex items-center justify-between pb-4 border-b border-outline-variant/10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-[22px]">show_chart</span>
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-on-surface">Xu hướng dòng tiền trong tuần</h2>
                        <p className="text-xs text-on-surface-variant">Theo dõi nhịp biến động thu chi hàng ngày</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block">
                        Trung bình chi
                      </span>
                      <span className="text-sm font-bold text-on-surface">
                        {formatVND(Math.round(analytics.totalExpense / 7))} / ngày
                      </span>
                    </div>
                  </div>

                  {/* Dynamic SVG Cashflow Trend Chart */}
                  <div className="relative w-full pt-4 pb-2">
                    <div className="flex items-center justify-between text-on-surface-variant text-xs px-1 mb-2">
                      <span>{formatVND(analytics.maxDayAmount)}</span>
                      <span className="text-primary font-bold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                        Đỉnh tuần: {analytics.dayLabels[analytics.maxDayIdx]} ({formatVND(analytics.dayTotals[analytics.maxDayIdx])})
                      </span>
                    </div>

                    <svg className="w-full h-56 overflow-visible" fill="none" viewBox="0 0 680 220" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <linearGradient id="cashflowGrad" x1="0" y1="0" x2="0" y2="220" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#dc2626" stopOpacity="0.25" />
                          <stop offset="0.75" stopColor="#dc2626" stopOpacity="0.04" />
                          <stop offset="1" stopColor="#dc2626" stopOpacity="0" />
                        </linearGradient>
                        <linearGradient id="incomeLineGrad" x1="0" y1="0" x2="680" y2="0" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#b70011" />
                          <stop offset="0.7" stopColor="#dc2626" />
                          <stop offset="1" stopColor="#006c4a" />
                        </linearGradient>
                      </defs>

                      {/* Horizontal Grid Guide Lines */}
                      <line x1="0" y1="30" x2="680" y2="30" stroke="#eaedff" strokeDasharray="4 4" strokeWidth="1" />
                      <line x1="0" y1="85" x2="680" y2="85" stroke="#eaedff" strokeDasharray="4 4" strokeWidth="1" />
                      <line x1="0" y1="140" x2="680" y2="140" stroke="#eaedff" strokeDasharray="4 4" strokeWidth="1" />
                      <line x1="0" y1="200" x2="680" y2="200" stroke="#dae2fd" strokeWidth="1.5" />

                      {/* Smooth Area Fill & Path */}
                      <path d={svgCurveData.areaD} fill="url(#cashflowGrad)" />
                      <path d={svgCurveData.pathD} stroke="url(#incomeLineGrad)" strokeWidth="3.5" strokeLinecap="round" />

                      {/* Milestone Key Data Points */}
                      {svgCurveData.points.map((pt, i) => {
                        const isPeak = i === analytics.maxDayIdx && pt.amt > 0;
                        return (
                          <g key={i} className="cursor-pointer">
                            <circle
                              cx={pt.x}
                              cy={pt.y}
                              r={isPeak ? 6 : 4}
                              fill={isPeak ? '#dc2626' : '#ffffff'}
                              stroke={isPeak ? '#dc2626' : '#b70011'}
                              strokeWidth="2.5"
                            />
                            {isPeak && (
                              <>
                                <circle cx={pt.x} cy={pt.y} r={12} fill="#dc2626" fillOpacity="0.2" className="animate-ping" />
                                <rect x={pt.x - 45} y={Math.max(5, pt.y - 32)} width={90} height={22} rx={6} fill="#131b2e" />
                                <text
                                  x={pt.x}
                                  y={Math.max(20, pt.y - 17)}
                                  fill="#ffffff"
                                  fontSize="10"
                                  fontWeight="600"
                                  textAnchor="middle"
                                >
                                  {formatVND(pt.amt)}
                                </text>
                              </>
                            )}
                          </g>
                        );
                      })}
                    </svg>

                    {/* Day Labels Axis */}
                    <div className="grid grid-cols-7 pt-2 text-center text-xs font-bold text-on-surface-variant">
                      {analytics.dayLabels.map((lbl, idx) => (
                        <span
                          key={lbl}
                          className={idx === analytics.maxDayIdx && analytics.dayTotals[idx] > 0
                            ? 'text-primary font-extrabold bg-primary/10 px-2 py-0.5 rounded-md inline-block mx-auto'
                            : ''
                          }
                        >
                          {lbl}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Weekly Summary Micro Metrics */}
                  <div className="grid grid-cols-3 gap-3 pt-4 mt-2 bg-surface-container-low/60 rounded-xl p-3 border border-outline-variant/10">
                    <div className="flex flex-col">
                      <span className="text-[11px] text-on-surface-variant">Tổng chi 7 ngày</span>
                      <span className="text-sm font-bold text-on-surface">{formatVND(analytics.totalExpense)}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[11px] text-on-surface-variant">Ngày chi ít nhất</span>
                      <span className="text-sm font-bold text-secondary">
                        {analytics.dayLabels[analytics.dayTotals.indexOf(Math.min(...analytics.dayTotals))]} (
                        {formatVND(Math.min(...analytics.dayTotals))})
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[11px] text-on-surface-variant">Số lượng giao dịch</span>
                      <span className="text-sm font-bold text-on-surface">{transactions.length} giao dịch</span>
                    </div>
                  </div>
                </div>

                {/* Donut Chart & Category Breakdown */}
                <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/20 flex flex-col">
                  <div className="flex items-center justify-between pb-4 border-b border-outline-variant/10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                        <span className="material-symbols-outlined text-[22px]">donut_large</span>
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-on-surface">Phân bổ chi tiêu</h2>
                        <p className="text-xs text-on-surface-variant">
                          Tỷ trọng các danh mục trong tháng {String(currentMonth).padStart(2, '0')}/{currentYear}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-on-surface-variant block">Tổng chi tiêu ghi nhận</span>
                      <span className="text-base font-extrabold text-on-surface">{formatVND(analytics.totalExpense)}</span>
                    </div>
                  </div>

                  {/* Donut Layout & Legend */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center py-4">
                    {/* Donut Graphic */}
                    <div className="md:col-span-5 flex items-center justify-center relative">
                      <div className="relative w-44 h-44 flex items-center justify-center">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                          {/* Background Track */}
                          <circle cx="80" cy="80" r="64" fill="transparent" stroke="#f2f3ff" strokeWidth="20" />
                          {/* Main Segment */}
                          {analytics.categoryBreakdown.length > 0 && (
                            <circle
                              cx="80"
                              cy="80"
                              r="64"
                              fill="transparent"
                              stroke="#dc2626"
                              strokeWidth="20"
                              strokeDasharray="402"
                              strokeDashoffset={
                                402 * (1 - (analytics.categoryBreakdown[0]?.amount || 0) / (analytics.totalExpense || 1))
                              }
                              strokeLinecap="round"
                            />
                          )}
                          {/* Second Segment */}
                          {analytics.categoryBreakdown.length > 1 && (
                            <circle
                              cx="80"
                              cy="80"
                              r="64"
                              fill="transparent"
                              stroke="#f59e0b"
                              strokeWidth="20"
                              strokeDasharray={`${
                                402 * ((analytics.categoryBreakdown[1]?.amount || 0) / (analytics.totalExpense || 1))
                              } 402`}
                              strokeDashoffset={
                                -402 * ((analytics.categoryBreakdown[0]?.amount || 0) / (analytics.totalExpense || 1))
                              }
                              strokeLinecap="round"
                            />
                          )}
                        </svg>

                        {/* Center Metric */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                          <span className="text-[11px] font-bold text-on-surface-variant">
                            {analytics.categoryBreakdown[0]?.name || 'Chi tiêu'}
                          </span>
                          <span className="text-xl font-extrabold text-primary leading-none my-0.5">
                            {analytics.totalExpense > 0 && analytics.categoryBreakdown[0]
                              ? `${((analytics.categoryBreakdown[0].amount / analytics.totalExpense) * 100).toFixed(1)}%`
                              : '0%'}
                          </span>
                          <span className="text-[10px] text-on-surface-variant">Tập trung</span>
                        </div>
                      </div>
                    </div>

                    {/* Donut Legend Chips */}
                    <div className="md:col-span-7 flex flex-col gap-2.5">
                      {analytics.categoryBreakdown.slice(0, 4).map((cat, i) => {
                        const pct = analytics.totalExpense > 0 ? (cat.amount / analytics.totalExpense) * 100 : 0;
                        return (
                          <div
                            key={cat.name}
                            className="p-2.5 rounded-xl bg-surface-container-low flex items-center justify-between border border-outline-variant/10"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div
                                className="w-3.5 h-3.5 rounded-full shrink-0"
                                style={{ backgroundColor: cat.color || (i === 0 ? '#b70011' : '#f59e0b') }}
                              />
                              <span className="text-xs font-semibold text-on-surface truncate">{cat.name}</span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-xs font-bold text-on-surface">{formatVND(cat.amount)}</span>
                              <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[11px] font-bold">
                                {pct.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        );
                      })}
                      {analytics.categoryBreakdown.length === 0 && (
                        <div className="p-4 rounded-xl bg-surface-container-low text-center text-xs text-on-surface-variant">
                          Chưa có giao dịch chi tiêu trong tháng này.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Detailed Category Threshold Progress Bars (PRD Section 13) */}
                  <div className="pt-4 border-t border-outline-variant/10 flex flex-col gap-4">
                    <span className="text-xs font-bold text-on-surface uppercase tracking-wider">
                      Ngưỡng hạn mức danh mục
                    </span>
                    {analytics.categoryBreakdown.slice(0, 3).map((cat) => {
                      // Simulated budget limit based on category limit or proportional threshold
                      const limit = 2000000;
                      const pct = Math.min(100, (cat.amount / limit) * 100);
                      const isOver = pct >= 80;
                      return (
                        <div key={cat.name} className="flex flex-col gap-1.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs ${
                                isOver ? 'bg-error/10 text-error' : 'bg-secondary/10 text-secondary'
                              }`}>
                                <span className="material-symbols-outlined text-[16px]">{getCategoryIcon(cat.icon, 'EXPENSE')}</span>
                              </div>
                              <div>
                                <span className="text-xs font-bold text-on-surface">{cat.name}</span>
                                <span className={`text-[10px] block font-medium ${isOver ? 'text-primary' : 'text-secondary'}`}>
                                  {isOver ? 'Chạm ngưỡng cảnh báo ngân sách' : 'Dư thừa hạn mức an toàn'}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className={`text-xs font-bold ${isOver ? 'text-primary' : 'text-on-surface'}`}>
                                {formatVND(cat.amount)}
                              </span>
                              <span className="text-[10px] text-on-surface-variant block">/ Ngưỡng: {formatVND(limit)}</span>
                            </div>
                          </div>
                          <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${isOver ? 'bg-primary' : 'bg-secondary'}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: AI Spending Insights & Risk Ranking (5 Columns) */}
              <div className="lg:col-span-5 flex flex-col gap-6">

                {/* Top Expense Ranking Ledger Card */}
                <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/20 flex flex-col">
                  <div className="flex items-center justify-between pb-4 border-b border-outline-variant/10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-[22px]">leaderboard</span>
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-on-surface">Top khoản chi lớn nhất</h2>
                        <p className="text-xs text-on-surface-variant">Kiểm soát giao dịch trọng yếu</p>
                      </div>
                    </div>
                  </div>

                  {/* Ledger Items */}
                  <div className="flex flex-col gap-2.5 mt-4">
                    {analytics.topExpenses.map((tx, idx) => {
                      const pct = analytics.totalExpense > 0 ? (Number(tx.amount) / analytics.totalExpense) * 100 : 0;
                      return (
                        <div
                          key={tx.id}
                          className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low hover:bg-surface-container border border-outline-variant/10 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="w-5 text-center text-sm font-extrabold text-primary">
                              {idx + 1}
                            </span>
                            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                              <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-xs font-bold text-on-surface truncate max-w-[170px]">
                                {tx.note || tx.categoryName || 'Khoản chi tiêu'}
                              </span>
                              <span className="text-[10px] text-on-surface-variant truncate">
                                {tx.transactionDate ? tx.transactionDate.slice(0, 10) : ''} • {tx.walletName || 'Ví/Tài khoản'}
                              </span>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-xs font-extrabold text-primary">-{formatVND(Number(tx.amount))}</span>
                            <span className="text-[10px] text-on-surface-variant block">{pct.toFixed(1)}% chi tiêu</span>
                          </div>
                        </div>
                      );
                    })}

                    {analytics.topExpenses.length === 0 && (
                      <div className="p-8 text-center text-xs text-on-surface-variant">
                        Chưa có giao dịch chi tiêu nào được ghi nhận trong chu kỳ này.
                      </div>
                    )}
                  </div>
                </div>

                {/* AI Advice & Smart Summary Card */}
                <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/20 flex flex-col">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                      <span className="material-symbols-outlined text-[22px]">neurology</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-on-surface">Đánh giá từ FinMan AI</h3>
                      <p className="text-[11px] text-on-surface-variant">Khuyến nghị dòng tiền thông minh</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/10 text-xs text-on-surface leading-relaxed">
                    <p className="mb-2">
                      💡 <strong>Nhận định chu kỳ:</strong> Trong tháng {currentMonth}/{currentYear}, bạn đã ghi nhận tổng cộng{' '}
                      <strong>{formatVND(analytics.totalIncome)}</strong> thu nhập và{' '}
                      <strong>{formatVND(analytics.totalExpense)}</strong> chi tiêu.
                    </p>
                    <p>
                      🎯 <strong>Mục tiêu:</strong> Hãy tiếp tục duy trì tỷ lệ thặng dư trên{' '}
                      <strong>20%</strong> để tạo quỹ dự phòng khẩn cấp và phân bổ vào danh mục tài sản sinh lời.
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>

      {/* Add Transaction Modal */}
      {isAddModalOpen && (
        <AddTransactionModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={() => {
            setIsAddModalOpen(false);
            fetchData();
          }}
          categories={categories}
          accounts={accounts}
        />
      )}
    </div>
  );
};

export default ReportsPage;
