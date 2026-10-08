# Technical Blueprint & WBS: Phase 7 - Settings, Profile & App Polish (Task 7.2)

## 1. Architectural Summary & Scope Analysis
Phase 7 (Task 7.2) focuses on the Frontend Settings and Profile screen ("SettingsPage.tsx"), bringing to life the Stitch Web Desktop design mockup with robust integration to backend REST APIs (User profile management, password updates, preferences, notifications, Excel data export, and secure logout).

### Key Components & Requirements:
- **Profile Header & Navigation**: Displays user avatar, full name, email, and primary tab switcher (`Thông tin cá nhân`, `Quản lý tài khoản`, `Danh mục thu chi`, `Cài đặt thông báo`, `Xuất dữ liệu Excel`, `Đăng xuất`).
- **State & Error Handling**: Seamless state sync with `userService`, reactive form validation, toast notifications, and secure redirect on logout.
- **Engineering Standards**: Strict adherence to SOLID, zero-float numeric precision where applicable, camelCase JSON DTO mappings, and React 19 + TypeScript best practices.

---

## 2. Work Breakdown Structure (WBS)

### Backend Tier (Supporting Task 7.2 & 7.1 APIs)
- **Task BE-1**: Data Contracts & Repositories (`User`, `UserSettings`, DTOs for update profile, password change, and preferences).
- **Task BE-2**: Business Logic & Services (`UserServiceImpl` with `@Transactional`, password hashing with BCrypt, settings persistence).
- **Task BE-3**: REST Controllers, Security & Tests (`UserController`, security endpoint mappings, JUnit 5 + Mockito unit tests).

### Frontend Tier (Task 7.2 Focus)
- **Task FE-1**: TypeScript Types & API Services (`userService.ts`, `settings.ts` matching backend DTO contracts 1:1).
- **Task FE-2**: UI Pages, Components & Design System Layout (`SettingsPage.tsx` fully stitched with sidebar, top header, tabs, and export handlers).

### QA Tier
- **Task QA-1**: Acceptance Criteria & Integration Testing (Verification of profile updating, password change, settings sync, data export, and logout flow).

---

## 3. JSON Task Decomposition Manifest
```json
{
  "phase_name": "Phase 7: Settings, Profile & App Polish (APIs + Stitch Settings Screen) [Task 7.2]",
  "summary": "Fullstack atomic decomposition for Settings and Profile management implementing Stitch UI design, robust REST endpoints, ACID transactions, and zero-float precision.",
  "backend_tasks": [
    {
      "task_id": "BE-1",
      "title": "Data Contracts & Repositories",
      "target_files": [
        "backend/src/main/java/com/finman/entity/User.java",
        "backend/src/main/java/com/finman/entity/UserSettings.java",
        "backend/src/main/java/com/finman/dto/UserProfileResponse.java",
        "backend/src/main/java/com/finman/dto/UpdateProfileRequest.java",
        "backend/src/main/java/com/finman/dto/ChangePasswordRequest.java",
        "backend/src/main/java/com/finman/repository/UserRepository.java",
        "backend/src/main/java/com/finman/repository/UserSettingsRepository.java"
      ],
      "details": "JPA entities, snake_case table mappings, camelCase DTO contracts, and Spring Data repositories."
    },
    {
      "task_id": "BE-2",
      "title": "Business Logic & Services (ACID & Precision)",
      "target_files": [
        "backend/src/main/java/com/finman/service/UserService.java",
        "backend/src/main/java/com/finman/service/impl/UserServiceImpl.java"
      ],
      "details": "Service implementations enforcing @Transactional(rollbackFor = Exception.class), BCrypt password hashing, and preference synchronization."
    },
    {
      "task_id": "BE-3",
      "title": "REST Controllers, Security & Tests",
      "target_files": [
        "backend/src/main/java/com/finman/controller/UserController.java",
        "backend/src/main/java/com/finman/config/SecurityConfig.java",
        "backend/src/test/java/com/finman/controller/UserControllerTest.java"
      ],
      "details": "Spring REST endpoints for profile retrieval, update, password change, and Excel data export with unit tests."
    }
  ],
  "frontend_tasks": [
    {
      "task_id": "FE-1",
      "title": "TypeScript Types & API Services",
      "target_files": [
        "frontend/src/types/user.ts",
        "frontend/src/services/userService.ts"
      ],
      "types_detail": "TypeScript interfaces matching backend DTO contracts 1:1.",
      "services_detail": "API service client using authenticated Axios instance for user profile, settings, and export operations."
    },
    {
      "task_id": "FE-2",
      "title": "UI Pages, Components & Design System Layout",
      "target_files": [
        "frontend/src/pages/settings/SettingsPage.tsx"
      ],
      "details": "Stitch-inspired Settings screen featuring profile header, multi-tab layout, preference toggles, Excel export trigger, and secure logout redirection."
    }
  ],
  "acceptance_criteria": [
    "mvn test passes with 0 failures and 0 errors across backend services and controllers",
    "npm run build passes with 0 TypeScript and Vite compilation errors",
    "SettingsPage correctly loads user profile and preferences on mount",
    "Profile updates and password changes persist successfully via backend API",
    "Logout action clears authentication state and redirects to Login page"
  ]
}
```
