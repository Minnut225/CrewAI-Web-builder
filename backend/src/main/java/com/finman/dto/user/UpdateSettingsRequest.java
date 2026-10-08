package com.finman.dto.user;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateSettingsRequest {

    @Size(min = 3, max = 3, message = "Currency must be a 3-letter ISO code")
    private String currency;

    private String theme;

    private String language;

    private Boolean notificationsEnabled;

    private Boolean emailNotifications;

    private Boolean pushNotifications;

    private Boolean biometricEnabled;

    @JsonProperty("biometricAuth")
    private Boolean biometricAuth;

    private Integer monthlyBudgetAlertThreshold;

    public Boolean getResolvedBiometric() {
        if (biometricEnabled != null) {
            return biometricEnabled;
        }
        return biometricAuth;
    }
}
