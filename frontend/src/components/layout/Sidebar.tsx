import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
  onOpenAddModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  mobileOpen = false,
  setMobileOpen = () => { },
  onOpenAddModal
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();

  const navItems = [
    { label: 'Giao dịch', icon: 'receipt_long', path: '/dashboard' },
    { label: 'Thống kê & Báo cáo', icon: 'monitoring', path: '/reports' },
    { label: 'Quản lý Ngân sách', icon: 'account_balance_wallet', path: '/budgets' },
    { label: 'Tài khoản & Tài sản', icon: 'account_balance', path: '/accounts' },
    { label: 'Trợ lý FinMan AI', icon: 'neurology', path: '/ai-assistant' },
    { label: 'Cài đặt & Danh mục', icon: 'tune', path: '/categories' },
    { label: 'Cài đặt tài khoản', icon: 'settings', path: '/settings' },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Stitch Design Sidebar: Fixed w-72 bg-surface-container-lowest */}
      <aside className={`
        fixed left-0 top-0 h-screen w-72 bg-surface-container-lowest shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-50 flex flex-col justify-between transition-transform duration-300 ease-in-out border-r border-outline-variant/20
        lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col">
          {/* Logo / Header */}
          <div className="h-20 px-6 flex items-center justify-between border-b border-outline-variant/10">
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => navigate('/dashboard')}
            >
              <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center overflow-hidden shadow-sm ring-1 ring-outline-variant/30">
                <span className="material-symbols-outlined text-primary text-2xl">shield</span>
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-bold text-xl tracking-tight text-on-surface">FinMan</span>
              </div>
            </div>
            <button
              className="lg:hidden text-on-surface-variant hover:text-on-surface p-1"
              onClick={() => setMobileOpen(false)}
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>

          {/* Quick Add Transaction Button */}
          <div className="px-4 py-4">
            <button
              onClick={() => {
                if (onOpenAddModal) onOpenAddModal();
                else navigate('/dashboard');
              }}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary text-on-primary font-semibold text-sm shadow-sm hover:bg-primary/90 active:scale-[0.98] transition-all"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">add_circle</span>
              <span>Thêm giao dịch</span>
            </button>
          </div>

          {/* Navigation Items */}
          <div className="px-4 pt-1">
            <div className="px-3 pb-2 text-[11px] uppercase tracking-wider text-on-surface-variant font-bold">
              Menu chính
            </div>
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path || (item.path === '/dashboard' && location.pathname === '/');
                return (
                  <button
                    key={item.path}
                    onClick={() => {
                      navigate(item.path);
                      setMobileOpen(false);
                    }}
                    className={`
                      w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all text-left
                      ${isActive
                        ? 'bg-surface-container-high text-on-surface font-bold shadow-sm'
                        : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface font-medium'}
                    `}
                  >
                    <span className={`material-symbols-outlined text-[20px] ${isActive ? 'text-primary' : 'text-on-surface-variant'}`}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Footer Profile & Logout */}
        <div className="p-4 bg-surface-container-low/70 mx-4 mb-4 rounded-xl flex items-center justify-between border border-outline-variant/10">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative shrink-0">
              <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-surface-container-lowest"></div>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-on-surface truncate">{user?.fullName || 'Người dùng'}</span>
              <span className="text-[10px] text-on-surface-variant truncate">{user?.email || ''}</span>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors shrink-0 ml-2"
            title="Đăng xuất"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
