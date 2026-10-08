# Phase 1: Database Models, Repositories & Data Seeder
> **State & Progress**: Trước khi thực thi, bắt buộc đọc `output/progress.md` để nhận diện task đã hoàn thành `[x]` và cập nhật tiến độ sau khi hoàn thành.
> **Engineering Rules**: SOLID, ACID, Zero-Float (`Long`), camelCase DTOs, snake_case DB columns, Stitch UI design tokens.

---

## Phase 1: Database Models, Repositories & Data Seeder

### Task 1.1: Tạo 5 Thực Thể Entity Cốt Lõi (JPA)
- **Mục tiêu**: Xây dựng 5 entity JPA theo đúng thiết kế ERD trong `ARCHITECTURE.md`:
  - `User.java`: `id`, `email`, `passwordHash`, `fullName`, `avatarUrl`, `createdAt`, `updatedAt`.
  - `Account.java`: `id`, `user`, `name`, `type` (`CASH`, `BANK`, `CREDIT_CARD`), `initialBalance`, `currentBalance`, `creditLimit`, `isArchived`.
  - `Category.java`: `id`, `user`, `name`, `type` (`INCOME`, `EXPENSE`), `icon`, `isDefault`.
  - `Transaction.java`: `id`, `user`, `account`, `category`, `type` (`INCOME`, `EXPENSE`), `amount` (Long), `transactionDate`, `note`.
  - `Budget.java`: `id`, `user`, `category`, `month`, `amount`.
- **Files**: `backend/src/main/java/com/finman/entity/*`.
- **DoD**: Hibernate sinh đúng các bảng và khóa ngoại, số tiền lưu dạng `BIGINT`, không dùng float.

### Task 1.2: Định Nghĩa Constraints, Unique Keys & Indexes
- **Mục tiêu**: Khai báo Unique Constraint cho `users.email`, Unique `(user_id, category_id, month)` trong `Budget`, và các Database Indexes cho tìm kiếm giao dịch.
- **Files**: Các Entity trong `backend/src/main/java/com/finman/entity/*`.
- **DoD**: DB schema thể hiện đầy đủ các ràng buộc toàn vẹn.

### Task 1.3: Tạo Spring Data JPA Repositories
- **Mục tiêu**: Xây dựng các interface Repository kế thừa `JpaRepository` cho `User`, `Account`, `Category`, `Transaction`, `Budget`.
- **Files**: `backend/src/main/java/com/finman/repository/*`.
- **DoD**: Các method truy vấn lọc theo `userId` hoạt động chính xác.

### Task 1.4: Xây Dựng Data Seeder Khởi Tạo Danh Mục Mặc Định
- **Mục tiêu**: Tự động chèn danh mục mặc định (Ăn uống, Giải trí, Lương, Giao thông...) khi app khởi chạy.
- **Files**: `backend/src/main/java/com/finman/config/DataSeeder.java`.
- **DoD**: Khởi động app lần đầu, database có sẵn các danh mục chuẩn với cờ `is_default = true`.

---
