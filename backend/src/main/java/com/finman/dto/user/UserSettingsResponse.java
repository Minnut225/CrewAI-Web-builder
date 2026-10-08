package com.finman.dto.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSettingsResponse {
    private Long id;
    private Long userId;
    private String currency;
    private String theme;
    private String language;
    private Boolean notificationsEnabled;
    private Boolean emailNotifications;
    private Boolean pushNotifications;
    private Boolean biometricEnabled;
    private Integer monthlyBudgetAlertThreshold;

    public Boolean getBiometricAuth() {
        return biometricEnabled;
    }
}
