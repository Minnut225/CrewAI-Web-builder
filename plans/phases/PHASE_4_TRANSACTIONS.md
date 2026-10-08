# Phase 4: Core Transaction Engine Fullstack (Dashboard, Add Txn & Calendar)
> **State & Progress**: Trước khi thực thi, bắt buộc đọc `output/progress.md` để nhận diện task đã hoàn thành `[x]` và cập nhật tiến độ sau khi hoàn thành.
> **Engineering Rules**: SOLID, ACID, Zero-Float (`Long`), camelCase DTOs, snake_case DB columns, Stitch UI design tokens.

---

## Phase 4: Core Transaction Engine Fullstack (Dashboard, Add Txn & Calendar)

### Task 4.1: Backend Transaction Service (`@Transactional`)
- **Mục tiêu**:
  - Triển khai logic ghi nhận giao dịch: `INCOME` (+ balance ví), `EXPENSE` (- balance ví).
  - Chỉnh sửa & Xóa giao dịch: Hoàn tác tác động cũ, áp dụng tác động mới chuẩn xác.
  - Lọc giao dịch theo tháng (`month=YYYY-MM`), khoảng ngày, tài khoản, danh mục, từ khóa.
- **Files**: backend/src/main/java/com/finman/service/TransactionService.java, backend/src/main/java/com/finman/controller/TransactionController.java.
- **DoD**: Đảm bảo tính toán số dư chính xác từng đồng VNĐ, có rollback khi lỗi.

### Task 4.2: Frontend Transactions Web Dashboard (Bóc tách từ Stitch)
- **Mục tiêu**:
  - **Đọc trực tiếp từ Stitch**: [design/finman_web_giao_d_ch_dashboard/code.html].
  - Tạo `frontend/src/pages/dashboard/DashboardPage.tsx`.
  - Tái sử dụng:
    - Interactive Header & Bộ chọn tháng (Tháng 8, 9, 10...).
    - KPI Strip: Tổng số dư khả dụng, Thu nhập xanh, Chi tiêu đỏ, Tỷ lệ tích lũy.
    - Khung nhập lệnh nhanh FinMan AI (Quick AI Prompt bar).
    - Sổ cái giao dịch gần đây nhóm theo thời gian.
    - Cột Net Worth & Tài khoản nhanh phía bên phải.
- **Files**: `frontend/src/pages/dashboard/DashboardPage.tsx`.
- **DoD**: Màn hình Web Dashboard hiển thị chuẩn xác từng pixel theo thiết kế Stitch Web.

### Task 4.3: Frontend Add Transaction Modal (Bóc tách từ Stitch)
- **Mục tiêu**:
  - **Đọc trực tiếp từ Stitch**: [design/finman_web_popup_th_m_giao_d_ch_m_i/code.html].
  - Tạo `frontend/src/components/modals/AddTransactionModal.tsx`.
  - Tái sử dụng:
    - Popup Glassmorphism chuẩn Web Desktop.
    - Tab chuyển đổi: **Chi tiêu** | **Thu nhập** (Bỏ hoàn toàn tab chuyển khoản).
    - Quick Amount Chips: 50k, 100k, 200k, 500k, 1M, 2M, 5M.
    - Bộ chọn danh mục với icon tương ứng.
    - Bộ chọn tài khoản ví liên kết.
    - Chọn ngày và ô nhập ghi chú.
- **Files**: `frontend/src/components/modals/AddTransactionModal.tsx`.
- **DoD**: Modal thêm giao dịch hoạt động mượt mà, đổi màu chủ đạo khi chuyển giữa Thu và Chi.

### Task 4.4: Frontend Calendar & Time Filtering
- **Mục tiêu**: Tích hợp bộ lọc thời gian trực quan theo tháng và khoảng ngày trên Header và Dashboard, đồng bộ sổ cái giao dịch tức thì.
- **Files**: `frontend/src/components/layout/TopHeader.tsx`, `frontend/src/pages/dashboard/DashboardPage.tsx`.
- **DoD**: Người dùng dễ dàng chuyển đổi chu kỳ tháng và theo dõi dòng tiền trực quan.

### Task 4.5: Kết Nối Frontend Transactions Với Backend API
- **Mục tiêu**: Khi bấm "Lưu giao dịch" → gọi `POST /api/v1/transactions` → cập nhật số dư trên Hero Card và danh sách giao dịch ngày tức thì.
- **Files**: `frontend/src/services/transactionService.ts`.
- **DoD**: Toàn bộ luồng tạo, xem và xóa giao dịch hoạt động trơn tru.

### Task 4.6: Tests Cho Transaction Engine
- **Mục tiêu**: Kiểm thử test cases `TC_TXN_01` đến `TC_TXN_09`.
- **DoD**: Tất cả các kịch bản kiểm thử tính toán và cập nhật số dư đạt PASS 100%.

---
