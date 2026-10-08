# Phase 9: Comprehensive Testing, Security Audit & Docker Deployment
> **State & Progress**: Trước khi thực thi, bắt buộc đọc `output/progress.md` để nhận diện task đã hoàn thành `[x]` và cập nhật tiến độ sau khi hoàn thành.
> **Engineering Rules**: SOLID, ACID, Zero-Float (`Long`), camelCase DTOs, snake_case DB columns, Stitch UI design tokens.

---

## Phase 9: Comprehensive Testing, Security Audit & Docker Deployment

### Task 9.1: Chạy Toàn Bộ Test Suite (Backend & Frontend)
- **Mục tiêu**: Thực thi `mvn test` trên Backend và chạy test trên Frontend.
- **DoD**: 100% test cases đều PASS, không có regression bug.

### Task 9.2: Rà Soát Bảo Mật Đa Tầng (Multi-tenant & Injection Audit)
- **Mục tiêu**: Kiểm tra bảo đảm mọi query đều ràng buộc `user_id = currentUserId`, chống tấn công IDOR, XSS.
- **DoD**: Báo cáo kiểm thử bảo mật sạch sẽ, không có lỗ hổng rò rỉ dữ liệu chéo.

### Task 9.3: Docker Compose Production Hoàn Chỉnh
- **Mục tiêu**: Tạo Dockerfile đa tầng cho Spring Boot backend và Nginx cho Frontend, cấu hình `docker-compose.prod.yml` chạy đồng bộ PostgreSQL + Backend + Frontend.
- **Files**: `backend/Dockerfile`, `frontend/Dockerfile`, `docker-compose.prod.yml`.
- **DoD**: Khởi chạy toàn bộ hệ thống bằng 1 lệnh duy nhất: `docker-compose -f docker-compose.prod.yml up -d`.


---

# Bộ Quy Chuẩn Kỹ Thuật Lập Trình Toàn Dự Án (Engineering & Coding Standards)

Khi triển khai các Tasks từ Phase 0 đến Phase 9, lập trình viên (hoặc Autonomous Coding Agent) **bắt buộc phải tuân thủ nghiêm ngặt 5 bộ quy chuẩn sau**:

## 1. Nguyên Tắc Thiết Kế SOLID Trong Từng Tầng Mã Nguồn
- **Tầng Controllers (`controller/`)**:
  - Chỉ làm nhiệm vụ ánh xạ HTTP Request sang DTO, gọi Bean Validation `@Valid`, gọi Service tương ứng và bọc kết quả vào `ResponseEntity.ok(ApiResponse.success(data))`.
  - Không viết câu lệnh SQL, không inject Repository vào Controller, không tính toán logic số dư tại Controller.
- **Tầng Services (`service/`)**:
  - Đóng gói toàn bộ Business Logic. Sử dụng **Constructor Injection** với `@RequiredArgsConstructor` của Lombok.
  - Tách nhỏ Interface theo từng nghiệp vụ (Interface Segregation).
  - Tách rời logic AI sang `AiService` và logic xuất Excel sang `ExportService` (Single Responsibility).
- **Tầng Data Transfer Objects (`dto/`)**:
  - Phân tách rõ rệt `*Request.java` và `*Response.java`.
  - Mọi trường dữ liệu JSON bắt buộc viết theo chuẩn **`camelCase`** (ví dụ: `accountId`, `transactionDate`, `currentBalance`).
  - Sử dụng Bean Validation: `@NotNull`, `@NotBlank`, `@Positive`, `@Size`, `@Email`.

## 2. Bảo Toàn Giao Dịch ACID & Khóa Lạc Quan (Concurrency Control)
- **`@Transactional`**: Mọi phương thức trong `TransactionService`, `AccountService`, `BudgetService` có thao tác ghi/sửa/xóa đều phải khai báo:
  ```java
  @Transactional(rollbackFor = Exception.class)
  ```
- **Khóa lạc quan chống Race Condition**: Thực thể `Account` bắt buộc phải có trường `@Version`:
  ```java
  @Version
  @Column(name = "version")
  private Long version;
  ```
  Nhằm đảm bảo nếu có 2 giao dịch đồng thời cùng cập nhật số dư của 1 ví, hệ thống sẽ tự động phát hiện xung đột và ngăn chặn ghi đè sai số tiền.

## 3. Quy Chuẩn Đặt Tên Toàn Diện (Naming Standards)
- **`camelCase`**:
  - Java/TS variables & methods: `userId`, `accountName`, `currentBalance`, `calculateNetWorth()`.
  - JSON Request & Response body: `{"accountId": 1, "currentBalance": 5000000, "dueDate": "2026-09-30"}`.
- **`snake_case`**:
  - PostgreSQL Table names: `users`, `accounts`, `categories`, `transactions`, `budgets`.
  - PostgreSQL Column names: `user_id`, `current_balance`, `initial_balance`, `password_hash`.
- **`PascalCase`**:
  - Java Classes & Enums: `TransactionController`, `AccountService`, `TransactionType`.
  - React Components & Types: `DashboardPage`, `AddTransactionModal`, `AccountCard`.
- **`SCREAMING_SNAKE_CASE`**:
  - Enums & Constants: `EXPENSE`, `INCOME`, `CASH`, `BANK`, `CREDIT_CARD`, `ROLE_USER`.
  - Environment variables: `OPENAI_API_KEY`, `POSTGRES_DB`, `CREW_PROCESS`.
- **`kebab-case`**:
  - REST API paths: `/api/v1/accounts`, `/api/v1/transactions`, `/api/v1/ai/quick-add`.

## 4. Nguyên Tắc Tiền Tệ Zero-Float
- Cấm sử dụng `float` hoặc `double` cho tiền tệ.
- Dùng `Long` trong Java và `BIGINT` trong PostgreSQL. Đơn vị tiền tệ chuẩn là Đồng (VNĐ).

## 5. Cấu Trúc Phản Hồi JSON Chuẩn Hóa
- Mọi API trả về phải sử dụng lớp bọc thống nhất `ApiResponse<T>`:
  ```json
  {
    "success": true,
    "data": { ... },
    "message": "Thông điệp phản hồi",
    "timestamp": 1758000000000
  }
  ```
