import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';

interface RegisterPageProps {
  onSwitchToLogin: () => void;
  onRegisterSuccess?: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onSwitchToLogin, onRegisterSuccess }) => {
  const { register, googleLogin, isLoading, error, clearError } = useAuth();
  const [fullName, setFullName] = useState('Nguyễn Minh Khang');
  const [email, setEmail] = useState('minhkhang.finance@gmail.com');
  const [password, setPassword] = useState('KhangFintech2024@');
  const [confirmPassword, setConfirmPassword] = useState('KhangFintech2024@');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(true);
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

  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isMatch = password.length > 0 && password === confirmPassword;

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

      if (onRegisterSuccess) {
        onRegisterSuccess();
      }
    } catch (err: any) {
      console.error('Google Auth Error:', err);
      setLocalError(err.message || 'Đăng ký Google thất bại');
    }
  };

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
            text: 'signup_with',
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

    if (!fullName || !email || !password || !confirmPassword) {
      setLocalError('Vui lòng điền đầy đủ các thông tin bắt buộc');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Mật khẩu xác nhận không khớp');
      return;
    }

    if (!hasMinLength || !hasUpperCase || !hasLowerCase || !hasNumber) {
      setLocalError('Mật khẩu chưa đáp ứng đầy đủ tiêu chuẩn bảo mật');
      return;
    }

    if (!acceptTerms) {
      setLocalError('Bạn cần đồng ý với Điều khoản dịch vụ và Chính sách bảo mật');
      return;
    }

    try {
      await register({ fullName, email, password });
      if (onRegisterSuccess) {
        onRegisterSuccess();
      }
    } catch (err: any) {
      // Handled in AuthContext
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
            onClick={onSwitchToLogin}
            className="text-sm font-semibold text-primary hover:text-primary-container transition-colors"
          >
            Đăng nhập hệ thống
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full flex-1 flex items-center justify-center py-12 px-6 lg:px-10 bg-gradient-to-b from-surface-container-low via-surface to-surface-bright">
        <div className="flex flex-col w-full max-w-7xl mx-auto">
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
            {/* Left Column (5 cols) */}
            <div className="lg:col-span-5 flex flex-col justify-between p-8 md:p-10 rounded-2xl bg-inverse-surface text-inverse-on-surface relative overflow-hidden shadow-xl">
              <div className="absolute -right-20 -bottom-20 w-96 h-96 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
              <div className="absolute -left-12 -top-12 w-64 h-64 rounded-full bg-secondary/15 blur-2xl pointer-events-none" />

              <div className="relative z-10 flex flex-col">
                <div className="space-y-3 mb-8">
                  <h2 className="text-2xl lg:text-3xl font-bold text-inverse-on-surface leading-tight">
                    Hệ sinh thái thông minh hỗ trợ các cá nhân làm chủ dòng tiền
                  </h2>
                  <p className="text-sm text-surface-variant">
                    Nền tảng kiểm soát tài chính cá nhân với chuẩn mực quản trị gia sản của ngân hàng tư nhân.
                  </p>
                </div>

                <div className="space-y-6 mb-8">
                  <div className="flex items-start gap-4 group">
                    <div className="w-11 h-11 rounded-xl bg-surface-container-lowest/10 flex items-center justify-center shrink-0 text-primary-container shadow-sm transition-transform group-hover:scale-105">
                      <span className="material-symbols-outlined text-2xl">neurology</span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <h3 className="text-sm font-semibold text-inverse-on-surface">Trợ lý FinMan AI Thông minh</h3>
                      <p className="text-xs text-surface-variant mt-0.5">Tối ưu chi tiêu & gợi ý phân bổ dòng tiền tự động</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 group">
                    <div className="w-11 h-11 rounded-xl bg-surface-container-lowest/10 flex items-center justify-center shrink-0 text-secondary-container shadow-sm transition-transform group-hover:scale-105">
                      <span className="material-symbols-outlined text-2xl">account_balance</span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <h3 className="text-sm font-semibold text-inverse-on-surface">Quản lý Đa Tài khoản Tập trung</h3>
                      <p className="text-xs text-surface-variant mt-0.5">Đồng bộ ví tiền mặt, tài khoản ngân hàng và thẻ tín dụng</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 group">
                    <div className="w-11 h-11 rounded-xl bg-surface-container-lowest/10 flex items-center justify-center shrink-0 text-tertiary-container shadow-sm transition-transform group-hover:scale-105">
                      <span className="material-symbols-outlined text-2xl">speed</span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <h3 className="text-sm font-semibold text-inverse-on-surface">Cảnh báo Ngân sách Realtime</h3>
                      <p className="text-xs text-surface-variant mt-0.5">Cảnh báo tức thì khi chi tiêu vượt ngưỡng danh mục</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative z-10 pt-6 border-t border-surface-container-lowest/10">
                <div className="p-4 rounded-xl bg-surface-container-lowest/5 backdrop-blur-md flex flex-col gap-2 mb-2">
                  <div className="flex items-center gap-1 text-amber-400">
                    <span className="material-symbols-outlined text-sm">star</span>
                    <span className="material-symbols-outlined text-sm">star</span>
                    <span className="material-symbols-outlined text-sm">star</span>
                    <span className="material-symbols-outlined text-sm">star</span>
                    <span className="material-symbols-outlined text-sm">star</span>
                    <span className="text-xs text-inverse-on-surface ml-1 font-bold">5.0 / 5.0</span>
                  </div>
                  <p className="text-xs italic text-surface-variant leading-relaxed">
                    “FinMan mang đến cảm giác quản trị dòng tiền chuẩn mực như một Private Banker đích thực. Tôi hoàn toàn kiểm soát được 6 tài khoản ngân hàng chỉ trong 1 màn hình.”
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs font-semibold text-inverse-on-surface">Lê Hoàng Nam</span>
                    <span className="text-xs text-surface-variant">Giám đốc Điều hành, Nam An Corp</span>
                  </div>
                </div>
              </div>
            </div>
            {/* Right Column (7 cols) - Registration Form */}
            <div className="lg:col-span-7 flex flex-col justify-center">
              <div className="bg-surface-container-lowest p-8 sm:p-10 rounded-2xl shadow-xl flex flex-col w-full relative border border-surface-container-high/60">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-primary-container to-amber-500 rounded-t-2xl" />

                {/* Form Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex flex-col space-y-1">
                    <h1 className="text-2xl font-extrabold text-on-surface tracking-tight">
                      Tạo tài khoản FinMan mới
                    </h1>
                    <p className="text-sm text-on-surface-variant">
                      Bắt đầu hành trình làm chủ tài chính cá nhân toàn diện
                    </p>
                  </div>
                  <div className="hidden sm:flex w-12 h-12 rounded-xl bg-surface-container-low p-2 items-center justify-center shadow-sm">
                    <img
                      alt="Coin Emblem"
                      className="w-full h-full object-contain"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDvQnazCg6paNF3jbwA5cMLEOpVIehR_UB1QZRB9m8nXoFqJXEkN1KQL67tvWo697mkMlPuN9MziAiWR2j7ZgvjC_GMXyqvdVixbp_kZMi5ElSY4pN-YFwPi_pL2kkv2n5v60j0wtkl5WZlMuwadrxI6hwnurjoJyvFQSY_fZtHJo8jiownvcSjTkm26kCIi6TK7vz1F0DZY6tegq1SIqcfYrfMr5v6UheZpn3IaoNhme-AFCy9DzTuD17Ync5dQg-h9A"
                    />
                  </div>
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
                      <span className="text-sm font-semibold text-on-surface">Đăng ký nhanh với Google</span>
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

                {/* Divider Line */}
                <div className="relative my-6 flex items-center justify-center">
                  <div className="w-full h-px bg-surface-container-high" />
                  <span className="absolute px-4 bg-surface-container-lowest text-xs uppercase font-semibold text-on-surface-variant tracking-wider">
                    HOẶC ĐĂNG KÝ VỚI EMAIL
                  </span>
                </div>

                {/* Registration Form */}
                <form className="space-y-4" onSubmit={handleSubmit}>
                  {/* Full Name */}
                  <div className="flex flex-col space-y-1">
                    <label className="text-xs font-semibold text-on-surface flex items-center justify-between">
                      <span>Họ và tên <span className="text-primary">*</span></span>
                      {fullName.length > 2 && <span className="text-xs text-secondary font-medium">Hợp lệ</span>}
                    </label>
                    <div className="relative flex items-center">
                      <span className="material-symbols-outlined absolute left-4 text-on-surface-variant/70 text-xl pointer-events-none">
                        person
                      </span>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Nhập họ và tên đầy đủ"
                        className="w-full h-11 pl-12 pr-4 py-2.5 bg-surface-container-low rounded-xl text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 transition-all border border-transparent focus:border-primary/30"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex flex-col space-y-1">
                    <label className="text-xs font-semibold text-on-surface flex items-center justify-between">
                      <span>Địa chỉ Email <span className="text-primary">*</span></span>
                      {email.includes('@') && email.includes('.') && <span className="text-xs text-secondary font-medium">Email khả dụng</span>}
                    </label>
                    <div className="relative flex items-center">
                      <span className="material-symbols-outlined absolute left-4 text-on-surface-variant/70 text-xl pointer-events-none">
                        mail
                      </span>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="tenban@domain.com"
                        className="w-full h-11 pl-12 pr-4 py-2.5 bg-surface-container-low rounded-xl text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 transition-all border border-transparent focus:border-primary/30"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="flex flex-col space-y-1">
                    <label className="text-xs font-semibold text-on-surface flex items-center justify-between">
                      <span>Mật khẩu bảo mật <span className="text-primary">*</span></span>
                      <span className={`text-xs font-medium ${hasMinLength && hasUpperCase && hasLowerCase && hasNumber ? 'text-secondary' : 'text-on-surface-variant'}`}>
                        {hasMinLength && hasUpperCase && hasLowerCase && hasNumber ? 'Độ an toàn: Rất mạnh' : 'Cần đạt chuẩn bên dưới'}
                      </span>
                    </label>
                    <div className="relative flex items-center">
                      <span className="material-symbols-outlined absolute left-4 text-on-surface-variant/70 text-xl pointer-events-none">
                        lock
                      </span>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Nhập mật khẩu"
                        className={`w-full h-11 pl-12 pr-12 py-2.5 bg-surface-container-low rounded-xl text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 transition-all border border-transparent focus:border-primary/30 ${
                          !showPassword ? 'tracking-widest' : ''
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface transition-colors"
                      >
                        <span className="material-symbols-outlined text-xl">
                          {showPassword ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="flex flex-col space-y-1">
                    <label className="text-xs font-semibold text-on-surface flex items-center justify-between">
                      <span>Xác nhận mật khẩu <span className="text-primary">*</span></span>
                      {isMatch && <span className="text-xs text-secondary font-medium">Trùng khớp hoàn toàn</span>}
                    </label>
                    <div className="relative flex items-center">
                      <span className="material-symbols-outlined absolute left-4 text-on-surface-variant/70 text-xl pointer-events-none">
                        lock_reset
                      </span>
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Nhập lại mật khẩu"
                        className="w-full h-11 pl-12 pr-12 py-2.5 bg-surface-container-low rounded-xl text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 transition-all border border-transparent focus:border-primary/30 tracking-widest"
                      />
                      {isMatch && (
                        <div className="absolute right-3 w-6 h-6 rounded-full bg-secondary/15 flex items-center justify-center text-secondary">
                          <span className="material-symbols-outlined text-sm font-bold">done</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Password Strength Checklist */}
                  <div className="p-3.5 rounded-xl bg-surface-container-low/80 flex flex-col space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-on-surface font-semibold">Tiêu chuẩn mật khẩu FinMan:</span>
                      <div className="flex gap-1 w-20 h-1.5 rounded-full overflow-hidden bg-surface-container-high">
                        <div
                          className={`h-full transition-all duration-300 ${
                            hasMinLength && hasUpperCase && hasLowerCase && hasNumber ? 'bg-secondary w-full' : 'bg-primary w-1/2'
                          }`}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 text-xs">
                      <div className={`flex items-center gap-1.5 p-1 rounded ${hasMinLength ? 'text-secondary' : 'text-on-surface-variant/60'}`}>
                        <span className="material-symbols-outlined text-sm">{hasMinLength ? 'check_circle' : 'radio_button_unchecked'}</span>
                        <span>Ít nhất 8 ký tự</span>
                      </div>
                      <div className={`flex items-center gap-1.5 p-1 rounded ${hasUpperCase ? 'text-secondary' : 'text-on-surface-variant/60'}`}>
                        <span className="material-symbols-outlined text-sm">{hasUpperCase ? 'check_circle' : 'radio_button_unchecked'}</span>
                        <span>Có chữ in hoa</span>
                      </div>
                      <div className={`flex items-center gap-1.5 p-1 rounded ${hasLowerCase ? 'text-secondary' : 'text-on-surface-variant/60'}`}>
                        <span className="material-symbols-outlined text-sm">{hasLowerCase ? 'check_circle' : 'radio_button_unchecked'}</span>
                        <span>Có chữ in thường</span>
                      </div>
                      <div className={`flex items-center gap-1.5 p-1 rounded ${hasNumber ? 'text-secondary' : 'text-on-surface-variant/60'}`}>
                        <span className="material-symbols-outlined text-sm">{hasNumber ? 'check_circle' : 'radio_button_unchecked'}</span>
                        <span>Có chứa chữ số</span>
                      </div>
                    </div>
                  </div>

                  {/* Terms Agreement */}
                  <div className="flex items-start gap-2.5 pt-1">
                    <input
                      id="legal-agree"
                      type="checkbox"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer accent-primary shrink-0"
                    />
                    <label htmlFor="legal-agree" className="text-xs text-on-surface-variant cursor-pointer select-none leading-relaxed">
                      Bằng việc chọn Đăng ký, bạn xác nhận đã đọc, hiểu và đồng ý với{' '}
                      <a href="#" className="font-medium text-primary hover:underline">Điều khoản sử dụng</a>{' '}
                      và{' '}
                      <a href="#" className="font-medium text-primary hover:underline">Chính sách bảo mật</a>{' '}
                      của FinMan Platform.
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 px-6 rounded-xl bg-primary text-on-primary text-sm font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:bg-primary-container active:scale-[0.99] transition-all duration-200 cursor-pointer group mt-4 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Đăng ký tài khoản</span>
                        <span className="material-symbols-outlined text-xl transition-transform group-hover:translate-x-1">arrow_forward</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Footer Login Link */}
                <div className="mt-6 pt-4 flex items-center justify-center gap-2 text-center">
                  <span className="text-sm text-on-surface-variant">Đã có tài khoản FinMan?</span>
                  <button
                    onClick={onSwitchToLogin}
                    className="text-sm font-bold text-primary hover:text-primary-container hover:underline transition-colors cursor-pointer"
                  >
                    Đăng nhập ngay
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
              Để đăng ký bằng tài khoản Google thật của bạn, hãy cung cấp OAuth Client ID từ Google Cloud Console (Authorized JavaScript origins: http://localhost:5173).
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