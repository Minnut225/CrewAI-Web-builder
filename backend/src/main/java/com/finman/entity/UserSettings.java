package com.finman.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;

@Entity
@Table(
    name = "user_settings",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_user_settings_user_id", columnNames = {"user_id"})
    },
    indexes = {
        @Index(name = "idx_user_settings_user_id", columnList = "user_id")
    }
)
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "currency", nullable = false, length = 10)
    @Builder.Default
    private String currency = "VND";

    @Column(name = "theme", nullable = false, length = 20)
    @Builder.Default
    private String theme = "light"; // light, dark, system

    @Column(name = "language", nullable = false, length = 10)
    @Builder.Default
    private String language = "vi";

    @Column(name = "notifications_enabled", nullable = false)
    @Builder.Default
    private Boolean notificationsEnabled = true;

    @Column(name = "email_notifications", nullable = false)
    @Builder.Default
    private Boolean emailNotifications = true;

    @Column(name = "push_notifications", nullable = false)
    @Builder.Default
    private Boolean pushNotifications = true;

    @Column(name = "biometric_enabled", nullable = false)
    @Builder.Default
    private Boolean biometricEnabled = false;

    @Column(name = "monthly_budget_alert_threshold")
    @Builder.Default
    private Integer monthlyBudgetAlertThreshold = 80; // percentage e.g. 80%

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
