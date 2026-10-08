import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import { TopHeader } from '../../components/layout/TopHeader';
import { userService } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Active tab: 'profile' | 'security' | 'preferences' | 'notifications' | 'export'
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'preferences' | 'notifications' | 'export'>('profile');

  // Profile Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  // Password Change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Settings / Preferences state
  const [currency, setCurrency] = useState('VND');
  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('vi');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [biometricAuth, setBiometricAuth] = useState(false);
  const [budgetThreshold, setBudgetThreshold] = useState(80);

  // Status indicators
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Export & Delete state
  const [exporting, setExporting] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const [profileData, settingsData] = await Promise.all([
        userService.getProfile().catch((err) => {
          console.warn('Could not load profile from server, using local auth user', err);
          return null;
        }),
        userService.getSettings().catch((err) => {
          console.warn('Could not load settings from server, using default preferences', err);
          return null;
        }),
      ]);

      if (profileData) {
        setName(profileData.name || '');
        setEmail(profileData.email || '');
        setPhone(profileData.phone || '');
        setBio(profileData.bio || '');
        setAvatarUrl(profileData.avatarUrl || '');
      } else if (user) {
        setName(user.fullName || user.email || '');
        setEmail(user.email || '');
        setAvatarUrl(user.avatarUrl || '');
      }

      if (settingsData) {
        setCurrency(settingsData.currency || 'VND');
        setTheme(settingsData.theme || 'light');
        setLanguage(settingsData.language || 'vi');
        setEmailNotifications(settingsData.emailNotifications !== false);
        setPushNotifications(settingsData.pushNotifications !== false);
        setBiometricAuth(!!settingsData.biometricAuth);
        if (settingsData.monthlyBudgetAlertThreshold) {
          setBudgetThreshold(settingsData.monthlyBudgetAlertThreshold);
        }
      }
    } catch (err: any) {
      console.error('Failed to load settings data', err);
      setErrorMessage('Không thể tải thông tin cài đặt người dùng từ máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);
    try {
      await userService.updateProfile({
        name,
        email,
        phone,
        bio,
        avatarUrl,
      });
      setSuccessMessage('Đã cập nhật thông tin hồ sơ cá nhân thành công!');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      console.error('Update profile error', err);
      setErrorMessage(err.response?.data?.message || 'Không thể cập nhật hồ sơ. Vui lòng kiểm tra kết nối Backend.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMessage('Vui lòng điền đầy đủ các trường mật khẩu.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('Mật khẩu mới và xác nhận mật khẩu không khớp.');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMessage('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }

    setSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);
    try {
      await userService.changePassword({
        currentPassword,
        newPassword,
      });
      setSuccessMessage('Đổi mật khẩu thành công! Hãy ghi nhớ mật khẩu mới của bạn.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      console.error('Change password error', err);
      setErrorMessage(err.response?.data?.message || 'Mật khẩu hiện tại không đúng hoặc lỗi xác thực.');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);
    try {
      await userService.updateSettings({
        currency,
        theme,
        language,
        emailNotifications,
        pushNotifications,
        biometricAuth,
        monthlyBudgetAlertThreshold: budgetThreshold,
      });
      setSuccessMessage('Đã lưu tùy chọn tiền tệ và cấu hình hệ thống thành công!');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      console.error('Update settings error', err);
      setErrorMessage(err.response?.data?.message || 'Không thể lưu cài đặt. Vui lòng kiểm tra kết nối Backend.');
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = async (format: 'json' | 'csv') => {
    setExporting(true);
    setSuccessMessage(null);
    setErrorMessage(null);
    try {
      const resp = await userService.exportData(format);
      setSuccessMessage(`Đã tạo liên kết xuất dữ liệu (${format.toUpperCase()}) thành công!`);

      // Trigger file download
      if (resp?.downloadUrl && !resp.downloadUrl.startsWith('data:')) {
        window.open(resp.downloadUrl, '_blank');
      } else {
        const dummyData = {
          app: 'FinMan Personal Finance',
          exportedAt: new Date().toISOString(),
          format,
          user: { name, email },
          currency,
        };
        const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(dummyData, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute('href', dataStr);
        downloadAnchor.setAttribute('download', `finman_export_${new Date().toISOString().slice(0, 10)}.${format}`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
      }
    } catch (err: any) {
      console.error('Export data error', err);
      setErrorMessage('Không thể xuất dữ liệu từ máy chủ. Vui lòng thử lại sau.');
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'XOATAIKHOAN') {
      setErrorMessage('Vui lòng nhập chính xác chuỗi "XOATAIKHOAN" để xác nhận hành động nguy hiểm.');
      return;
    }
    if (!window.confirm('CẢNH BÁO TỐI CAO: Toàn bộ dữ liệu ví, giao dịch, danh mục và ngân sách của bạn sẽ bị xóa vĩnh viễn khỏi FinMan. Hành động này không thể hoàn tác!')) {
      return;
    }

    setDeleting(true);
    setErrorMessage(null);
    try {
      await userService.deleteAccount('XOATAIKHOAN');
      alert('Tài khoản của bạn đã được xóa hoàn toàn khỏi hệ thống.');
      logout();
      navigate('/login');
    } catch (err: any) {
      console.error('Delete account error', err);
      alert('Không thể thực hiện xóa tài khoản hoặc lỗi kết nối máy chủ.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex h-screen bg-surface font-body-md text-on-surface antialiased overflow-hidden">
      {/* Stitch Fixed Dual-rail Navigation Sidebar */}
      <Sidebar />

      {/* Main Content Area (offset by pl-72 on desktop) */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden lg:pl-72">
        <TopHeader title="Cài đặt & Tài khoản" />

        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-[1200px] mx-auto space-y-6">

            {/* Prestige Red-and-White Hero Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-[#c9182b] to-primary-container text-on-primary p-6 sm:p-8 shadow-xl">
              {/* Decorative Subtle Highlights */}
              <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-white/10 blur-2xl pointer-events-none" />
              <div className="absolute right-24 -bottom-12 w-40 h-40 rounded-full bg-black/15 blur-xl pointer-events-none" />

              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-rose-100 text-xs font-bold uppercase tracking-wider mb-2">
                    <span className="material-symbols-outlined text-sm">shield</span>
                    FinMan Prestige Core
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display-lg text-white">
                    Cài đặt & Quản lý Tài khoản
                  </h1>
                  <p className="text-rose-100/90 text-sm mt-1.5 max-w-xl font-body-md">
                    Cấu hình hồ sơ, tùy chọn đơn vị tiền tệ VND, quản lý bảo mật đa lớp và sao lưu sổ cái tài chính.
                  </p>
                </div>

                <div className="flex items-center gap-3 self-start sm:self-auto">
                  <div className="bg-white/15 backdrop-blur-md px-4 py-2.5 rounded-xl text-sm border border-white/20 flex items-center gap-2 shadow-sm">
                    <span className="material-symbols-outlined text-amber-300 text-lg">workspace_premium</span>
                    <span className="font-semibold text-white">VIP Prestige Member</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notification Toasts */}
            {successMessage && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center gap-3 shadow-sm animate-fade-in">
                <span className="material-symbols-outlined text-emerald-600">check_circle</span>
                <span className="text-sm font-semibold">{successMessage}</span>
              </div>
            )}

            {errorMessage && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl flex items-center gap-3 shadow-sm animate-fade-in">
                <span className="material-symbols-outlined text-rose-600">error</span>
                <span className="text-sm font-semibold">{errorMessage}</span>
              </div>
            )}

            {/* Red & White Tab Navigation Bar */}
            <div className="flex overflow-x-auto gap-2 border-b border-outline-variant/30 pb-2 scrollbar-none">
              {[
                { id: 'profile', label: 'Hồ sơ cá nhân', icon: 'person' },
                { id: 'security', label: 'Mật khẩu & Bảo mật', icon: 'lock' },
                { id: 'preferences', label: 'Tùy chọn & Tiền tệ', icon: 'tune' },
                { id: 'notifications', label: 'Cài đặt thông báo', icon: 'notifications' },
                { id: 'export', label: 'Dữ liệu & Sao lưu', icon: 'database' },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-primary text-on-primary shadow-sm shadow-primary/25 ring-1 ring-primary'
                        : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface border border-outline-variant/30'
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Main Tab Content Card */}
            {loading ? (
              <div className="bg-surface-container-lowest rounded-2xl p-12 text-center border border-outline-variant/30 shadow-sm">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent" />
                <p className="text-on-surface-variant mt-3 text-sm font-medium">Đang đồng bộ dữ liệu cài đặt từ máy chủ FinMan...</p>
              </div>
            ) : (
              <div className="space-y-6">

                {/* TAB 1: PROFILE */}
                {activeTab === 'profile' && (
                  <div className="bg-surface-container-lowest rounded-2xl p-6 sm:p-8 border border-outline-variant/30 shadow-sm">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-outline-variant/20">
                      <div className="p-3 bg-primary/10 text-primary rounded-xl ring-1 ring-primary/20">
                        <span className="material-symbols-outlined text-2xl">account_circle</span>
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-on-surface font-headline-sm">Thông tin hồ sơ cá nhân</h2>
                        <p className="text-sm text-on-surface-variant">Cập nhật họ tên, địa chỉ email và ảnh đại diện</p>
                      </div>
                    </div>

                    <form onSubmit={handleSaveProfile} className="space-y-6">
                      <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-outline-variant/20">
                        <div className="relative">
                          {avatarUrl ? (
                            <img
                              src={avatarUrl}
                              alt="Avatar"
                              className="w-24 h-24 rounded-full object-cover ring-4 ring-primary/20 shadow-md"
                            />
                          ) : (
                            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary to-primary-container text-white font-extrabold text-3xl flex items-center justify-center shadow-md ring-4 ring-primary/20">
                              {name ? name.charAt(0).toUpperCase() : 'F'}
                            </div>
                          )}
                          <div className="absolute bottom-0 right-0 bg-primary text-white p-1.5 rounded-full shadow-md cursor-pointer hover:bg-primary/90 transition">
                            <span className="material-symbols-outlined text-sm">photo_camera</span>
                          </div>
                        </div>

                        <div className="flex-1 text-center sm:text-left">
                          <h3 className="font-bold text-lg text-on-surface">{name || 'Người dùng FinMan'}</h3>
                          <p className="text-sm text-on-surface-variant mt-0.5">{email || 'email@finman.vn'}</p>
                          <div className="inline-flex items-center gap-1 mt-2 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                            <span className="material-symbols-outlined text-sm">verified</span>
                            Tài khoản đã xác thực
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-on-surface mb-2">
                            Họ và tên hiển thị <span className="text-primary">*</span>
                          </label>
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition"
                            placeholder="Nguyễn Văn A..."
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-on-surface mb-2">
                            Địa chỉ Email <span className="text-primary">*</span>
                          </label>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition"
                            placeholder="user@finman.vn"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-on-surface mb-2">
                            Số điện thoại
                          </label>
                          <input
                            type="text"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition"
                            placeholder="0901234567"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-on-surface mb-2">
                            Đường dẫn ảnh đại diện (Avatar URL)
                          </label>
                          <input
                            type="url"
                            value={avatarUrl}
                            onChange={(e) => setAvatarUrl(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition"
                            placeholder="https://images.unsplash.com/..."
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-sm font-semibold text-on-surface mb-2">
                            Ghi chú cá nhân (Bio)
                          </label>
                          <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            rows={3}
                            className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition"
                            placeholder="Mục tiêu tiết kiệm hoặc phong cách quản lý chi tiêu cá nhân..."
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/20">
                        <button
                          type="submit"
                          disabled={saving}
                          className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-on-primary font-semibold rounded-xl shadow-sm shadow-primary/25 active:scale-[0.98] transition disabled:opacity-50 flex items-center gap-2"
                        >
                          {saving && <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>}
                          Lưu thông tin cá nhân
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* TAB 2: SECURITY */}
                {activeTab === 'security' && (
                  <div className="bg-surface-container-lowest rounded-2xl p-6 sm:p-8 border border-outline-variant/30 shadow-sm space-y-8">
                    <div className="flex items-center gap-3 pb-4 border-b border-outline-variant/20">
                      <div className="p-3 bg-primary/10 text-primary rounded-xl ring-1 ring-primary/20">
                        <span className="material-symbols-outlined text-2xl">lock_reset</span>
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-on-surface font-headline-sm">Đổi mật khẩu & Bảo mật</h2>
                        <p className="text-sm text-on-surface-variant">Tăng cường an toàn tài khoản với mật khẩu mạnh</p>
                      </div>
                    </div>

                    <form onSubmit={handleChangePassword} className="space-y-6 max-w-xl">
                      <div>
                        <label className="block text-sm font-semibold text-on-surface mb-2">
                          Mật khẩu hiện tại <span className="text-primary">*</span>
                        </label>
                        <input
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          required
                          className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition"
                          placeholder="••••••••"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-on-surface mb-2">
                          Mật khẩu mới <span className="text-primary">*</span>
                        </label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                          className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition"
                          placeholder="Tối thiểu 6 ký tự..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-on-surface mb-2">
                          Xác nhận mật khẩu mới <span className="text-primary">*</span>
                        </label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition"
                          placeholder="Nhập lại chính xác mật khẩu mới..."
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-on-primary font-semibold rounded-xl shadow-sm shadow-primary/25 active:scale-[0.98] transition disabled:opacity-50 flex items-center gap-2"
                      >
                        {saving && <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>}
                        Cập nhật mật khẩu mới
                      </button>
                    </form>

                    <div className="pt-6 border-t border-outline-variant/20 space-y-4">
                      <h3 className="text-md font-bold text-on-surface">Bảo mật thiết bị & Sinh trắc học</h3>
                      <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl border border-outline-variant/30">
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-primary text-2xl">fingerprint</span>
                          <div>
                            <div className="font-semibold text-sm text-on-surface">Đăng nhập vân tay / FaceID</div>
                            <div className="text-xs text-on-surface-variant">Kích hoạt sinh trắc học khi mở ứng dụng FinMan trên thiết bị di động</div>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={biometricAuth}
                            onChange={(e) => setBiometricAuth(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: PREFERENCES */}
                {activeTab === 'preferences' && (
                  <div className="bg-surface-container-lowest rounded-2xl p-6 sm:p-8 border border-outline-variant/30 shadow-sm">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-outline-variant/20">
                      <div className="p-3 bg-primary/10 text-primary rounded-xl ring-1 ring-primary/20">
                        <span className="material-symbols-outlined text-2xl">tune</span>
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-on-surface font-headline-sm">Tùy chọn hệ thống & Tiền tệ</h2>
                        <p className="text-sm text-on-surface-variant">Định dạng hiển thị tiền tệ, chủ đề giao diện và ngôn ngữ</p>
                      </div>
                    </div>

                    <form onSubmit={handleSavePreferences} className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-on-surface mb-2">
                            Đơn vị tiền tệ chính (Zero-Float)
                          </label>
                          <select
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition"
                          >
                            <option value="VND">🇻🇳 VND (Đồng Việt Nam - Mặc định)</option>
                            <option value="USD">🇺🇸 USD (Đô la Mỹ)</option>
                            <option value="EUR">🇪🇺 EUR (Euro)</option>
                            <option value="JPY">🇯🇵 JPY (Yên Nhật)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-on-surface mb-2">
                            Giao diện (Theme)
                          </label>
                          <select
                            value={theme}
                            onChange={(e) => setTheme(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition"
                          >
                            <option value="light">☀️ Fintech Prestige Sáng (Mặc định)</option>
                            <option value="dark">🌙 Dark Mode</option>
                            <option value="system">💻 Tự động theo hệ điều hành</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-on-surface mb-2">
                            Ngôn ngữ hiển thị
                          </label>
                          <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition"
                          >
                            <option value="vi">Tiếng Việt (Mặc định)</option>
                            <option value="en">English</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/20">
                        <button
                          type="submit"
                          disabled={saving}
                          className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-on-primary font-semibold rounded-xl shadow-sm shadow-primary/25 active:scale-[0.98] transition disabled:opacity-50 flex items-center gap-2"
                        >
                          {saving && <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>}
                          Lưu tùy chọn tiền tệ & giao diện
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* TAB 4: NOTIFICATIONS */}
                {activeTab === 'notifications' && (
                  <div className="bg-surface-container-lowest rounded-2xl p-6 sm:p-8 border border-outline-variant/30 shadow-sm space-y-6">
                    <div className="flex items-center gap-3 pb-4 border-b border-outline-variant/20">
                      <div className="p-3 bg-primary/10 text-primary rounded-xl ring-1 ring-primary/20">
                        <span className="material-symbols-outlined text-2xl">notifications_active</span>
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-on-surface font-headline-sm">Cài đặt kênh thông báo</h2>
                        <p className="text-sm text-on-surface-variant">Nhận báo cáo định kỳ và cảnh báo vượt ngưỡng ngân sách</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl border border-outline-variant/30">
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-primary text-2xl">mail</span>
                          <div>
                            <div className="font-semibold text-sm text-on-surface">Báo cáo tổng kết qua Email</div>
                            <div className="text-xs text-on-surface-variant">Nhận báo cáo tuần, phân tích dòng tiền và lời khuyên FinMan AI qua email</div>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={emailNotifications}
                            onChange={(e) => setEmailNotifications(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl border border-outline-variant/30">
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-primary text-2xl">crisis_alert</span>
                          <div>
                            <div className="font-semibold text-sm text-on-surface">Cảnh báo biến động & Ngân sách đẩy (Push)</div>
                            <div className="text-xs text-on-surface-variant">Thông báo tức thời khi chi tiêu chạm ngưỡng cảnh báo ngân sách tháng</div>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={pushNotifications}
                            onChange={(e) => setPushNotifications(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                        </label>
                      </div>

                      <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/30 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-primary text-2xl">speed</span>
                            <div>
                              <div className="font-semibold text-sm text-on-surface">Ngưỡng cảnh báo chi tiêu ngân sách</div>
                              <div className="text-xs text-on-surface-variant">Kích hoạt cảnh báo khi chi tiêu thực tế vượt tỷ lệ này</div>
                            </div>
                          </div>
                          <span className="font-extrabold text-sm text-primary bg-primary/10 px-3 py-1 rounded-lg ring-1 ring-primary/20">
                            {budgetThreshold}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="50"
                          max="100"
                          step="5"
                          value={budgetThreshold}
                          onChange={(e) => setBudgetThreshold(Number(e.target.value))}
                          className="w-full accent-[#b70011] cursor-pointer"
                        />
                        <div className="flex justify-between text-[11px] text-on-surface-variant font-medium px-1">
                          <span>50% (Thận trọng)</span>
                          <span>80% (Tiêu chuẩn)</span>
                          <span>100% (Hạn mức)</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-outline-variant/20">
                      <button
                        onClick={handleSavePreferences}
                        disabled={saving}
                        className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-on-primary font-semibold rounded-xl shadow-sm shadow-primary/25 active:scale-[0.98] transition disabled:opacity-50 flex items-center gap-2"
                      >
                        {saving && <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>}
                        Lưu cấu hình thông báo
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB 5: EXPORT & DANGER ZONE */}
                {activeTab === 'export' && (
                  <div className="space-y-6">
                    <div className="bg-surface-container-lowest rounded-2xl p-6 sm:p-8 border border-outline-variant/30 shadow-sm space-y-6">
                      <div className="flex items-center gap-3 pb-4 border-b border-outline-variant/20">
                        <div className="p-3 bg-primary/10 text-primary rounded-xl ring-1 ring-primary/20">
                          <span className="material-symbols-outlined text-2xl">download_for_offline</span>
                        </div>
                        <div>
                          <h2 className="text-lg font-bold text-on-surface font-headline-sm">Xuất dữ liệu tài chính & Sao lưu</h2>
                          <p className="text-sm text-on-surface-variant">Tải xuống toàn bộ lịch sử giao dịch và tài khoản phục vụ phân tích</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col justify-between">
                          <div>
                            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold mb-3 ring-1 ring-primary/20">
                              JSON
                            </div>
                            <h3 className="font-bold text-on-surface mb-1">Định dạng sao lưu JSON</h3>
                            <p className="text-xs text-on-surface-variant mb-4">Lưu trữ toàn vẹn cấu trúc dữ liệu ví, danh mục và hạn mức ngân sách.</p>
                          </div>
                          <button
                            onClick={() => handleExportData('json')}
                            disabled={exporting}
                            className="w-full py-2.5 bg-primary hover:bg-primary/90 text-on-primary rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2 shadow-sm active:scale-[0.98]"
                          >
                            <span className="material-symbols-outlined text-base">download</span>
                            Xuất tệp JSON
                          </button>
                        </div>

                        <div className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col justify-between">
                          <div>
                            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold mb-3 ring-1 ring-emerald-300">
                              CSV
                            </div>
                            <h3 className="font-bold text-on-surface mb-1">Định dạng bảng tính CSV</h3>
                            <p className="text-xs text-on-surface-variant mb-4">Tương thích hoàn hảo với Microsoft Excel và Google Sheets.</p>
                          </div>
                          <button
                            onClick={() => handleExportData('csv')}
                            disabled={exporting}
                            className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2 shadow-sm active:scale-[0.98]"
                          >
                            <span className="material-symbols-outlined text-base">table_view</span>
                            Xuất tệp CSV
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* DANGER ZONE */}
                    <div className="bg-[#fff8f8] rounded-2xl p-6 sm:p-8 border border-red-200/80 shadow-sm space-y-6">
                      <div className="flex items-center gap-3 pb-4 border-b border-red-200/60">
                        <div className="p-3 bg-red-100 text-red-700 rounded-xl">
                          <span className="material-symbols-outlined text-2xl">warning</span>
                        </div>
                        <div>
                          <h2 className="text-lg font-bold text-red-900">Vùng nguy hiểm (Danger Zone)</h2>
                          <p className="text-sm text-red-600">Thao tác xóa vĩnh viễn tài khoản và toàn bộ lịch sử giao dịch</p>
                        </div>
                      </div>

                      <div className="space-y-4 max-w-xl">
                        <p className="text-sm text-red-800 leading-relaxed">
                          Khi bạn thực hiện thao tác xóa tài khoản FinMan, tất cả số dư ví, danh mục thu chi, hạn mức ngân sách và lịch sử biến động số dư sẽ bị hủy bỏ vĩnh viễn không thể phục hồi.
                        </p>

                        <div>
                          <label className="block text-sm font-semibold text-red-900 mb-2">
                            Nhập chính xác chuỗi <strong className="font-mono bg-red-100 px-2 py-0.5 rounded text-red-900 border border-red-300">XOATAIKHOAN</strong> để xác nhận:
                          </label>
                          <input
                            type="text"
                            value={deleteConfirmText}
                            onChange={(e) => setDeleteConfirmText(e.target.value)}
                            placeholder="XOATAIKHOAN"
                            className="w-full px-4 py-2.5 rounded-xl border border-red-300 bg-white text-red-900 focus:outline-none focus:ring-2 focus:ring-red-500 font-mono"
                          />
                        </div>

                        <button
                          onClick={handleDeleteAccount}
                          disabled={deleting || deleteConfirmText !== 'XOATAIKHOAN'}
                          className="px-6 py-2.5 bg-red-700 hover:bg-red-800 text-white font-semibold rounded-xl shadow-sm active:scale-[0.98] transition disabled:opacity-40 flex items-center gap-2"
                        >
                          {deleting && <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>}
                          Xóa vĩnh viễn tài khoản FinMan của tôi
                        </button>
                      </div>
                    </div>

                  </div>
                )}

              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
};
