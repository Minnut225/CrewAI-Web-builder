package com.finman.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.time.YearMonth;

@Entity
@Table(
    name = "budgets",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_budget_user_category_month", columnNames = {"user_id", "category_id", "month"})
    },
    indexes = {
        @Index(name = "idx_budgets_user_month", columnList = "user_id, month")
    }
)
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Budget {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "category_id", nullable = false)
    private Long categoryId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", insertable = false, updatable = false)
    private Category category;

    @Column(name = "amount_limit", nullable = false)
    private Long amountLimit;

    @Column(name = "month", nullable = false, length = 7)
    private String month; // Format: YYYY-MM

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
