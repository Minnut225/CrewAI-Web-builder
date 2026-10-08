package com.finman.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(
    name = "transactions",
    indexes = {
        @Index(name = "idx_transactions_user_date", columnList = "user_id, transaction_date"),
        @Index(name = "idx_transactions_user_account", columnList = "user_id, account_id"),
        @Index(name = "idx_transactions_user_category", columnList = "user_id, category_id"),
        @Index(name = "idx_transactions_user_type", columnList = "user_id, type"),
        @Index(name = "idx_transactions_note", columnList = "note")
    }
)
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(name = "amount", nullable = false)
    private Long amount; // Zero-Float VND

    @Column(name = "type", nullable = false, length = 20)
    private String type; // e.g. INCOME, EXPENSE, TRANSFER

    @Column(name = "transaction_date", nullable = false)
    private LocalDate transactionDate;

    @Column(name = "note", length = 500)
    private String note;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
