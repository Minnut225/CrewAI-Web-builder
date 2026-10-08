import React, { useState, useEffect } from 'react';
import { UpsertBudgetRequest } from '../../types/budget';
import { budgetService } from '../../services/budgetService';
import { categoryService } from '../../services/categoryService';
import { Category } from '../../types/category';
import { getCategoryIcon } from '../../utils/iconMap';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialMonth: string;
  editData?: {
    categoryId: number;
    categoryName: string;
    limitAmount: number;
  } | null;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMonth,
  editData,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<number>(editData?.categoryId || 0);
  const [month, setMonth] = useState<string>(initialMonth || '2026-09');
  const [limitAmount, setLimitAmount] = useState<string>(editData ? editData.limitAmount.toLocaleString('vi-VN') : '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchExpenseCategories();
      if (editData) {
        setCategoryId(editData.categoryId);
        setLimitAmount(editData.limitAmount.toLocaleString('vi-VN'));
      } else {
        setLimitAmount('');
      }
      setMonth(initialMonth);
      setError(null);
    }
  }, [isOpen, editData, initialMonth]);

  const fetchExpenseCategories = async () => {
    try {
      const data = await categoryService.getCategories();
      const expenseCats = (data || []).filter((c) => c.type === 'EXPENSE');
      setCategories(expenseCats);
      if (expenseCats.length > 0 && !categoryId && !editData) {
        setCategoryId(expenseCats[0].id);
      }
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId) {
      setError('Vui lòng chọn danh mục chi tiêu');
      return;
    }
    const numericLimit = parseInt(limitAmount.replace(/\D/g, ''), 10);
    if (isNaN(numericLimit) || numericLimit <= 0) {
      setError('Hạn mức ngân sách phải lớn hơn 0 đ');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const payload: UpsertBudgetRequest = {
        categoryId: Number(categoryId),
        month,
        limitAmount: numericLimit,
      };
      await budgetService.upsertBudget(payload);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Có lỗi xảy ra khi lưu ngân sách');
    } finally {
      setLoading(false);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    if (rawValue === '') {
      setLimitAmount('');
      return;
    }
    const num = parseInt(rawValue, 10);
    setLimitAmount(num.toLocaleString('vi-VN'));
  };

  const selectedCategoryObj = categories.find((c) => c.id === categoryId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-surface-container-lowest rounded-3xl shadow-2xl border border-outline-variant/30 w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-outline-variant/10 flex items-center justify-between bg-surface-container-low/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-sm">
              <span className="material-symbols-outlined text-[22px]">account_balance_wallet</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-on-surface">
                {editData ? 'Chỉnh sửa hạn mức ngân sách' : 'Thiết lập ngân sách mới'}
              </h3>
              <p className="text-xs text-on-surface-variant">Kiểm soát chi tiêu theo tháng</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface transition-colors p-1.5 rounded-xl hover:bg-surface-container"
            type="button"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-error/10 border border-error/20 text-error rounded-xl text-xs font-semibold flex items-center gap-2">
              <span className="material-symbols-outlined text-base">error</span>
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
              Kỳ ngân sách
            </label>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/20 rounded-xl text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all text-xs font-bold"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
              Danh mục chi tiêu
            </label>
            <div className="relative">
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(Number(e.target.value))}
                disabled={!!editData}
                className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/20 rounded-xl text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all text-xs font-semibold disabled:opacity-60 appearance-none"
                required
              >
                <option value="" disabled>-- Chọn danh mục chi tiêu --</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px] pointer-events-none">
                expand_more
              </span>
            </div>

            {selectedCategoryObj && (
              <div className="flex items-center gap-2 mt-2 px-3 py-1.5 rounded-lg bg-surface-container-low text-xs text-on-surface-variant">
                <span className="material-symbols-outlined text-sm text-primary">
                  {getCategoryIcon(selectedCategoryObj.icon, 'EXPENSE')}
                </span>
                <span>Danh mục: <strong className="text-on-surface">{selectedCategoryObj.name}</strong></span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
              Hạn mức tối đa (VND)
            </label>
            <div className="relative">
              <input
                type="text"
                value={limitAmount}
                onChange={handleAmountChange}
                placeholder="Ví dụ: 2.000.000"
                className="w-full pl-4 pr-10 py-3 bg-surface-container-low border border-outline-variant/20 rounded-xl text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all font-mono font-bold text-lg"
                required
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold text-sm">
                ₫
              </span>
            </div>
            <p className="text-[11px] text-on-surface-variant mt-1">
              Hệ thống sẽ gửi cảnh báo khi chi tiêu đạt trên 80% hạn mức này.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-outline-variant/20 text-on-surface-variant hover:text-on-surface hover:bg-surface-container text-xs font-bold transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary/90 transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-60"
            >
              {loading && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              <span>Lưu ngân sách</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BudgetModal;
