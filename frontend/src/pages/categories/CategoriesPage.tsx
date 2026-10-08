import React, { useEffect, useState, useMemo } from 'react';
import { categoryService } from '../../services/categoryService';
import { Category, CategoryType } from '../../types/category';
import Sidebar from '../../components/layout/Sidebar';
import { TopHeader } from '../../components/layout/TopHeader';
import { getCategoryIcon } from '../../utils/iconMap';

const DEFAULT_ICONS = [
  { icon: 'category', label: 'Mặc định' },
  { icon: 'restaurant', label: 'Ăn uống' },
  { icon: 'shopping_bag', label: 'Mua sắm' },
  { icon: 'directions_car', label: 'Di chuyển' },
  { icon: 'home', label: 'Nhà cửa' },
  { icon: 'bolt', label: 'Tiện ích / Điện nước' },
  { icon: 'medical_services', label: 'Y tế / Sức khỏe' },
  { icon: 'school', label: 'Giáo dục' },
  { icon: 'payments', label: 'Lương / Thu nhập' },
  { icon: 'card_giftcard', label: 'Quà tặng' },
  { icon: 'savings', label: 'Tiết kiệm' },
  { icon: 'trending_up', label: 'Đầu tư' },
  { icon: 'flight', label: 'Du lịch' },
  { icon: 'fitness_center', label: 'Thể thao' },
  { icon: 'movie', label: 'Giải trí' },
];

const PRESET_COLORS = [
  '#b70011', '#dc2626', '#ea580c', '#d97706',
  '#006c4a', '#059669', '#0d9488', '#0284c7',
  '#2563eb', '#7c3aed', '#c026d3', '#475569'
];

export const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<CategoryType>('EXPENSE');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Add / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'EXPENSE' as CategoryType,
    icon: 'category',
    color: '#b70011',
  });
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await categoryService.getCategories();
      setCategories(data);
    } catch (err: any) {
      console.error('Failed to load categories', err);
      setError('Không thể tải danh sách danh mục. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      const matchesTab = cat.type === activeTab;
      const matchesSearch = searchQuery.trim() === '' || 
        cat.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [categories, activeTab, searchQuery]);

  const stats = useMemo(() => {
    const expenseCount = categories.filter((c) => c.type === 'EXPENSE').length;
    const incomeCount = categories.filter((c) => c.type === 'INCOME').length;
    const customCount = categories.filter((c) => !c.isDefault).length;
    return {
      total: categories.length,
      expenseCount,
      incomeCount,
      customCount,
    };
  }, [categories]);

  const handleOpenCreateModal = () => {
    setActionError(null);
    setFormData({
      name: '',
      type: activeTab,
      icon: activeTab === 'EXPENSE' ? 'shopping_bag' : 'payments',
      color: activeTab === 'EXPENSE' ? '#b70011' : '#006c4a',
    });
    setIsModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setActionError('Vui lòng nhập tên danh mục');
      return;
    }
    try {
      setSubmitting(true);
      setActionError(null);
      await categoryService.createCategory(formData);
      setIsModalOpen(false);
      await fetchCategories();
    } catch (err: any) {
      setActionError(err.response?.data?.message || err.message || 'Tạo danh mục thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = async (cat: Category) => {
    if (cat.isDefault) {
      alert('Không thể xóa danh mục mặc định của hệ thống!');
      return;
    }
    if (!confirm(`Bạn có chắc chắn muốn xóa danh mục "${cat.name}"?`)) return;
    try {
      await categoryService.deleteCategory(cat.id);
      await fetchCategories();
    } catch (err: any) {
      alert('Xóa danh mục thất bại: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="min-h-screen bg-surface font-sans text-on-surface antialiased">
      {/* Stitch Design Sidebar: Fixed w-72 */}
      <Sidebar onOpenAddModal={handleOpenCreateModal} />

      {/* Main Content: Offset by pl-0 lg:pl-72 */}
      <div className="lg:pl-72">
        {/* Stitch Design Top Header: Fixed h-20 */}
        <TopHeader
          title="Cài đặt & Danh mục"
          searchTerm={searchQuery}
          setSearchTerm={setSearchQuery}
        />

        {/* Main Canvas: pt-20 for header offset */}
        <main className="relative pt-20 bg-surface min-h-screen">
          <div className="w-full max-w-[1600px] mx-auto px-6 py-6 flex flex-col gap-6">

            {/* Header Banner & Action Button */}
            <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-sm">
                  <span className="material-symbols-outlined text-[28px]">tune</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">
                      Fintech Prestige
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/40"></span>
                    <span className="text-xs font-medium text-on-surface-variant">Phân loại tài chính</span>
                  </div>
                  <h1 className="text-2xl font-bold tracking-tight text-on-surface">Quản lý Danh mục</h1>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    Tùy chỉnh nhóm chi tiêu và nguồn thu để phân tích dòng tiền chính xác hơn.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleOpenCreateModal}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary font-semibold text-sm shadow-sm hover:bg-primary/90 active:scale-[0.98] transition-all"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px]">add_circle</span>
                  <span>Thêm danh mục</span>
                </button>
              </div>
            </div>

            {/* Quick KPI Cards Strip: 4 Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-outline-variant/20 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Tổng danh mục</span>
                  <span className="text-2xl font-extrabold text-on-surface mt-1">{stats.total}</span>
                  <span className="text-[11px] text-on-surface-variant mt-0.5">Đang kích hoạt</span>
                </div>
                <div className="w-11 h-11 rounded-xl bg-surface-container flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[24px]">category</span>
                </div>
              </div>

              <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-outline-variant/20 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-primary uppercase tracking-wider">Khoản chi (Expense)</span>
                  <span className="text-2xl font-extrabold text-primary mt-1">{stats.expenseCount}</span>
                  <span className="text-[11px] text-on-surface-variant mt-0.5">Nhóm chi tiêu</span>
                </div>
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[24px]">trending_down</span>
                </div>
              </div>

              <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-outline-variant/20 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-secondary uppercase tracking-wider">Khoản thu (Income)</span>
                  <span className="text-2xl font-extrabold text-secondary mt-1">{stats.incomeCount}</span>
                  <span className="text-[11px] text-on-surface-variant mt-0.5">Nguồn thu nhập</span>
                </div>
                <div className="w-11 h-11 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined text-[24px]">trending_up</span>
                </div>
              </div>

              <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-outline-variant/20 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Tự tạo</span>
                  <span className="text-2xl font-extrabold text-on-surface mt-1">{stats.customCount}</span>
                  <span className="text-[11px] text-on-surface-variant mt-0.5">Do người dùng thiết lập</span>
                </div>
                <div className="w-11 h-11 rounded-xl bg-surface-container flex items-center justify-center text-on-surface-variant">
                  <span className="material-symbols-outlined text-[24px]">bookmark_added</span>
                </div>
              </div>
            </div>

            {/* Filter Controls Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-surface-container-lowest p-4 rounded-2xl shadow-sm border border-outline-variant/20">
              {/* Type Switcher Tabs */}
              <div className="flex items-center gap-2 bg-surface-container-low p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setActiveTab('EXPENSE')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'EXPENSE'
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
                  <span>Khoản chi tiêu ({stats.expenseCount})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('INCOME')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'INCOME'
                      ? 'bg-secondary text-on-secondary shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
                  <span>Khoản thu nhập ({stats.incomeCount})</span>
                </button>
              </div>

              {/* Search input in card */}
              <div className="relative flex-1 max-w-sm">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
                  search
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm danh mục theo tên..."
                  className="w-full bg-surface-container-low text-on-surface placeholder:text-on-surface-variant pl-9 pr-3 py-2 rounded-xl text-xs border border-outline-variant/20 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>

            {/* Content Display: Loading, Error, Empty or Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl p-5 h-28 animate-pulse flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-surface-container"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-surface-container rounded w-3/4"></div>
                      <div className="h-3 bg-surface-container rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="p-6 rounded-2xl bg-error/10 border border-error/20 text-error flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-2xl">error</span>
                  <span className="text-sm font-semibold">{error}</span>
                </div>
                <button
                  onClick={fetchCategories}
                  className="px-4 py-2 bg-error text-white text-xs font-bold rounded-xl hover:opacity-90 transition-opacity"
                >
                  Thử lại
                </button>
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl p-12 text-center shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-surface-container mx-auto flex items-center justify-center text-on-surface-variant mb-4">
                  <span className="material-symbols-outlined text-3xl">category</span>
                </div>
                <h3 className="text-base font-bold text-on-surface mb-1">
                  {searchQuery ? 'Không tìm thấy danh mục phù hợp' : 'Chưa có danh mục nào'}
                </h3>
                <p className="text-xs text-on-surface-variant mb-6 max-w-sm mx-auto">
                  {searchQuery 
                    ? `Không có danh mục nào khớp với từ khóa "${searchQuery}".` 
                    : 'Hãy tạo danh mục tùy chỉnh đầu tiên để phân loại dòng tiền của bạn.'}
                </p>
                <button
                  onClick={handleOpenCreateModal}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-primary text-on-primary hover:bg-primary/90 transition-all inline-flex items-center gap-2 shadow-sm"
                >
                  <span className="material-symbols-outlined text-base">add</span>
                  Thêm danh mục mới
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredCategories.map((cat) => (
                  <div
                    key={cat.id}
                    className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl p-5 flex items-center justify-between shadow-sm hover:shadow-md hover:border-outline-variant/50 transition-all group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-sm shrink-0 transition-transform group-hover:scale-105"
                        style={{ backgroundColor: cat.color || (cat.type === 'EXPENSE' ? '#b70011' : '#006c4a') }}
                      >
                        <span className="material-symbols-outlined text-[24px]">
                          {getCategoryIcon(cat.icon, cat.type)}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors truncate">
                          {cat.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          {cat.isDefault ? (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-surface-container text-on-surface-variant border border-outline-variant/20">
                              Mặc định
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                              Tùy chỉnh
                            </span>
                          )}
                          <span className="text-[10px] text-on-surface-variant font-medium">
                            {cat.type === 'EXPENSE' ? 'Chi tiêu' : 'Thu nhập'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {!cat.isDefault && (
                      <button
                        onClick={() => handleDeleteCategory(cat)}
                        className="p-2 rounded-xl text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-colors opacity-70 group-hover:opacity-100 shrink-0 ml-2"
                        title="Xóa danh mục"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Create / Add Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl w-full max-w-lg p-6 lg:p-8 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 w-9 h-9 rounded-xl bg-surface-container-low hover:bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
              type="button"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>

            <div className="flex items-center gap-3 mb-2">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm"
                style={{ backgroundColor: formData.color }}
              >
                <span className="material-symbols-outlined text-[20px]">{getCategoryIcon(formData.icon, formData.type)}</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-on-surface">Thêm danh mục mới</h2>
                <p className="text-xs text-on-surface-variant">Tạo nhóm chi tiêu hoặc thu nhập cho sổ quỹ</p>
              </div>
            </div>

            {actionError && (
              <div className="mt-4 p-3 rounded-xl bg-error/10 border border-error/20 text-error text-xs font-medium flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">error</span>
                <span>{actionError}</span>
              </div>
            )}

            <form onSubmit={handleSaveCategory} className="space-y-4 mt-5">
              <div>
                <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                  Tên danh mục <span className="text-primary">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Cà phê sáng, Gym, Tiền thưởng..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                  Phân loại dòng tiền
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'EXPENSE', color: formData.color === '#006c4a' ? '#b70011' : formData.color })}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
                      formData.type === 'EXPENSE'
                        ? 'bg-primary text-on-primary border-primary shadow-sm'
                        : 'bg-surface-container-low text-on-surface-variant border-outline-variant/20 hover:bg-surface-container'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">trending_down</span>
                    <span>Khoản chi (Expense)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'INCOME', color: formData.color === '#b70011' ? '#006c4a' : formData.color })}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
                      formData.type === 'INCOME'
                        ? 'bg-secondary text-on-secondary border-secondary shadow-sm'
                        : 'bg-surface-container-low text-on-surface-variant border-outline-variant/20 hover:bg-surface-container'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">trending_up</span>
                    <span>Khoản thu (Income)</span>
                  </button>
                </div>
              </div>

              {/* Color Picker & Presets */}
              <div>
                <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                  Màu sắc nhận diện
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: c })}
                      className={`w-7 h-7 rounded-lg border-2 transition-transform ${
                        formData.color === c ? 'scale-110 border-on-surface shadow-sm' : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  ))}
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-8 h-8 rounded-lg bg-transparent cursor-pointer p-0 border border-outline-variant/20 ml-2"
                    title="Tùy chọn màu khác"
                  />
                </div>
              </div>

              {/* Icon Picker Grid */}
              <div>
                <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                  Biểu tượng minh họa
                </label>
                <div className="grid grid-cols-5 gap-2 max-h-36 overflow-y-auto p-1 bg-surface-container-low rounded-xl border border-outline-variant/10">
                  {DEFAULT_ICONS.map((item) => (
                    <button
                      key={item.icon}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon: item.icon })}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl text-xs transition-all ${
                        formData.icon === item.icon
                          ? 'bg-primary text-on-primary font-bold shadow-sm'
                          : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                      }`}
                      title={item.label}
                    >
                      <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                      <span className="text-[10px] mt-0.5 truncate max-w-[50px]">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant/20">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-on-surface-variant hover:bg-surface-container transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-primary text-on-primary shadow-sm hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  {submitting && (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  <span>{submitting ? 'Đang lưu...' : 'Tạo danh mục'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;
