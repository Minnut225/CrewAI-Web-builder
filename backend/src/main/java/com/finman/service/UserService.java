package com.finman.service;

import com.finman.dto.user.*;

public interface UserService {
    UserProfileResponse getUserProfile(Long userId);
    UserProfileResponse updateProfile(Long userId, UpdateProfileRequest request);
    void changePassword(Long userId, ChangePasswordRequest request);
    UserSettingsResponse getUserSettings(Long userId);
    UserSettingsResponse updateUserSettings(Long userId, UpdateSettingsRequest request);
    ExportDataResponse exportData(Long userId);
    ExportDataResponse exportData(Long userId, String format);
    void deleteAccount(Long userId);
}
