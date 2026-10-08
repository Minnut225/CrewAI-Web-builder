import React from 'react';
import { AiParseResponse } from '../../types/ai';

interface Props {
  data: AiParseResponse;
  onConfirm: () => void;
  onCancel: () => void;
  isConfirming?: boolean;
}

export const TransactionPreviewCard: React.FC<Props> = ({
  data,
  onConfirm,
  onCancel,
  isConfirming = false,
}) => {
  const isIncome = data.type === 'INCOME';
  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const accountDisplay = data.accountName || data.paymentMethod || 'Ví tiền mặt';
  const formattedDate = data.transactionDate
    ? new Date(data.transactionDate).toLocaleDateString('vi-VN')
    : new Date().toLocaleDateString('vi-VN');

  return (
    <div className="mt-3 w-full max-w-md bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5 shadow-sm text-left font-sans">
      <div className="flex items-center justify-between mb-3 border-b border-outline-variant/15 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[18px]">neurology</span>
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
            Giao dịch được AI bóc tách
          </span>
        </div>
        <span
          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
            isIncome
              ? 'bg-secondary/10 text-secondary border border-secondary/20'
              : 'bg-primary/10 text-primary border border-primary/20'
          }`}
        >
          {isIncome ? 'Thu nhập (+)' : 'Chi tiêu (-)'}
        </span>
      </div>

      <div className="space-y-2.5 mb-5 text-sm">
        <div className="flex justify-between items-center py-1 border-b border-outline-variant/10">
          <span className="text-xs text-on-surface-variant">Số tiền</span>
          <span
            className={`text-base font-extrabold font-mono ${
              isIncome ? 'text-secondary' : 'text-primary'
            }`}
          >
            {formatVND(data.amount)}
          </span>
        </div>

        <div className="flex justify-between items-center py-0.5">
          <span className="text-xs text-on-surface-variant">Danh mục</span>
          <div className="flex items-center gap-1.5 font-semibold text-on-surface">
            <span className="material-symbols-outlined text-secondary text-[16px]">category</span>
            <span>{data.categoryName || 'Khác'}</span>
          </div>
        </div>

        <div className="flex justify-between items-center py-0.5">
          <span className="text-xs text-on-surface-variant">Ví / Tài khoản</span>
          <div className="flex items-center gap-1.5 font-semibold text-on-surface">
            <span className="material-symbols-outlined text-on-surface-variant text-[16px]">account_balance_wallet</span>
            <span>{accountDisplay}</span>
          </div>
        </div>

        <div className="flex justify-between items-center py-0.5">
          <span className="text-xs text-on-surface-variant">Ngày ghi nhận</span>
          <span className="font-semibold text-on-surface">{formattedDate}</span>
        </div>

        {data.description && (
          <div className="flex justify-between items-start py-0.5">
            <span className="text-xs text-on-surface-variant shrink-0">Nội dung</span>
            <span className="text-xs text-on-surface font-medium text-right max-w-[200px] truncate">
              {data.description}
            </span>
          </div>
        )}
      </div>

      <div className="flex gap-2.5 pt-1">
        <button
          type="button"
          onClick={onCancel}
          disabled={isConfirming}
          className="flex-1 py-2.5 px-3 rounded-xl border border-outline-variant/40 text-on-surface-variant hover:bg-surface-container font-semibold text-xs transition flex items-center justify-center gap-1"
        >
          <span className="material-symbols-outlined text-[16px]">close</span>
          Hủy bỏ
        </button>

        <button
          type="button"
          onClick={onConfirm}
          disabled={isConfirming}
          className="flex-1 py-2.5 px-3 rounded-xl bg-primary hover:bg-primary/95 text-white font-bold text-xs shadow-sm hover:shadow transition flex items-center justify-center gap-1.5"
        >
          {isConfirming ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              Xác nhận lưu
            </>
          )}
        </button>
      </div>
    </div>
  );
};
