package com.finman.dto.user;

import java.time.Instant;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {

    private Long id;

    @NotBlank
    private String name;

    @NotBlank
    private String email;

    private String avatarUrl;

    private String currency;

    private String theme;

    private Boolean notificationsEnabled;

    private Boolean biometricEnabled;

    private Integer monthlyBudgetAlertThreshold;

    private Instant createdAt;

    private Instant updatedAt;
}
