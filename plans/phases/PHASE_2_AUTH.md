# Phase 2: Authentication Fullstack (Spring Security + Stitch Auth Screens)
> **State & Progress**: Trước khi thực thi, bắt buộc đọc `output/progress.md` để nhận diện task đã hoàn thành `[x]` và cập nhật tiến độ sau khi hoàn thành.
> **Engineering Rules**: SOLID, ACID, Zero-Float (`Long`), camelCase DTOs, snake_case DB columns, Stitch UI design tokens.

---

## Phase 2: Authentication Fullstack (Spring Security + Stitch Auth Screens)

### Task 2.1: Cấu hình Spring Security 6 & JWT Token Provider
- **Mục tiêu**: Cấu hình Stateless SecurityFilterChain, BCrypt, JWT Provider sinh/giải mã token.
- **Files**: `backend/src/main/java/com/finman/config/SecurityConfig.java`, `security/JwtTokenProvider.java`, `security/JwtAuthenticationFilter.java`.
- **DoD**: Token hợp lệ giải mã đúng `userId`, request không token bị chặn `401`.

### Task 2.2: Backend Auth APIs (`/api/v1/auth/register`, `/login`, `/me`)
- **Mục tiêu**: Xử lý đăng ký (tự tạo ví "Tiền mặt" ban đầu), đăng nhập trả về JWT token, và lấy thông tin cá nhân.
- **Files**: `backend/src/main/java/com/finman/controller/AuthController.java`, `ackend/src/main/java/com/finman/service/AuthService.java`.
- **DoD**: Đăng ký và đăng nhập thành công qua Postman, kiểm tra trùng email chặt chẽ.

### Task 2.3: Frontend Auth Screens (React Web SPA từ Stitch)
- **Mục tiêu**:
  - **Đọc trực tiếp từ Stitch Web**:
    - [design/finman_web_ng_nh_p_h_th_ng/code.html] → Tạo `frontend/src/pages/auth/LoginPage.tsx`.
    - [design/finman_web_ng_k_t_i_kho_n/code.html] → Tạo `frontend/src/pages/auth/RegisterPage.tsx`.
  - Tái sử dụng trọn vẹn cấu trúc Desktop split-screen, hero showcase cards, form input có icon Material Symbols, nút ẩn/hiện mật khẩu, Google login trigger, và logo FM.
- **Files**: `frontend/src/pages/auth/LoginPage.tsx`, `frontend/src/pages/auth/RegisterPage.tsx`.
- **DoD**: Các màn hình Auth hiển thị đúng 100% so với thiết kế Web Stitch, build thành công với Vite.

### Task 2.4: Kết Nối Frontend Auth Với Backend API
- **Mục tiêu**: Gửi request đăng nhập/đăng ký từ form Web tới Spring Boot backend, lưu token vào `localStorage`, tự động gán Bearer Token vào Axios Request Interceptor, chuyển hướng tới Web Dashboard sau khi xác thực thành công.
- **Files**: `frontend/src/services/api.ts`, `frontend/src/context/AuthContext.tsx`.
- **DoD**: Đăng ký và đăng nhập mượt mà trên trình duyệt Web, tự động lưu token và đồng bộ trạng thái User.

### Task 2.5: Unit Test Cho Luồng Xác Thực
- **Mục tiêu**: Viết Unit Test cho `AuthService` (Backend) và kiểm tra validate form Auth (Frontend).
- **Files**: `backend/src/test/java/com/finman/service/AuthServiceTest.java`.
- **DoD**: Test cases `TC_AUTH_01` đến `TC_AUTH_07` đạt PASS 100%.

### Task 2.6: Tích Hợp Google OAuth 2.0 Fullstack (Backend & Frontend Web)
- **Mục tiêu**:
  - Backend: Xây dựng endpoint `POST /api/v1/auth/google` xử lý xác thực token Google / tài khoản Google, tự động tạo User + Ví tiền mặt 0đ ban đầu nếu là người dùng mới, và cấp phát token JWT FinMan.
  - Frontend: Tích hợp nút đăng nhập Google OAuth trên Web, kết nối trigger Google với `login` trong `AuthContext`.
- **Files**: `backend/src/main/java/com/finman/dto/request/GoogleAuthRequest.java`, `backend/src/main/java/com/finman/ackend/src/main/java/com/finman/service/AuthService.java`, `backend/src/main/java/com/finman/controller/AuthController.java`, `frontend/src/pages/auth/LoginPage.tsx`, `frontend/src/context/AuthContext.tsx`.
- **DoD**: Bấm "Đăng nhập với Google" đăng nhập thành công vào ứng dụng và nhận token JWT thật từ backend.

---
