# Phase 5: Budgeting System Fullstack (APIs + Stitch Budget Screen)
> **State & Progress**: Trước khi thực thi, bắt buộc đọc `output/progress.md` để nhận diện task đã hoàn thành `[x]` và cập nhật tiến độ sau khi hoàn thành.
> **Engineering Rules**: SOLID, ACID, Zero-Float (`Long`), camelCase DTOs, snake_case DB columns, Stitch UI design tokens.

---

## Phase 5: Budgeting System Fullstack (APIs + Stitch Budget Screen)

### Task 5.1: Backend Budget APIs
- **Mục tiêu**: CRUD ngân sách, tính tổng tiền đã chi `amountSpent`, số tiền còn lại `remaining`, và trạng thái cảnh báo (`NORMAL`, `WARNING`, `OVERBUDGET`).
- **Files**: `backend/src/main/java/com/finman/service/BudgetService.java`, `ackend/src/main/java/com/finman/controller/BudgetController.java`.
- **DoD**: Trả về đúng tiến độ chi tiêu theo từng danh mục trong tháng.

### Task 5.2: Frontend Budget Screen (Bóc tách từ Stitch)
- **Mục tiêu**:
  - **Đọc trực tiếp từ Stitch**: [design/finman_web_qu_n_l_ng_n_s_ch/code.html].
  - Tạo `frontend/src/pages/budget/BudgetPage.tsx`.
  - Tái sử dụng:
    - Header chọn tháng ngân sách.
    - Card tổng quan ngân sách tháng (Tổng ngân sách, Đã chi, Còn lại).
    - Danh sách các danh mục có thanh tiến độ (Progress bar) đổi màu Xanh (<80%), Vàng (80-100%), Đỏ (>100%).
    - Modal thiết lập hạn mức ngân sách mới.
- **Files**: `frontend/src/pages/budget/BudgetPage.tsx`.
- **DoD**: Giao diện ngân sách phản ánh trực quan cảnh báo hạn mức chi tiêu.

### Task 5.3: Kết Nối Frontend Budget Với Backend API
- **Mục tiêu**: Tải dữ liệu ngân sách thực tế và cho phép người dùng thêm/sửa ngân sách ngay trên giao diện.
- **Files**: `frontend/src/services/budgetService.ts`.
- **DoD**: Thay đổi chi tiêu ở Phase 4 tự động cập nhật ngay thanh tiến độ ngân sách ở Phase 5.

### Task 5.4: Tests Cho Budget Logic
- **Mục tiêu**: Kiểm thử test cases `TC_BDG_01` đến `TC_BDG_05`.
- **DoD**: Đạt PASS 100% các ngưỡng cảnh báo 80% và 100%.

---
