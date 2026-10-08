package com.finman.service.impl;

import com.finman.dto.user.*;
import com.finman.entity.User;
import com.finman.entity.UserSettings;
import com.finman.repository.*;
import com.finman.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserSettingsRepository userSettingsRepository;
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final BudgetRepository budgetRepository;
    private final CategoryRepository categoryRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public UserProfileResponse getUserProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));
        return UserProfileResponse.builder()
                .id(user.getId())
                .name(user.getFullName())
                .email(user.getEmail())
                .avatarUrl(null)
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public UserProfileResponse updateProfile(Long userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));
        if (request.getName() != null && !request.getName().isBlank()) {
            user.setFullName(request.getName());
        }
        User saved = userRepository.save(user);
        log.info("Updated profile for user ID: {}", userId);
        return UserProfileResponse.builder()
                .id(saved.getId())
                .name(saved.getFullName())
                .email(saved.getEmail())
                .avatarUrl(null)
                .createdAt(saved.getCreatedAt())
                .updatedAt(saved.getUpdatedAt())
                .build();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Current password does not match");
        }

        if (!request.getNewPassword().equals(request.getConfirmNewPassword())) {
            throw new IllegalArgumentException("New password and confirmation do not match");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        log.info("Password changed successfully for user ID: {}", userId);
    }

    @Override
    @Transactional(readOnly = true)
    public UserSettingsResponse getUserSettings(Long userId) {
        return userSettingsRepository.findByUserId(userId)
                .map(this::mapToSettingsResponse)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));
                    return UserSettingsResponse.builder()
                            .id(null)
                            .userId(user.getId())
                            .currency("VND")
                            .theme("light")
                            .language("vi")
                            .notificationsEnabled(true)
                            .emailNotifications(true)
                            .pushNotifications(true)
                            .biometricEnabled(false)
                            .monthlyBudgetAlertThreshold(80)
                            .build();
                });
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public UserSettingsResponse updateUserSettings(Long userId, UpdateSettingsRequest request) {
        UserSettings settings = userSettingsRepository.findByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));
                    return UserSettings.builder()
                            .userId(user.getId())
                            .currency("VND")
                            .theme("light")
                            .language("vi")
                            .notificationsEnabled(true)
                            .emailNotifications(true)
                            .pushNotifications(true)
                            .biometricEnabled(false)
                            .monthlyBudgetAlertThreshold(80)
                            .build();
                });

        applySettingsUpdateFields(settings, request);

        try {
            UserSettings saved = userSettingsRepository.save(settings);
            log.info("Updated user settings for user ID: {}", userId);
            return mapToSettingsResponse(saved);
        } catch (org.springframework.dao.DataIntegrityViolationException ex) {
            log.warn("Concurrent user settings creation detected, reloading existing record: {}", ex.getMessage());
            UserSettings existing = userSettingsRepository.findByUserId(userId)
                    .orElseThrow(() -> ex);
            applySettingsUpdateFields(existing, request);
            UserSettings saved = userSettingsRepository.save(existing);
            return mapToSettingsResponse(saved);
        }
    }

    private void applySettingsUpdateFields(UserSettings settings, UpdateSettingsRequest request) {
        if (request.getCurrency() != null && !request.getCurrency().isBlank()) {
            settings.setCurrency(request.getCurrency());
        }
        if (request.getTheme() != null && !request.getTheme().isBlank()) {
            settings.setTheme(request.getTheme());
        }
        if (request.getLanguage() != null && !request.getLanguage().isBlank()) {
            settings.setLanguage(request.getLanguage());
        }
        if (request.getNotificationsEnabled() != null) {
            settings.setNotificationsEnabled(request.getNotificationsEnabled());
        }
        if (request.getEmailNotifications() != null) {
            settings.setEmailNotifications(request.getEmailNotifications());
        }
        if (request.getPushNotifications() != null) {
            settings.setPushNotifications(request.getPushNotifications());
        }
        Boolean biometric = request.getResolvedBiometric();
        if (biometric != null) {
            settings.setBiometricEnabled(biometric);
        }
        if (request.getMonthlyBudgetAlertThreshold() != null) {
            settings.setMonthlyBudgetAlertThreshold(request.getMonthlyBudgetAlertThreshold());
        }
    }

    private UserSettingsResponse mapToSettingsResponse(UserSettings settings) {
        return UserSettingsResponse.builder()
                .id(settings.getId())
                .userId(settings.getUserId())
                .currency(settings.getCurrency())
                .theme(settings.getTheme())
                .language(settings.getLanguage())
                .notificationsEnabled(settings.getNotificationsEnabled())
                .emailNotifications(settings.getEmailNotifications())
                .pushNotifications(settings.getPushNotifications())
                .biometricEnabled(settings.getBiometricEnabled())
                .monthlyBudgetAlertThreshold(settings.getMonthlyBudgetAlertThreshold())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public ExportDataResponse exportData(Long userId) {
        return exportData(userId, "JSON");
    }

    @Override
    @Transactional(readOnly = true)
    public ExportDataResponse exportData(Long userId, String format) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        log.info("Exporting data for user ID: {}, format: {}", userId, format);
        return ExportDataResponse.builder()
                .format(format != null ? format.toUpperCase() : "JSON")
                .downloadUrl("/api/users/" + userId + "/export")
                .generatedAt(java.time.Instant.now().toString())
                .recordCount(0) // Placeholder for actual record count
                .build();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteAccount(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));

        transactionRepository.deleteByUserId(userId);
        budgetRepository.deleteByUserId(userId);
        accountRepository.deleteByUserId(userId);
        categoryRepository.deleteByUserId(userId);
        userSettingsRepository.deleteByUserId(userId);
        userRepository.delete(user);

        log.info("Successfully deleted account and all associated data for user ID: {}", userId);
    }
}
