import { api } from './api';
import {
  UserProfile,
  UserSettings,
  UpdateProfileRequest,
  UpdateSettingsRequest,
  ChangePasswordRequest,
  ExportDataResponse,
} from '../types/user';

export const userService = {
  /**
   * Get current user profile
   */
  async getProfile(): Promise<UserProfile> {
    const response = await api.get('/v1/users/profile');
    return response.data.data ?? response.data;
  },

  /**
   * Update current user profile
   */
  async updateProfile(request: UpdateProfileRequest): Promise<UserProfile> {
    const response = await api.put('/v1/users/profile', request);
    return response.data.data ?? response.data;
  },

  /**
   * Get user settings
   */
  async getSettings(): Promise<UserSettings> {
    const response = await api.get('/v1/users/settings');
    return response.data.data ?? response.data;
  },

  /**
   * Update user settings
   */
  async updateSettings(request: UpdateSettingsRequest): Promise<UserSettings> {
    const response = await api.put('/v1/users/settings', request);
    return response.data.data ?? response.data;
  },

  /**
   * Change user password
   */
  async changePassword(request: ChangePasswordRequest): Promise<void> {
    await api.post('/v1/users/change-password', request);
  },

  /**
   * Export user financial data (JSON or CSV)
   */
  async exportData(format: 'json' | 'csv' = 'json'): Promise<ExportDataResponse> {
    const response = await api.get(`/v1/users/export?format=${format}`);
    return response.data.data ?? response.data;
  },

  /**
   * Delete user account
   */
  async deleteAccount(passwordConfirm: string): Promise<void> {
    await api.delete('/v1/users/account', {
      data: { password: passwordConfirm },
    });
  },
};
