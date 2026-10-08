import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import { TopHeader } from '../../components/layout/TopHeader';
import { budgetService } from '../../services/budgetService';
import { BudgetSummaryResponse, BudgetCategoryItem } from '../../types/budget';
import { BudgetModal } from '../../components/budget/BudgetModal';
import { getCategoryIcon } from '../../utils/iconMap';

export const BudgetPage: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
  const [summary, setSummary] = useState<BudgetSummaryResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState<'ALL' | 'WARNING'>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editData, setEditData] = useState<{
    categoryId: number;
    categoryName: string;
    limitAmount: number;
  } | null>(null);

  const monthStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;

  const fetchBudgetSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await budgetService.getBudgetSummary(monthStr);
      setSummary(data);
    } catch (err: any) {
      console.error('Failed to load budget summary:', err);
      setError('Không thể tải dữ liệu ngân sách. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgetSummary();
  }, [currentMonth, currentYear]);

  const handleOpenAddModal = () => {
    setEditData(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: BudgetCategoryItem) => {
    setEditData({
      categoryId: item.categoryId,
      categoryName: item.categoryName,
      limitAmount: item.limitAmount,
    });
    setIsModalOpen(true);
  };

  const handleDeleteBudget = async (categoryId: number) => {
    const targetItem = summary?.categories.find((c) => c.categoryId === categoryId);
    if (!targetItem || !targetItem.budgetId) {
      alert('Danh mục này chưa được thiết lập hạn mức để xóa.');
      return;
    }
    if (!window.confirm(`Bạn có chắc chắn muốn xóa hạn mức ngân sách của danh mục "${targetItem.categoryName}" không?`)) {
      return;
    }
    try {
      await budgetService.deleteBudget(targetItem.budgetId);
      fetchBudgetSummary();
    } catch (err: any) {
      console.error('Failed to delete budget:', err);
      alert('Xóa ngân sách thất bại: ' + (err.response?.data?.message || err.message));
    }
  };

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Calculations for KPI gauge
  const totalBudget = summary?.totalBudget || summary?.totalLimit || 0;
  const totalSpent = summary?.totalSpent || 0;
  const totalRemaining = summary?.totalRemaining || Math.max(0, totalBudget - totalSpent);
  const spentPct = totalBudget > 0 ? Math.min(100, Math.round((totalSpent / totalBudget) * 100)) : (totalSpent > 0 ? 100 : 0);
  const safePct = Math.max(0, 100 - spentPct);

  // Filtered categories
  const filteredCategories = useMemo(() => {
    if (!summary?.categories) return [];
    return summary.categories.filter((item) => {
      const matchesSearch = searchTerm.trim() === '' || 
        item.categoryName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterTab === 'ALL' || item.status === 'WARNING' || item.status === 'OVERBUDGET';
      return matchesSearch && matchesFilter;
    });
  }, [summary?.categories, filterTab, searchTerm]);

  // Warning count
  const warningCount = (summary?.categories || []).filter(
    (c) => c.status === 'WARNING' || c.status === 'OVERBUDGET'
  ).length;

  return (
    <div className="min-h-screen bg-surface font-sans text-on-surface antialiased">
      {/* Stitch Design Sidebar: Fixed w-72 */}
      <Sidebar onOpenAddModal={handleOpenAddModal} />

      {/* Main Content: Offset by pl-0 lg:pl-72 */}
      <div className="lg:pl-72">
        {/* Stitch Design Top Header: Fixed h-20 */}
        <TopHeader
          title="Quản lý Ngân sách"
          currentMonth={currentMonth}
          setCurrentMonth={setCurrentMonth}
          currentYear={currentYear}
          setCurrentYear={setCurrentYear}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onOpenAddModal={handleOpenAddModal}
        />

        {/* Main Canvas: pt-20 for header offset */}
        <main className="relative pt-20 bg-surface min-h-screen">
          <div className="w-full max-w-[1600px] mx-auto px-6 py-6 flex flex-col gap-6">

            {/* Top Command Action Bar */}
            <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-sm">
                  <span className="material-symbols-outlined text-[28px]">account_balance_wallet</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-secondary">
                      Kiểm soát rủi ro dòng tiền
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                    <span className="text-xs font-medium text-on-surface-variant">
                      Kỳ T{String(currentMonth).padStart(2, '0')}/{currentYear}
                    </span>
                  </div>
                  <h1 className="text-2xl font-bold tracking-tight text-on-surface">
                    Quản lý Ngân sách chi tiêu
                  </h1>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    Thiết lập định mức chi tiêu theo danh mục để kiểm soát tài chính và hạn chế lãng phí.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleOpenAddModal}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary font-semibold text-sm shadow-sm hover:bg-primary/90 active:scale-[0.98] transition-all"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px]">add_circle</span>
                  <span>Thiết lập ngân sách mới</span>
                </button>
              </div>
            </div>

            {/* Error banner if any */}
            {error && (
              <div className="p-4 rounded-2xl bg-error/10 border border-error/20 text-error flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-xl">error</span>
                  <span className="text-xs font-semibold">{error}</span>
                </div>
                <button
                  onClick={fetchBudgetSummary}
                  className="px-3 py-1.5 bg-error text-white text-xs font-bold rounded-xl hover:opacity-90"
                >
                  Thử lại
                </button>
              </div>
            )}

            {/* Loading Skeleton */}
            {loading ? (
              <div className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/20 flex items-center justify-center gap-3 animate-pulse">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-semibold text-on-surface-variant">Đang tải dữ liệu hạn mức ngân sách...</span>
              </div>
            ) : summary && (
              <>
                {/* Primary Budget Health Dashboard & VIP Metric Stack */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                  {/* Main Aggregate Spend Gauge (8 Cols) */}
                  <div className="xl:col-span-8 bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/20 flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-emerald-500/10 pointer-events-none blur-2xl"></div>

                    <div>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                            Hạn mức chi tiêu tổng thể
                          </span>
                          <span className="text-3xl font-extrabold text-on-surface mt-1">
                            {formatVND(totalBudget)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-700 text-xs font-bold border border-emerald-500/20">
                          <span className="material-symbols-outlined text-[16px]">verified_user</span>
                          <span>Mức độ an toàn: {safePct}%</span>
                        </div>
                      </div>

                      {/* Big Visual Multi-Segment Progress Indicator */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-primary flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block"></span>
                            Đã sử dụng {spentPct}% ({formatVND(totalSpent)})
                          </span>
                          <span className="text-secondary flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-secondary inline-block"></span>
                            Khả dụng {formatVND(totalRemaining)}
                          </span>
                        </div>
                        <div className="w-full h-3.5 bg-surface-container rounded-full overflow-hidden flex p-0.5">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${
                              spentPct > 100 ? 'bg-primary' : spentPct >= 80 ? 'bg-amber-500' : 'bg-secondary'
                            }`}
                            style={{ width: `${Math.min(100, spentPct)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Quick Metrics Ribbon */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4 bg-surface-container-low/60 rounded-xl px-4 py-3 border border-outline-variant/10">
                      <div className="flex flex-col">
                        <span className="text-[11px] text-on-surface-variant font-medium">Đã giải ngân tháng này</span>
                        <span className="text-sm font-bold text-primary mt-0.5">-{formatVND(totalSpent)}</span>
                        <span className="text-[10px] text-on-surface-variant">Tháng {currentMonth}/{currentYear}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] text-on-surface-variant font-medium">Chi tiêu dự kiến/ngày</span>
                        <span className="text-sm font-bold text-on-surface mt-0.5">
                          ~ {formatVND(Math.round(totalRemaining / 30))} / ngày
                        </span>
                        <span className="text-[10px] text-secondary font-semibold">Tốc độ an toàn</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] text-on-surface-variant font-medium">Tình trạng danh mục</span>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <span className="px-2 py-0.5 rounded-md bg-error/10 text-error text-[10px] font-bold">
                            {summary.statusBreakdown?.OVERBUDGET || 0} Chạm trần
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 text-[10px] font-bold">
                            {summary.statusBreakdown?.WARNING || 0} Cảnh báo
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-secondary/10 text-secondary text-[10px] font-bold">
                            {summary.statusBreakdown?.NORMAL || 0} An toàn
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AI Advisor Insight Widget (4 Cols) */}
                  <div className="xl:col-span-4 bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/20 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                          <span className="material-symbols-outlined text-[22px]">neurology</span>
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-on-surface">FinMan AI Trợ lý Ngân sách</h3>
                          <p className="text-[11px] text-on-surface-variant">Phân tích nhịp độ giải ngân</p>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-surface-container-low text-xs text-on-surface leading-relaxed border border-outline-variant/10 space-y-2">
                        {warningCount > 0 ? (
                          <p className="text-error font-medium">
                            ⚠️ Bạn đang có <strong>{warningCount} danh mục</strong> tiêu vượt quá 80% hoặc đã cạn ngân sách. Hãy cân nhắc cắt giảm chi tiêu phát sinh ở các nhóm này.
                          </p>
                        ) : (
                          <p className="text-secondary font-medium">
                            ✅ Tuyệt vời! Tất cả các danh mục chi tiêu đều đang trong vùng an toàn (dưới 80% hạn mức).
                          </p>
                        )}
                        <p className="text-on-surface-variant">
                          💡 <strong>Lời khuyên:</strong> Hãy duy trì hạn mức dự phòng tối thiểu 20% cho các nhu cầu đột xuất cuối tháng.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleOpenAddModal}
                      className="mt-4 w-full py-2.5 px-4 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-base">tune</span>
                      <span>Điều chỉnh hạn mức danh mục</span>
                    </button>
                  </div>
                </div>

                {/* Main Content: Categories List with Progress Bars */}
                <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/20 flex flex-col gap-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-outline-variant/10">
                    <div className="flex items-center gap-3">
                      <h3 className="text-base font-bold text-on-surface">Danh mục chi tiêu chi tiết</h3>
                      <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-xs font-bold">
                        {summary.categories?.length || 0} danh mục
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setFilterTab('ALL')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          filterTab === 'ALL'
                            ? 'bg-surface-container-high text-on-surface shadow-sm'
                            : 'text-on-surface-variant hover:text-on-surface'
                        }`}
                      >
                        Tất cả
                      </button>
                      <button
                        type="button"
                        onClick={() => setFilterTab('WARNING')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                          filterTab === 'WARNING'
                            ? 'bg-primary text-on-primary shadow-sm'
                            : 'text-on-surface-variant hover:text-on-surface'
                        }`}
                      >
                        <span>Cảnh báo</span>
                        {warningCount > 0 && (
                          <span className="px-1.5 py-0.2 bg-white/20 text-white rounded text-[10px]">
                            {warningCount}
                          </span>
                        )}
                      </button>
                    </div>
                  </div>

                  {filteredCategories.length === 0 ? (
                    <div className="py-12 text-center text-on-surface-variant text-xs">
                      Không có danh mục nào khớp với bộ lọc hiện tại.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {filteredCategories.map((item) => {
                        const isOver = item.status === 'OVERBUDGET';
                        const isWarn = item.status === 'WARNING';
                        const hasBudget = (item.limitAmount || 0) > 0;
                        const pct = Math.min(100, item.percentage || 0);

                        return (
                          <div
                            key={item.categoryId}
                            className="p-5 rounded-2xl bg-surface-container-low/50 hover:bg-surface-container-low border border-outline-variant/10 transition-all flex flex-col justify-between gap-3 shadow-sm"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 min-w-0">
                                <div
                                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-sm shrink-0"
                                  style={{ backgroundColor: item.categoryColor || (isOver ? '#b70011' : isWarn ? '#d97706' : '#006c4a') }}
                                >
                                  <span className="material-symbols-outlined text-[24px]">
                                    {getCategoryIcon(item.categoryIcon, 'EXPENSE')}
                                  </span>
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <h4 className="text-sm font-bold text-on-surface truncate">
                                      {item.categoryName}
                                    </h4>
                                    <span
                                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                        isOver
                                          ? 'bg-error/10 text-error border border-error/20'
                                          : isWarn
                                          ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                                          : hasBudget
                                          ? 'bg-secondary/10 text-secondary border border-secondary/20'
                                          : 'bg-surface-container text-on-surface-variant'
                                      }`}
                                    >
                                      {isOver ? 'Hết hạn mức' : isWarn ? 'Sắp chạm trần' : hasBudget ? 'An toàn' : 'Chưa đặt hạn mức'}
                                    </span>
                                  </div>
                                  <span className="text-xs text-on-surface-variant block mt-0.5">
                                    Đã tiêu: <strong>{formatVND(item.spentAmount || 0)}</strong>
                                    {hasBudget ? ` / Hạn mức: ${formatVND(item.limitAmount)}` : ''}
                                  </span>
                                </div>
                              </div>

                              <div className="text-right shrink-0">
                                <span
                                  className={`text-base font-extrabold font-mono ${
                                    isOver ? 'text-primary' : isWarn ? 'text-amber-600' : 'text-secondary'
                                  }`}
                                >
                                  {hasBudget ? `${item.percentage}%` : '-'}
                                </span>
                                <div className="text-[11px] text-on-surface-variant">
                                  {hasBudget ? (
                                    <>Còn lại: <strong className="text-on-surface">{formatVND(item.remainingAmount || item.remaining || 0)}</strong></>
                                  ) : (
                                    'Không giới hạn'
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Progress Bar */}
                            {hasBudget && (
                              <div className="w-full h-2.5 rounded-full bg-surface-container-high overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    isOver ? 'bg-primary' : isWarn ? 'bg-amber-500' : 'bg-secondary'
                                  }`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            )}

                            {/* Actions footer */}
                            <div className="flex items-center justify-end gap-2 pt-1 border-t border-outline-variant/10">
                              <button
                                onClick={() => handleOpenEditModal(item)}
                                className="px-3 py-1 rounded-lg text-xs font-semibold text-primary hover:bg-primary/10 transition-colors flex items-center gap-1"
                                type="button"
                              >
                                <span className="material-symbols-outlined text-[14px]">edit</span>
                                <span>{hasBudget ? 'Sửa hạn mức' : 'Đặt hạn mức'}</span>
                              </button>
                              {hasBudget && (
                                <button
                                  onClick={() => handleDeleteBudget(item.categoryId)}
                                  className="px-2 py-1 rounded-lg text-xs font-semibold text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors"
                                  type="button"
                                  title="Xóa hạn mức"
                                >
                                  <span className="material-symbols-outlined text-[14px]">delete</span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            )}

          </div>
        </main>
      </div>

      {/* Budget Modal */}
      <BudgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          fetchBudgetSummary();
        }}
        initialMonth={monthStr}
        editData={editData}
      />
    </div>
  );
};

export default BudgetPage;
