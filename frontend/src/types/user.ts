export interface UserProfile {
  id: number;
  name: string;
  email: string;
  avatarUrl?: string;
  phone?: string;
  bio?: string;
  createdAt?: string;
}

export interface UserSettings {
  id: number;
  userId: number;
  currency: string;
  theme: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  biometricAuth: boolean;
  language: string;
  monthlyBudgetAlertThreshold?: number;
}

export interface UpdateProfileRequest {
  name: string;
  email?: string;
  phone?: string;
  bio?: string;
  avatarUrl?: string;
}

export interface UpdateSettingsRequest {
  currency: string;
  theme: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  biometricAuth: boolean;
  language: string;
  monthlyBudgetAlertThreshold?: number;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ExportDataResponse {
  downloadUrl?: string;
  message?: string;
  data?: any;
}
