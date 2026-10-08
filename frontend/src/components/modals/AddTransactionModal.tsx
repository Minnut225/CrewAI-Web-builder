import React, { useState, useEffect } from 'react';
import { TransactionType, CategoryResponseDTO, WalletResponseDTO, Category, Account } from '../../types/transaction';
import { transactionService } from '../../services/transactionService';
import { categoryService } from '../../services/categoryService';
import { accountService } from '../../services/accountService';
import { getCategoryIcon } from '../../utils/iconMap';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  defaultType?: TransactionType;
  accounts?: (WalletResponseDTO | Account)[];
  categories?: (CategoryResponseDTO | Category)[];
  categoriesProp?: (CategoryResponseDTO | Category)[];
  initialTransaction?: (any) | null;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultType = 'EXPENSE',
  accounts,
  categories: categoriesPropInput,
  categoriesProp,
  initialTransaction = null
}) => {
  const [activeTab, setActiveTab] = useState<TransactionType>(defaultType);
  const [amountStr, setAmountStr] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedWallet, setSelectedWallet] = useState<number | null>(null);
  const [transactionDate, setTransactionDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [note, setNote] = useState<string>('');
  const [receiptUrl, setReceiptUrl] = useState<string>('');

  const [categories, setCategories] = useState<CategoryResponseDTO[]>([]);
  const [wallets, setWallets] = useState<WalletResponseDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync defaultType or initialTransaction when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialTransaction) {
        setActiveTab(initialTransaction.type || defaultType);
        setAmountStr(initialTransaction.amount ? initialTransaction.amount.toLocaleString('vi-VN') : '');
        setSelectedCategory(initialTransaction.categoryId || null);
        setSelectedWallet(initialTransaction.accountId || initialTransaction.walletId || null);
        setNote(initialTransaction.note || '');
        setReceiptUrl(initialTransaction.receiptUrl || '');
        setTransactionDate(
          initialTransaction.transactionDate
            ? initialTransaction.transactionDate.slice(0, 10)
            : new Date().toISOString().slice(0, 10)
        );
      } else {
        setActiveTab(defaultType);
        setAmountStr('');
        setSelectedCategory(null);
        setNote('');
        setReceiptUrl('');
        setTransactionDate(new Date().toISOString().slice(0, 10));
      }
      setErrorMsg(null);
      fetchMetaData();
    }
  }, [isOpen, defaultType, initialTransaction]);

  // Fetch categories & wallets
  const fetchMetaData = async () => {
    try {
      setLoading(true);
      const passedCats = categoriesPropInput || categoriesProp;
      const catsPromise = (passedCats && passedCats.length > 0)
        ? Promise.resolve(passedCats)
        : categoryService.getCategories();

      const accsPromise = (accounts && accounts.length > 0)
        ? Promise.resolve(accounts)
        : accountService.getAccounts().then(summary => summary?.accounts || []);

      const [catData, walletData] = await Promise.all([catsPromise, accsPromise]);
      setCategories(catData as CategoryResponseDTO[]);
      setWallets(walletData as WalletResponseDTO[]);
      if (walletData.length > 0 && !selectedWallet) {
        setSelectedWallet(walletData[0].id);
      }
    } catch (err: any) {
      console.error('Failed to load transaction metadata:', err);
      setErrorMsg('Không thể tải danh mục hoặc tài khoản ví.');
    } finally {
      setLoading(false);
    }
  };

  // Filter categories by active tab (INCOME vs EXPENSE)
  const filteredCategories = categories.filter(c => c.type === activeTab);

  // Quick amount chips based on Stitch UI & zero-float Vnd
  const quickChips = activeTab === 'EXPENSE' 
    ? [50000, 100000, 200000, 500000, 1000000, 2000000, 5000000]
    : [100000, 500000, 1000000, 2000000, 5000000, 10000000, 20000000];

  const handleQuickAdd = (val: number) => {
    const current = parseInt(amountStr.replace(/\D/g, ''), 10) || 0;
    const nextVal = current + val;
    setAmountStr(nextVal.toLocaleString('vi-VN'));
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (!raw) {
      setAmountStr('');
      return;
    }
    const num = parseInt(raw, 10);
    setAmountStr(num.toLocaleString('vi-VN'));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanAmount = parseInt(amountStr.replace(/\D/g, ''), 10);
    if (!cleanAmount || cleanAmount <= 0) {
      setErrorMsg('Vui lòng nhập số tiền hợp lệ lớn hơn 0đ.');
      return;
    }
    if (!selectedCategory) {
      setErrorMsg('Vui lòng chọn danh mục giao dịch.');
      return;
    }
    if (!selectedWallet) {
      setErrorMsg('Vui lòng chọn tài khoản ví thanh toán.');
      return;
    }

    try {
      setSubmitting(true);
      const formattedDate = transactionDate.slice(0, 10);

      if (initialTransaction && initialTransaction.id) {
        await transactionService.updateTransaction(initialTransaction.id, {
          accountId: selectedWallet,
          walletId: selectedWallet,
          categoryId: selectedCategory,
          amount: cleanAmount,
          type: activeTab,
          transactionDate: formattedDate,
          note: note.trim() || undefined,
          receiptUrl: receiptUrl.trim() || undefined
        });
      } else {
        await transactionService.createTransaction({
          accountId: selectedWallet,
          walletId: selectedWallet,
          categoryId: selectedCategory,
          amount: cleanAmount,
          type: activeTab,
          transactionDate: formattedDate,
          note: note.trim() || undefined,
          receiptUrl: receiptUrl.trim() || undefined
        });
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Failed to save transaction:', err);
      setErrorMsg(err.response?.data?.message || 'Có lỗi xảy ra khi lưu giao dịch.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // Theme colors adapting dynamically between EXPENSE (red/rose) and INCOME (emerald/green)
  const isExpense = activeTab === 'EXPENSE';

  const activeTabClass = isExpense
    ? 'bg-red-600 text-white shadow-md shadow-red-500/20'
    : 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20';

  return (
    <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-md z-50 flex items-center justify-center p-4 lg:p-6 transition-all duration-300 animate-in fade-in">
      <section className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-100 flex flex-col max-h-[95vh] overflow-hidden">
        
        {/* Modal Header */}
        <header className="relative px-7 pt-6 pb-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-inner ${isExpense ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
              <span className="material-symbols-rounded text-2xl">
                {isExpense ? 'payments' : 'account_balance_wallet'}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                {initialTransaction ? 'Chỉnh sửa giao dịch' : 'Thêm giao dịch mới'}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {initialTransaction ? 'Cập nhật thông tin giao dịch tài chính' : 'Ghi nhận khoản thu hoặc chi tiêu vào hệ thống tài chính'}
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Đóng"
          >
            <span className="material-symbols-rounded text-xl">close</span>
          </button>
        </header>

        {/* Modal Body form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-7 py-6 space-y-6">
          
          {/* Error alert if any */}
          {errorMsg && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl flex items-center justify-between text-red-700 text-sm font-semibold">
              <div className="flex items-center gap-2">
                <span className="material-symbols-rounded text-red-500">error</span>
                <span>{errorMsg}</span>
              </div>
              <button type="button" onClick={() => setErrorMsg(null)} className="text-red-400 hover:text-red-700">
                <span className="material-symbols-rounded text-base">close</span>
              </button>
            </div>
          )}

          {/* Type Switcher Tabs (Chi tiêu | Thu nhập) */}
          <div className="bg-slate-100 p-1.5 rounded-2xl flex max-w-md mx-auto shadow-inner">
            <button
              type="button"
              onClick={() => { setActiveTab('EXPENSE'); setSelectedCategory(null); }}
              className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                isExpense ? activeTabClass : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-rounded text-lg">arrow_downward</span>
              Chi tiêu (Expense)
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('INCOME'); setSelectedCategory(null); }}
              className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                !isExpense ? activeTabClass : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-rounded text-lg">arrow_upward</span>
              Thu nhập (Income)
            </button>
          </div>

          {/* Big Amount Hero Input */}
          <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-5 text-center transition-all focus-within:bg-white focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-slate-400 shadow-sm">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Số tiền giao dịch ({isExpense ? 'Chi ra' : 'Thu vào'})
            </label>
            <div className="flex items-center justify-center gap-2">
              <input
                type="text"
                value={amountStr}
                onChange={handleAmountChange}
                placeholder="0"
                className={`w-full max-w-lg bg-transparent text-4xl lg:text-5xl font-black text-center tracking-tight focus:outline-none ${isExpense ? 'text-red-600' : 'text-emerald-600'}`}
                autoFocus
              />
              <span className={`text-2xl lg:text-3xl font-extrabold ${isExpense ? 'text-red-600' : 'text-emerald-600'}`}>
                đ
              </span>
            </div>

            {/* Quick Amount Chips */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4 pt-3 border-t border-slate-200/60">
              <span className="text-xs font-bold text-slate-400 uppercase mr-1">Nhanh:</span>
              {quickChips.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => handleQuickAdd(chip)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    isExpense 
                      ? 'bg-white border-red-200 text-red-600 hover:bg-red-50' 
                      : 'bg-white border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                  }`}
                >
                  +{chip >= 1000000 ? `${chip / 1000000}M` : `${chip / 1000}k`}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setAmountStr('')}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-200 text-slate-700 hover:bg-slate-300 transition-all cursor-pointer"
              >
                Xóa (C)
              </button>
            </div>
          </div>

          {/* Grid Layout for Category & Wallet Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Category Selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Danh mục giao dịch <span className="text-red-500">*</span>
                </label>
                <span className="text-xs text-slate-400">({filteredCategories.length} danh mục)</span>
              </div>

              {loading ? (
                <div className="py-8 text-center text-slate-400 text-sm">Đang tải danh mục...</div>
              ) : filteredCategories.length === 0 ? (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-slate-500 text-sm">
                  Chưa có danh mục {isExpense ? 'chi tiêu' : 'thu nhập'} nào.
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2.5 max-h-56 overflow-y-auto p-1 bg-slate-50/50 border border-slate-200 rounded-2xl">
                  {filteredCategories.map((cat) => {
                    const isSelected = selectedCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all cursor-pointer ${
                          isSelected 
                            ? (isExpense 
                                ? 'bg-red-50 border-red-500 text-red-700 ring-2 ring-red-500/20 shadow-sm' 
                                : 'bg-emerald-50 border-emerald-500 text-emerald-700 ring-2 ring-emerald-500/20 shadow-sm')
                            : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-100/60'
                        }`}
                      >
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white mb-1.5 shadow-sm"
                          style={{ backgroundColor: cat.color || (isExpense ? '#ef4444' : '#10b981') }}
                        >
                          <span className="material-symbols-rounded text-xl">{getCategoryIcon(cat.icon, isExpense ? 'EXPENSE' : 'INCOME')}</span>
                        </div>
                        <span className="text-xs font-bold text-center truncate w-full">{cat.name}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Wallet & Date & Note Column */}
            <div className="space-y-4">
              
              {/* Wallet Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Tài khoản thanh toán <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedWallet || ''}
                    onChange={(e) => setSelectedWallet(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all appearance-none cursor-pointer"
                  >
                    {wallets.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.type === 'CASH' ? '💵' : w.type === 'BANK' ? '🏛️' : '💳'} {w.name} (Khả dụng: {w.balance.toLocaleString('vi-VN')} {w.currency || 'đ'})
                      </option>
                    ))}
                  </select>
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none material-symbols-rounded">
                    expand_more
                  </span>
                </div>
              </div>

              {/* Date & Time Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Thời gian giao dịch
                </label>
                <div className="flex gap-2">
                  <input
                    type="datetime-local"
                    value={transactionDate}
                    onChange={(e) => setTransactionDate(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setTransactionDate(new Date().toISOString().slice(0, 16))}
                    className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
                  >
                    Hôm nay
                  </button>
                </div>
              </div>

              {/* Note input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Ghi chú / Mô tả chi tiết
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                  placeholder="Ví dụ: Ăn trưa văn phòng với đồng nghiệp..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all resize-none"
                />
              </div>

            </div>

          </div>

          {/* Modal Footer Buttons */}
          <footer className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-sm transition-all cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`px-6 py-2.5 rounded-xl text-white font-bold text-sm shadow-lg transition-all flex items-center gap-2 cursor-pointer ${
                isExpense 
                  ? 'bg-red-600 hover:bg-red-700 shadow-red-500/25' 
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/25'
              } ${submitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Đang lưu...
                </>
              ) : (
                <>
                  <span className="material-symbols-rounded text-lg">check</span>
                  {initialTransaction ? 'Cập nhật giao dịch' : 'Lưu giao dịch'}
                </>
              )}
            </button>
          </footer>

        </form>
      </section>
    </div>
  );
};
