# Phase 7: Settings, Profile & App Polish (APIs + Stitch Settings Screen)
> **State & Progress**: Trước khi thực thi, bắt buộc đọc `output/progress.md` để nhận diện task đã hoàn thành `[x]` và cập nhật tiến độ sau khi hoàn thành.
> **Engineering Rules**: SOLID, ACID, Zero-Float (`Long`), camelCase DTOs, snake_case DB columns, Stitch UI design tokens.

---

## Phase 7: Settings, Profile & App Polish (APIs + Stitch Settings Screen)

### Task 7.1: Backend Profile & Settings APIs
- **Mục tiêu**: Cập nhật thông tin cá nhân (Họ tên, Mật khẩu), API đăng xuất.
- **Files**: `backend/src/main/java/com/finman/controller/UserController.java`.
- **DoD**: Đổi thông tin thành công, kiểm tra mật khẩu cũ trước khi đổi mật khẩu mới.

### Task 7.2: Frontend More & Settings Screen (Bóc tách từ Stitch)
- **Mục tiêu**:
  - Tái sử dụng giao diện Cài đặt Web Desktop:
    - Profile header (Avatar, Tên người dùng, Email).
    - Danh sách tab: Thông tin cá nhân, Quản lý tài khoản, Danh mục thu chi, Cài đặt thông báo, Xuất dữ liệu Excel, Đăng xuất.
- **Files**: `frontend/src/pages/settings/SettingsPage.tsx`.
- **DoD**: Màn hình cài đặt hiển thị đầy đủ các tính năng hỗ trợ, đăng xuất chuyển hướng về Login.

### Task 7.3: Tối Ưu Trải Nghiệm Web Responsive & Performance
- **Mục tiêu**: Tinh chỉnh giao diện Web responsive từ Desktop (1600px canvas) xuống Tablet và Mobile viewport. Tối ưu animation CSS, lazy loading và bundle size với Vite.
- **Files**: `frontend/src/index.css`, `frontend/src/App.tsx`, `frontend/tailwind.config.js`.
- **DoD**: Trải nghiệm mượt mà trên mọi kích thước màn hình trình duyệt, Lighthouse Performance & Accessibility đạt chuẩn.

### Task 7.4: Kiểm Tra Đối Chiếu Toàn Diện Với Thiết Kế Stitch Web
- **Mục tiêu**: So sánh từng trang Web đã code với mã nguồn `code.html` và ảnh `screen.png` trong tất cả các thư mục `design/finman_web_*`.
- **DoD**: Chuẩn xác 100% về bảng màu Fintech Prestige, typography Plus Jakarta Sans, layout dual-rail sidebar và spacing chuẩn design system.

---
