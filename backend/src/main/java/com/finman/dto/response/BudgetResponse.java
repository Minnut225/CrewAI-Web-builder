package com.finman.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BudgetResponse {
    private Long id;
    private Long categoryId;
    private String categoryName;
    private String categoryIcon;
    private Long budgetAmount;   // Zero-Float
    private Long amountSpent;    // Zero-Float
    private Long remaining;      // Zero-Float
    private Double percentage;   // Spent / Budget * 100
    private String status;       // "NORMAL" | "WARNING" | "OVERBUDGET"
    private String month;        // "2026-09"
}
