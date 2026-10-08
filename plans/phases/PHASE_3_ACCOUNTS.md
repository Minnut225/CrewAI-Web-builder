# Phase 3: Financial Accounts & Categories Fullstack
> **State & Progress**: Trước khi thực thi, bắt buộc đọc output/progress.md để nhận diện task đã hoàn thành [x] và cập nhật tiến độ sau khi hoàn thành.
> **Engineering Rules**: SOLID, ACID, Zero-Float (Long), camelCase DTOs, snake_case DB columns, Stitch UI design tokens.

---

## Phase 3: Financial Accounts & Categories Fullstack

### Task 3.1: Backend Accounts & Categories APIs
- **Mục tiêu**:
  - CRUD Accounts: GET /api/v1/accounts (tính Net Worth = Assets - Liabilities), POST, PUT, DELETE (chuyển isArchived = true).
  - Categories: GET /api/v1/categories, POST, DELETE.
- **Files**: backend/src/main/java/com/finman/service/AccountService.java, backend/src/main/java/com/finman/controller/AccountController.java, backend/src/main/java/com/finman/service/CategoryService.java.
- **DoD**: Trả về danh sách ví kèm số dư và tính đúng Net Worth.

### Task 3.2: Frontend Accounts Screen (Bóc tách từ Stitch)
- **Mục tiêu**:
  - **Đọc trực tiếp từ Stitch**: [design/finman_web_t_i_kho_n_t_i_s_n_r_ng/code.html].
  - Tạo frontend/src/pages/accounts/AccountsPage.tsx.
  - Tái sử dụng:
    - Thẻ VIP Dark Gunmetal hiển thị Tài sản ròng (Net Worth = Assets - Liabilities) và nút ẩn/hiện số dư bảo mật.
    - Dải phương trình tài chính (Tổng tài sản thực có, Khoản nợ / Dư nợ thẻ, Thặng dư ròng).
    - Biểu đồ phân bổ dòng vốn Donut SVG vector tự động tính % tỷ trọng dòng tiền.
    - 3 Cột nhóm tài khoản: Tiền mặt (CASH), Tài khoản ngân hàng (BANK), Thẻ tín dụng & Nợ (CREDIT_CARD).
    - Modal thêm tài khoản mới chuẩn Stitch Web.
- **Files**: frontend/src/pages/accounts/AccountsPage.tsx.
- **DoD**: Giao diện hiển thị đúng layout Desktop-First sang trọng của Stitch, có nút thêm ví và lưu trữ ví tiện lợi.

### Task 3.3: Kết Nối Frontend Accounts Với Backend API
- **Mục tiêu**: Tải danh sách ví thực tế từ /api/v1/accounts, xử lý form tạo ví mới và cập nhật trạng thái số dư theo thời gian thực.
- **Files**: frontend/src/services/accountService.ts.
- **DoD**: Người dùng tạo ví mới trên giao diện, ví hiển thị ngay lập tức và số dư tổng cập nhật chuẩn xác từ database.

### Task 3.4: Tests Cho Accounts & Net Worth
- **Mục tiêu**: Kiểm thử test cases TC_ACC_01 đến TC_ACC_05 (kiểm tra phân quyền multi-tenant, tính toán Net Worth).
- **Files**: backend/src/test/java/com/finman/service/AuthServiceTest.java.
- **DoD**: Toàn bộ test case module Account đạt PASS.

---
