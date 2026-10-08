import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

interface TopHeaderProps {
  setMobileOpen?: (open: boolean) => void;
  title?: string;
  currentMonth?: number;
  setCurrentMonth?: (month: number) => void;
  currentYear?: number;
  setCurrentYear?: (year: number) => void;
  selectedAccountId?: number;
  setSelectedAccountId?: (id: number | undefined) => void;
  accounts?: Array<{ id: number; name: string }>;
  onOpenAddModal?: () => void;
  searchTerm?: string;
  setSearchTerm?: (val: string) => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  setMobileOpen,
  title,
  currentMonth = new Date().getMonth() + 1,
  setCurrentMonth = () => {},
  currentYear = new Date().getFullYear(),
  setCurrentYear = () => {},
  selectedAccountId,
  setSelectedAccountId = () => {},
  accounts = [],
  onOpenAddModal = () => {},
  searchTerm = '',
  setSearchTerm = () => {},
}) => {
  const { user } = useAuth();
  const [showMonthDropdown, setShowMonthDropdown] = useState<boolean>(false);

  const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const years = [2024, 2025, 2026, 2027];

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  return (
    <header className="fixed top-0 left-0 lg:left-72 right-0 h-20 bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 flex items-center justify-between px-6 border-b border-outline-variant/20">
      {/* Left section: Mobile menu toggle, search bar & month picker */}
      <div className="flex items-center gap-4 flex-1 max-w-2xl">
        {setMobileOpen && (
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
            aria-label="Open mobile menu"
          >
            <span className="material-symbols-outlined text-2xl">menu</span>
          </button>
        )}

        {/* Search input or page title */}
        {title ? (
          <h1 className="text-sm lg:text-base font-bold text-on-surface truncate">{title}</h1>
        ) : (
          <div className="relative w-full max-w-sm flex items-center">
            <span className="material-symbols-outlined absolute left-3.5 text-on-surface-variant text-[20px] pointer-events-none">
              search
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm giao dịch, danh mục, số tiền..."
              className="w-full bg-surface-container-low text-on-surface placeholder:text-on-surface-variant pl-10 pr-4 py-2 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/30 border border-outline-variant/10 transition-all"
            />
          </div>
        )}

        {/* Month selector controls */}
        <div className="relative flex items-center bg-surface-container-low rounded-xl px-2 py-1 gap-1 border border-outline-variant/10">
          <button
            onClick={handlePrevMonth}
            className="p-1 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
            type="button"
            title="Tháng trước"
          >
            <span className="material-symbols-outlined text-[18px]">chevron_left</span>
          </button>

          <button
            onClick={() => setShowMonthDropdown(!showMonthDropdown)}
            className="flex items-center gap-1.5 text-xs font-semibold text-on-surface px-2 py-0.5 rounded hover:bg-surface-container transition-colors"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px] text-on-surface-variant">calendar_today</span>
            <span>Tháng {currentMonth}, {currentYear}</span>
          </button>

          <button
            onClick={handleNextMonth}
            className="p-1 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
            type="button"
            title="Tháng sau"
          >
            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
          </button>

          {/* Month & Year popup dropdown */}
          {showMonthDropdown && (
            <div className="absolute left-0 top-full mt-2 w-64 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 shadow-xl z-50">
              <div className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                Chọn chu kỳ
              </div>
              <div className="mb-3">
                <div className="text-[10px] text-on-surface-variant mb-1 font-semibold">Năm</div>
                <div className="grid grid-cols-4 gap-1">
                  {years.map(y => (
                    <button
                      key={y}
                      onClick={() => setCurrentYear(y)}
                      className={`py-1 rounded-lg text-xs font-semibold ${
                        currentYear === y
                          ? 'bg-primary text-on-primary'
                          : 'bg-surface-container-low hover:bg-surface-container text-on-surface'
                      }`}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-on-surface-variant mb-1 font-semibold">Tháng</div>
                <div className="grid grid-cols-4 gap-1">
                  {months.map(m => (
                    <button
                      key={m}
                      onClick={() => {
                        setCurrentMonth(m);
                        setShowMonthDropdown(false);
                      }}
                      className={`py-1 rounded-lg text-xs font-semibold ${
                        currentMonth === m
                          ? 'bg-primary text-on-primary'
                          : 'bg-surface-container-low hover:bg-surface-container text-on-surface'
                      }`}
                    >
                      T{m}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Account selector dropdown */}
        {accounts.length > 0 && (
          <div className="hidden xl:block">
            <select
              value={selectedAccountId ?? ''}
              onChange={(e) => setSelectedAccountId(e.target.value ? Number(e.target.value) : undefined)}
              className="bg-surface-container-low text-on-surface text-xs font-semibold px-3 py-2 rounded-xl border border-outline-variant/10 focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">Tất cả tài khoản / ví</option>
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>{acc.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right action controls */}
      <div className="flex items-center gap-3">
        {/* Quick Add Button */}
        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-on-primary text-xs font-semibold shadow-sm hover:bg-primary/90 active:scale-[0.98] transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span className="hidden sm:inline">Thêm giao dịch</span>
        </button>

        {/* Notifications */}
        <button 
          className="relative p-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors" 
          title="Thông báo" 
          type="button"
        >
          <span className="material-symbols-outlined text-[20px]">notifications</span>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full"></span>
        </button>

        {/* Profile Avatar */}
        <div className="pl-1">
          <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs">
            {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopHeader;
