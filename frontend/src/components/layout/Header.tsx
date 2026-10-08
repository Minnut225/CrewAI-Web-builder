import React from 'react';
import { Menu, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  setMobileOpen?: (open: boolean) => void;
  title?: string;
}

export const Header: React.FC<HeaderProps> = ({ setMobileOpen = () => {}, title }) => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-6 lg:px-8">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          aria-label="Open sidebar"
        >
          <Menu className="w-6 h-6" />
        </button>
        {title && (
          <h1 className="text-lg font-semibold text-white tracking-tight">{title}</h1>
        )}
      </div>

      <div className="flex items-center space-x-4">
        <button className="relative text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500"></span>
        </button>
        <div className="h-6 w-px bg-slate-800 hidden sm:block"></div>
        <div className="hidden sm:flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white font-bold text-xs shadow-md shadow-emerald-500/20">
            {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
          </div>
          <span className="text-sm font-medium text-slate-200">{user?.fullName || 'User'}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
