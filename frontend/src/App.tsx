import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { AccountsPage } from './pages/accounts/AccountsPage';
import CategoriesPage from './pages/categories/CategoriesPage';
import { ReportsPage } from './pages/reports/ReportsPage';
import { BudgetPage } from './pages/budget/BudgetPage';
import { AIAssistantPage } from './pages/ai/AIAssistantPage';
import { SettingsPage } from './pages/settings/SettingsPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className='min-h-screen bg-slate-950 flex items-center justify-center font-sans'>
        <div className='flex flex-col items-center gap-3'>
          <div className='w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin' />
          <span className='text-sm font-medium text-slate-400'>Đang khởi tạo FinMan...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to='/login' replace />;
  }

  return <>{children}</>;
};

const LoginRoute: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to='/dashboard' replace />;
  }

  return (
    <LoginPage
      onSwitchToRegister={() => navigate('/register')}
      onLoginSuccess={() => navigate('/dashboard')}
    />
  );
};

const RegisterRoute: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to='/dashboard' replace />;
  }

  return (
    <RegisterPage
      onSwitchToLogin={() => navigate('/login')}
      onRegisterSuccess={() => navigate('/dashboard')}
    />
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path='/login' element={<LoginRoute />} />
          <Route path='/register' element={<RegisterRoute />} />
          <Route
            path='/dashboard'
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path='/accounts'
            element={
              <ProtectedRoute>
                <AccountsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path='/reports'
            element={
              <ProtectedRoute>
                <ReportsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path='/categories'
            element={
              <ProtectedRoute>
                <CategoriesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path='/budgets'
            element={
              <ProtectedRoute>
                <BudgetPage />
              </ProtectedRoute>
            }
          />
          <Route
            path='/budget'
            element={
              <ProtectedRoute>
                <BudgetPage />
              </ProtectedRoute>
            }
          />
          <Route
            path='/ai-assistant'
            element={
              <ProtectedRoute>
                <AIAssistantPage />
              </ProtectedRoute>
            }
          />
          <Route
            path='/settings'
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path='/ai'
            element={
              <ProtectedRoute>
                <AIAssistantPage />
              </ProtectedRoute>
            }
          />
          <Route
            path='/'
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route path='*' element={<Navigate to='/' replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
