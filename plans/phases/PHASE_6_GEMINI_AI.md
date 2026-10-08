# Phase 6: Google Gemini AI Fullstack (APIs + Stitch AI Assistant Screen)
> **State & Progress**: Trước khi thực thi, bắt buộc đọc `output/progress.md` để nhận diện task đã hoàn thành `[x]` và cập nhật tiến độ sau khi hoàn thành.
> **Engineering Rules**: SOLID, ACID, Zero-Float (`Long`), camelCase DTOs, snake_case DB columns, Stitch UI design tokens.

---

## Phase 6: Google Gemini AI Fullstack (APIs + Stitch AI Assistant Screen)

### Task 6.1: Backend Gemini AI Client & Structured Prompt Engine
- **Mục tiêu**: Cấu hình Spring REST Client gọi Gemini API (`gemini-2.0-flash`) với prompt bóc tách tiếng Việt ra JSON chuẩn.
- **Files**: `backend/src/main/java/com/finman/config/GeminiConfig.java`, `ackend/src/main/java/com/finman/service/AiService.java`.
- **DoD**: Bóc tách chính xác câu `"Ăn bún bò 45k tiền mặt"` thành JSON giao dịch.

### Task 6.2: Backend Quick-Add & Spending Insights APIs
- **Mục tiêu**: Triển khai `/api/v1/ai/quick-add` và `/api/v1/ai/insights`. Xử lý fallback an toàn khi API AI lỗi.
- **Files**: `backend/src/main/java/com/finman/controller/AiController.java`.
- **DoD**: Trả về form đã điền sẵn cho Quick Add và nhận xét chi tiêu hữu ích bằng tiếng Việt.

### Task 6.3: Frontend AI Assistant Screen (Bóc tách từ Stitch)
- **Mục tiêu**:
  - Tái sử dụng giao diện trợ lý ảo AI trên nền tảng Web Desktop:
    - Khung nhập lệnh AI thông minh với placeholder gợi ý câu nói tự nhiên.
    - Bong bóng chat tư vấn tài chính thông minh qua Gemini.
    - Card xem trước thông tin giao dịch mà AI bóc tách được trước khi lưu (Số tiền, Danh mục, Ví, Ngày).
- **Files**: `frontend/src/pages/ai/AIAssistantPage.tsx`.
- **DoD**: Trải nghiệm nhập liệu bằng AI trực quan, thân thiện, người dùng chỉ cần gõ 1 câu là xong.

### Task 6.4: Tests Cho Google Gemini AI
- **Mục tiêu**: Kiểm thử test cases `TC_AI_01` đến `TC_AI_06` (bao gồm câu có dấu, không dấu, câu rác và lỗi mạng).
- **DoD**: Tất cả các kịch bản AI đều được xử lý an toàn, đạt PASS.

---
