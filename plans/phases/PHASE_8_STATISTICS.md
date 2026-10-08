# Phase 8: Statistics & Data Export Fullstack
> **State & Progress**: Trước khi thực thi, bắt buộc đọc `output/progress.md` để nhận diện task đã hoàn thành `[x]` và cập nhật tiến độ sau khi hoàn thành.
> **Engineering Rules**: SOLID, ACID, Zero-Float (`Long`), camelCase DTOs, snake_case DB columns, Stitch UI design tokens.

---

## Phase 8: Statistics & Data Export Fullstack

### Task 8.1: Backend Aggregation & Apache POI Excel Export
- **Mục tiêu**: Viết query tổng hợp số liệu thu/chi theo danh mục và service xuất file `.xlsx` lịch sử giao dịch.
- **Files**: `backend/src/main/java/com/finman/service/ExportService.java`, `ackend/src/main/java/com/finman/controller/ExportController.java`.
- **DoD**: Endpoint `/api/v1/export/excel` stream file Excel chuẩn về client.

### Task 8.2: Frontend Statistics Screen (Bóc tách từ Stitch)
- **Mục tiêu**:
  - **Đọc trực tiếp từ Stitch**: [design/finman_web_th_ng_k_b_o_c_o/code.html].
  - Tạo `frontend/src/pages/statistics/StatisticsPage.tsx`.
  - Tái sử dụng:
    - Tab lọc thời gian: Tuần, Tháng, Hàng năm, Tùy chọn (Period).
    - Biểu đồ tỷ trọng chi tiêu theo danh mục (tỷ lệ % và số tiền).
    - Danh sách chi tiết chi tiêu kèm thanh màu sắc tương ứng.
    - Nút tải file Excel xuất báo cáo.
- **Files**: `frontend/src/pages/statistics/StatisticsPage.tsx`.
- **DoD**: Biểu đồ hiển thị sắc nét, đồng bộ màu sắc với thiết kế Stitch.

### Task 8.3: Kết Nối Frontend Statistics & Tải File Excel
- **Mục tiêu**: Gọi API thống kê đổ dữ liệu vào biểu đồ và kích hoạt tải file `.xlsx` trực tiếp về trình duyệt khi bấm nút Xuất.
- **Files**: `frontend/src/services/statisticsService.ts`.
- **DoD**: Tải về file Excel mở được trên máy tính với dữ liệu tiếng Việt chuẩn Unicode.

### Task 8.4: Tests Cho Statistics & Export
- **Mục tiêu**: Kiểm thử test cases `TC_EXP_01`, `TC_EXP_02`.
- **DoD**: File Excel xuất ra nguyên vẹn, số liệu khớp hoàn toàn với cơ sở dữ liệu.

---
