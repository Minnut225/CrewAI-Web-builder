# CODE_PLAN — FinMan Implementation Roadmap
## Kế Hoạch Triển Khai Kỹ Thuật Toàn Diện (Fullstack: Spring Boot + Frontend Stitch UI + Gemini AI)

Tài liệu này xác định thứ tự lập trình chi tiết cho dự án FinMan theo mô hình **Fullstack Monorepo**:
- **`backend/`**: Java Spring Boot 3.x (REST API, JPA, Spring Security 6, JWT, Gemini API, Apache POI).
- **`backend/`**: Java Spring Boot 3.x (REST API, JPA, Spring Security 6, JWT, Gemini API, Apache POI).
- **`frontend/`**: React 19 + Vite + TypeScript + Tailwind CSS (Được xây dựng chuẩn hóa từ bộ thiết kế Stitch Web Application trong thư mục `design/`).
- **`design/`**: Bộ thiết kế Web Desktop từ Stitch với 7 module hoàn chỉnh và tài liệu `fintech_prestige/DESIGN.md`.

---

# Bảng Ánh Xạ Thư Mục Giao Diện Web Stitch (`design/`) Với Kế Hoạch Lập Trình

> [!IMPORTANT]
> **Quy tắc bất biến cho Agent**: Trước khi code bất kỳ màn hình nào ở Frontend, Agent **bắt buộc phải đọc file `code.html` và ảnh `screen.png`** trong thư mục `design/` tương ứng để tái sử dụng chính xác cấu trúc HTML, các class Tailwind CSS, inline icons (Material Symbols) và layout Desktop-First (1600px analytical canvas).

| Thư mục Stitch (`design/`) | Tên màn hình / Tài nguyên | Phase & Task triển khai |
|---|---|---|
| [`design/fintech_prestige`] | Toàn bộ Design Tokens & Quy chuẩn thiết kế (DESIGN.md) | **Task 0.4**: Cấu hình `tailwind.config.js` & `src/index.css` |
| [`design/finman_web_ng_nh_p_h_th_ng`] | Màn hình Đăng nhập Web (Login split screen) | **Task 2.3**: `src/pages/auth/LoginPage.tsx` |
| [`design/finman_web_ng_k_t_i_kho_n`] | Màn hình Đăng ký Web (Register split screen) | **Task 2.3**: `src/pages/auth/RegisterPage.tsx` |
| [`design/finman_web_giao_d_ch_dashboard`] | Màn hình Dashboard & Sổ cái Giao dịch Web | **Task 4.2**: `src/pages/dashboard/DashboardPage.tsx` |
| [`design/finman_web_popup_th_m_giao_d_ch_m_i`] | Modal Thêm giao dịch Glassmorphism Web | **Task 4.3**: `src/components/modals/AddTransactionModal.tsx` |
| [`design/finman_web_qu_n_l_ng_n_s_ch`] | Màn hình Quản lý Ngân sách chi tiêu Web | **Task 5.2**: `src/pages/budget/BudgetPage.tsx` |
| [`design/finman_web_t_i_kho_n_t_i_s_n_r_ng`] | Màn hình Tài khoản & Tài sản ròng Web (VIP Net Worth) | **Task 3.2**: `src/pages/accounts/AccountsPage.tsx` |
| [`design/finman_web_th_ng_k_b_o_c_o`] | Màn hình Thống kê & Báo cáo dòng tiền Web | **Task 8.2**: `src/pages/statistics/StatisticsPage.tsx` |
| [`design/finman_web_tr_l_finman_ai`] | Màn hình Trợ lý FinMan AI Web | **Task 6.3**: `src/pages/ai/AIAssistantPage.tsx` |

---

# Bảng Tóm Tắt Các Phase (40 Tasks)

| Phase | Tên Phase | Số lượng Tasks | Phụ thuộc |
|---|---|---|---|
| **Phase 0** | Khởi tạo dự án Monorepo, Backend Spring Boot & Frontend Stitch Design Tokens | 5 tasks | Không |
| **Phase 1** | Database Models, Repositories & Data Seeder | 4 tasks | Phase 0 |
| **Phase 2** | Authentication Fullstack (Spring Security + Frontend Auth Screens) | 5 tasks | Phase 1 |
| **Phase 3** | Financial Accounts & Categories Fullstack (APIs + Stitch Accounts Screen) | 4 tasks | Phase 2 |
| **Phase 4** | Core Transaction Engine Fullstack (APIs + Stitch Home, Add Txn & Calendar) | 6 tasks | Phase 3 |
| **Phase 5** | Budgeting System Fullstack (APIs + Stitch Budget Screen) | 4 tasks | Phase 4 |
| **Phase 6** | Google Gemini AI Fullstack (APIs + Stitch AI Assistant Screen) | 4 tasks | Phase 4 |
| **Phase 7** | Settings, Profile & App Polish (APIs + Stitch Settings Screen + PWA) | 4 tasks | Phase 2 - 6 |
| **Phase 8** | Statistics & Data Export Fullstack (APIs + Stitch Stats Screen + Excel) | 4 tasks | Phase 4 |
| **Phase 9** | Comprehensive Testing, Security Audit & Docker Deployment | 3 tasks | Phase 1 - 8 |

---