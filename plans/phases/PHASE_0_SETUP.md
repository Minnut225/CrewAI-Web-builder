# Phase 0: Khởi Tạo Monorepo, Backend Spring Boot & Frontend Setup
> **State & Progress**: Trước khi thực thi, bắt buộc đọc `output/progress.md` để nhận diện task đã hoàn thành `[x]` và cập nhật tiến độ sau khi hoàn thành.
> **Engineering Rules**: SOLID, ACID, Zero-Float (`Long`), camelCase DTOs, snake_case DB columns, Stitch UI design tokens.

---

## Phase 0: Khởi Tạo Monorepo, Backend Spring Boot & Frontend Setup

### Task 0.1: Khởi tạo Backend Spring Boot 3.x (`backend/`)
- **Mục tiêu**: Tạo khung dự án Maven Spring Boot 3.x trong thư mục `backend/` với Java 17/21.
- **Phụ thuộc (pom.xml)**: `spring-boot-starter-web`, `spring-boot-starter-data-jpa`, `spring-boot-starter-security`, `spring-boot-starter-validation`, `postgresql`, `jjwt-api`, `jjwt-impl`, `jjwt-jackson`, `lombok`, `poi-ooxml`.
- **Files**: `backend/pom.xml`, `backend/src/main/resources/application.yml`.
- **DoD**: Build thành công bằng `mvn clean compile` trong thư mục `backend/`.

### Task 0.2: Cấu hình Database PostgreSQL & Docker Compose
- **Mục tiêu**: Thiết lập file `docker-compose.yml` chạy PostgreSQL và cấu hình Datasource kết nối.
- **Files**: `docker-compose.yml`, `backend/src/main/resources/application.yml`.
- **DoD**: PostgreSQL khởi động ổn định, kết nối HikariCP thành công.

### Task 0.3: Khởi tạo Frontend Web Project (`frontend/`)
- **Mục tiêu**: Tạo dự án Frontend React 19 + Vite + TypeScript trong thư mục `frontend/`, cấu hình Tailwind CSS, Axios, Lucide React, Google Fonts.
- **Files**: `frontend/package.json`, `frontend/vite.config.ts`, `frontend/index.html`, `frontend/src/App.tsx`.
- **DoD**: Lệnh `npm run dev` khởi chạy thành công và `npm run build` biên dịch sạch sẽ không có lỗi TypeScript.

### Task 0.4: Nhúng Design Tokens & Quy Chuẩn Fintech Prestige Vào Frontend Web
- **Mục tiêu**:
  - **Đọc tài liệu**: Đọc file [design/fintech_prestige/DESIGN.md].
  - Khai báo toàn bộ bảng màu Fintech Prestige (`surface`, `surface-container-*`, `primary`, `secondary`, `tertiary`, `outline`...) vào `frontend/tailwind.config.js`.
  - Cấu hình font chữ `Plus Jakarta Sans` cho headings/body và `Inter` cho `currency-display`, `currency-row` (tabular lining figures) trong `frontend/src/index.css`.
  - Cấu hình các lớp bo góc, shadow glassmorphism, và scrollbar mỏng tùy biến.
- **Files**: `frontend/tailwind.config.js`, `frontend/src/index.css`, `frontend/index.html`.
- **DoD**: Giao diện Web hiển thị đúng 100% mã màu, typography và elevation theo chuẩn Fintech Prestige.

### Task 0.5: Xây dựng Global Exception Handler & ApiResponse Standard (Backend)
- **Mục tiêu**: Chuẩn hóa định dạng JSON phản hồi `ApiResponse<T>` và bắt các lỗi validation, business error.
- **Files**: `backend/src/main/java/com/finman/dto/response/ApiResponse.java`, `backend/src/main/java/com/finman/exception/GlobalExceptionHandler.java`.
- **DoD**: Khi ném Exception, API trả về JSON chuẩn kèm message tiếng Việt rõ ràng.

---
