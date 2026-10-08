import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';

interface LoginPageProps {
  onSwitchToRegister: () => void;
  onLoginSuccess?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSwitchToRegister, onLoginSuccess }) => {
  const { login, googleLogin, isLoading, error, clearError } = useAuth();
  const [email, setEmail] = useState('minhkhang.finance@gmail.com');
  const [password, setPassword] = useState('SecureFinMan@2024');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [localError, setLocalError] = useState<string | null>(null);

  // Google OAuth Configuration
  const [googleClientId, setGoogleClientId] = useState<string>(() => {
    return localStorage.getItem('finman_google_client_id') || (import.meta as any).env.VITE_GOOGLE_CLIENT_ID || '';
  });
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [customClientIdInput, setCustomClientIdInput] = useState('');
  const googleBtnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleGoogleCredentialResponse = async (response: any) => {
    setLocalError(null);
    clearError();
    try {
      const idToken = response.credential;
      if (!idToken) throw new Error('Không nhận được Google ID Token');

      const base64Url = idToken.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const profile = JSON.parse(jsonPayload);

      await googleLogin({
        idToken,
        email: profile.email,
        fullName: profile.name || profile.email?.split('@')[0],
        avatarUrl: profile.picture,
      });

      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (err: any) {
      console.error('Google Auth Error:', err);
      setLocalError(err.message || 'Xác thực Google thất bại');
    }
  };

  // Initialize Google Identity Services
  useEffect(() => {
    if (!googleClientId) return;

    if (window.google?.accounts?.id) {
      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleCredentialResponse,
          auto_select: false,
        });

        if (googleBtnRef.current) {
          googleBtnRef.current.innerHTML = '';
          window.google.accounts.id.renderButton(googleBtnRef.current, {
            theme: 'outline',
            size: 'large',
            width: 360,
            text: 'continue_with',
            shape: 'rectangular',
          });
        }
      } catch (e) {
        console.error('Google GSI Init error:', e);
      }
    }
  }, [googleClientId]);

  const handleGoogleBtnClick = () => {
    if (!googleClientId) {
      setShowConfigModal(true);
      return;
    }

    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          console.warn('Google One Tap suppressed:', notification.getNotDisplayedReason?.());
        }
      });
    } else {
      setLocalError('Google SDK đang tải hoặc bị chặn bởi trình duyệt. Vui lòng kiểm tra kết nối mạng.');
    }
  };

  const handleSaveClientId = () => {
    const cleanId = customClientIdInput.trim();
    if (!cleanId) return;
    localStorage.setItem('finman_google_client_id', cleanId);
    setGoogleClientId(cleanId);
    setShowConfigModal(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (!email || !password) {
      setLocalError('Vui lòng nhập đầy đủ email và mật khẩu');
      return;
    }

    try {
      await login({ email, password });
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (err: any) {
      // Error is handled in AuthContext
    }
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen bg-surface font-body text-on-surface flex flex-col justify-between selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* Header */}
      <header className="w-full bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.03)] border-b border-surface-container-high/40">
        <div className="h-20 w-full max-w-7xl mx-auto px-6 lg:px-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 shadow-md flex items-center justify-center p-1">
              <img
                alt="FinMan Emblem"
                className="w-full h-full object-cover rounded-lg"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDevDQjRyv7wBMoTRK-2gpLrTTykUbtHwsMaEZ02hiFmzae05QACN26SnX7bJLsMfJAmvLMzpA2yPi054rpvPiaiepcPtuSfU-K0D4wPA3ohB0GPsygWdO8CPKzrYQhqh4onGqq3e7dwpzlbFkpVn0MNaeybYIA31lYbSgv7yc0orRDsRShvIXBGapFyFiYep8Y1A7fB-e_hAarFqlRo26N7fFgXbjmX1HyLWfKgZw4L8dqnCDng0GEZ6Ueds6dd_CE0w"
              />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-on-surface">FinMan</span>
          </div>
          <button
            onClick={onSwitchToRegister}
            className="text-sm font-semibold text-primary hover:text-primary-container transition-colors"
          >
            Đăng ký tài khoản
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full flex-1 flex items-center justify-center py-12 px-6 lg:px-10 bg-gradient-to-b from-surface-container-low via-surface to-surface-bright">
        <div className="flex flex-col w-full max-w-7xl mx-auto">
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Hero Prestige Presentation (5 cols) */}
            <div className="lg:col-span-5 flex flex-col justify-center relative py-6 pr-0 lg:pr-6">
              {/* Decorative Atmospheric Glows */}
              <div className="absolute -top-12 -left-12 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-6 left-24 w-72 h-72 bg-secondary/15 rounded-full blur-3xl pointer-events-none" />

              <div className="relative flex flex-col items-start z-10">
                {/* Coin Emblem VIP Visual with Soft Radial Aura */}
                <div className="relative mb-6 self-start">
                  <div className="absolute inset-0 rounded-full bg-amber-400/20 blur-xl transform scale-110" />
                  <div className="relative w-28 h-28 rounded-full p-1 bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 shadow-xl flex items-center justify-center">
                    <img
                      alt="FinMan Insignia"
                      className="w-full h-full object-cover rounded-full select-none"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDevDQjRyv7wBMoTRK-2gpLrTTykUbtHwsMaEZ02hiFmzae05QACN26SnX7bJLsMfJAmvLMzpA2yPi054rpvPiaiepcPtuSfU-K0D4wPA3ohB0GPsygWdO8CPKzrYQhqh4onGqq3e7dwpzlbFkpVn0MNaeybYIA31lYbSgv7yc0orRDsRShvIXBGapFyFiYep8Y1A7fB-e_hAarFqlRo26N7fFgXbjmX1HyLWfKgZw4L8dqnCDng0GEZ6Ueds6dd_CE0w"
                    />
                  </div>
                </div>

                <h1 className="text-3xl lg:text-4xl font-extrabold text-on-surface tracking-tight mb-4 leading-tight">
                  Quản lý tài chính cá nhân thông minh
                </h1>
                <p className="text-sm text-on-surface-variant mb-8">
                  Hệ thống phân bổ ngân sách 50/30/20 chuẩn mực kết hợp trí tuệ nhân tạo FinMan AI bảo vệ dòng tiền thịnh vượng.
                </p>

                {/* Floating Metric Showcase Cards */}
                <div className="w-full space-y-3.5 mb-8">
                  {/* Metric Card 1: Surplus Highlight */}
                  <div className="w-full p-4 rounded-xl bg-surface-container-lowest shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-between border border-surface-container-high/40">
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                        <span className="material-symbols-outlined text-2xl font-bold">trending_up</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-on-surface-variant uppercase font-semibold">Tăng trưởng tài sản thuần</span>
                        <span className="text-base font-bold text-on-surface">Thặng dư tích lũy tháng</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-extrabold text-secondary flex items-center gap-0.5 justify-end font-currency">
                        +81.8%
                        <span className="material-symbols-outlined text-sm font-bold">arrow_upward</span>
                      </span>
                      <span className="text-xs text-on-surface-variant/80">So với kỳ trước</span>
                    </div>
                  </div>

                  {/* Metric Card 2: AI Savings & Optimization */}
                  <div className="w-full p-4 rounded-xl bg-surface-container-lowest shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-between border border-surface-container-high/40">
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-tertiary/10 flex items-center justify-center text-tertiary">
                        <span className="material-symbols-outlined text-2xl">psychology</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-on-surface-variant uppercase font-semibold">Trợ lý tài chính cá nhân</span>
                        <span className="text-base font-bold text-on-surface">Tiết kiệm thông minh với FinMan AI</span>
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-tertiary/10 flex items-center justify-center text-tertiary">
                      <span className="material-symbols-outlined text-base">check</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Login Auth Form Stage (7 cols) */}
            <div className="lg:col-span-7 flex justify-center lg:justify-end w-full">
              <div className="w-full max-w-xl bg-surface-container-lowest rounded-2xl shadow-xl p-8 sm:p-10 relative overflow-hidden border border-surface-container-high/60">
                {/* Subtle Top Accent Glow */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-primary-container to-amber-500" />

                {/* Auth Header */}
                <div className="flex flex-col items-start mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-surface-container-low shadow-sm flex items-center justify-center mb-4 p-2">
                    <img
                      alt="Coin icon"
                      className="w-8 h-8 object-contain"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDzWywXG4QVa6aZEheIKsCvLAPPCbYQ9fHmrJEAsNE6-ii6H3K571OD4iZia45FschQ7KYVFgvT-5VfXRelh3Yf5kgQaCCAKDfe1HhzD9CgAKOs9zyJrA25h4lkBKWs-nVhFskHxxjpuBEzHVr12weAaT_8Jhpb1frZYP-YLS-B9ycGhMRG9DhqEqRkQn8_cxOw1TOdVLBLizQhGWZpZznthvDYOCwhC077PnXyl9EhgGWfV7AnWQLEIK2yT_03egS66Q"
                    />
                  </div>
                  <h2 className="text-2xl font-extrabold text-on-surface tracking-tight mb-2">
                    Chào mừng trở lại
                  </h2>
                  <p className="text-sm text-on-surface-variant">
                    Đăng nhập để tiếp tục tối ưu dòng tiền thông minh cùng FinMan
                  </p>
                </div>

                {/* Error Banner */}
                {displayError && (
                  <div className="mb-6 p-4 rounded-xl bg-error/10 border border-error/20 flex items-center gap-3 text-error text-sm">
                    <span className="material-symbols-outlined text-xl shrink-0">error</span>
                    <span>{displayError}</span>
                  </div>
                )}

                {/* Google Sign In Area */}
                <div className="space-y-3">
                  <div ref={googleBtnRef} className="w-full flex justify-center min-h-[44px]">
                    <button
                      onClick={handleGoogleBtnClick}
                      disabled={isLoading}
                      className="w-full h-12 py-3 px-4 rounded-xl bg-surface hover:bg-surface-container transition-all duration-200 shadow-sm hover:shadow flex items-center justify-center gap-3 cursor-pointer group border border-surface-container-high/60"
                      type="button"
                    >
                      <svg className="w-5 h-5 group-hover:scale-105 transition-transform shrink-0" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                      </svg>
                      <span className="text-sm font-semibold text-on-surface">Tiếp tục với Google</span>
                    </button>
                  </div>

                  {!googleClientId && (
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => setShowConfigModal(true)}
                        className="text-xs text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-xs">settings</span>
                        Cấu hình Google Client ID
                      </button>
                    </div>
                  )}
                </div>

                {/* Divider Line with Typographic Badge */}
                <div className="relative my-6 flex items-center justify-center">
                  <div className="w-full h-px bg-surface-container-high" />
                  <span className="absolute px-4 bg-surface-container-lowest text-xs uppercase font-semibold text-on-surface-variant tracking-wider">
                    HOẶC TIẾP TỤC VỚI EMAIL
                  </span>
                </div>

                {/* Form Credentials */}
                <form className="space-y-5" onSubmit={handleSubmit}>
                  {/* Email Field */}
                  <div className="flex flex-col space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-semibold text-on-surface" htmlFor="login-email">
                        Email tài khoản
                      </label>
                    </div>
                    <div className="relative flex items-center">
                      <span className="material-symbols-outlined absolute left-4 text-on-surface-variant/70 text-xl pointer-events-none">
                        mail
                      </span>
                      <input
                        id="login-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Nhập địa chỉ email của bạn"
                        className="w-full h-12 pl-12 pr-11 py-3 bg-surface-container-low rounded-xl text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 focus:shadow-md transition-all duration-200 border border-transparent focus:border-primary/30"
                      />
                      {email.includes('@') && email.includes('.') && (
                        <span className="w-2.5 h-2.5 rounded-full bg-secondary absolute right-4" />
                      )}
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="flex flex-col space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-semibold text-on-surface" htmlFor="login-password">
                        Mật khẩu
                      </label>
                    </div>
                    <div className="relative flex items-center">
                      <span className="material-symbols-outlined absolute left-4 text-on-surface-variant/70 text-xl pointer-events-none">
                        lock
                      </span>
                      <input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className={`w-full h-12 pl-12 pr-12 py-3 bg-surface-container-low rounded-xl text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 focus:shadow-md transition-all duration-200 border border-transparent focus:border-primary/30 ${
                          !showPassword ? 'tracking-widest' : ''
                        }`}
                      />
                      <button
                        type="button"
                        id="toggle-pwd-visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        title="Hiện / Ẩn mật khẩu"
                        className="absolute right-3 p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors flex items-center justify-center cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-xl">
                          {showPassword ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Utility Line: Remember Me & Forgot Password */}
                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer accent-primary"
                      />
                      <span className="text-sm text-on-surface font-medium">Ghi nhớ đăng nhập</span>
                    </label>
                    <a
                      href="#forgot"
                      onClick={(e) => e.preventDefault()}
                      className="text-sm font-bold text-primary hover:text-primary-container transition-colors"
                    >
                      Quên mật khẩu?
                    </a>
                  </div>

                  {/* Primary Submit Action */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isLoading}
                      id="login-submit-btn"
                      className="w-full h-13 py-3.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary text-base font-bold tracking-tight shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>Đăng nhập</span>
                          <span className="material-symbols-outlined text-xl font-bold transition-transform group-hover:translate-x-1">
                            arrow_forward
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* Register Redirection Footer */}
                <div className="mt-8 pt-4 border-0 text-center flex items-center justify-center gap-2 bg-surface-container-low/60 py-3.5 rounded-xl">
                  <span className="text-sm text-on-surface-variant">Chưa có tài khoản?</span>
                  <button
                    onClick={onSwitchToRegister}
                    className="text-sm font-bold text-primary hover:underline cursor-pointer"
                  >
                    Đăng ký ngay
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-5 bg-surface-container-lowest shadow-[0_-1px_8px_rgba(0,0,0,0.02)] border-t border-surface-container-high/40">
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <a className="text-xs text-on-surface-variant hover:text-on-surface transition-colors" href="#">
              Điều khoản dịch vụ
            </a>
            <a className="text-xs text-on-surface-variant hover:text-on-surface transition-colors" href="#">
              Chính sách quyền riêng tư
            </a>
            <a className="text-xs text-on-surface-variant hover:text-on-surface transition-colors" href="#">
              Trung tâm hỗ trợ
            </a>
          </div>
          <span className="text-xs text-on-surface-variant/70">© 2026 FinMan Platform. Bảo mật ngân hàng cấp độ cao.</span>
        </div>
      </footer>

      {/* Google Client ID Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl p-6 max-w-md w-full shadow-2xl border border-surface-container-high">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5 text-on-surface">
                <span className="material-symbols-outlined text-primary text-2xl">lock_person</span>
                <h3 className="text-base font-bold">Cấu hình Google OAuth Client ID</h3>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>
            <p className="text-xs text-on-surface-variant mb-4 leading-relaxed">
              Để đăng nhập bằng tài khoản Google thật của bạn, hãy cung cấp OAuth Client ID từ Google Cloud Console (Authorized JavaScript origins: http://localhost:5173).
            </p>
            <div className="mb-4">
              <label className="block text-xs font-semibold text-on-surface mb-1.5">Client ID</label>
              <input
                type="text"
                value={customClientIdInput}
                onChange={(e) => setCustomClientIdInput(e.target.value)}
                placeholder="xxxxxx-xxxxxx.apps.googleusercontent.com"
                className="w-full px-3.5 py-2.5 text-xs bg-surface-container-low rounded-xl border border-surface-container-high focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-on-surface-variant hover:bg-surface-container-low transition-colors"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveClientId}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-primary text-on-primary hover:bg-primary-container transition-colors shadow-sm"
              >
                Lưu và Kích hoạt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};