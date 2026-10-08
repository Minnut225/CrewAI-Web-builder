package com.finman.dto.budget;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BudgetResponse {
    private Long id;
    private Long categoryId;
    private String categoryName;
    private String categoryIcon;
    private String categoryColor;
    private Long limitAmount;
    private Long budgetAmount;
    private Long spentAmount;
    private Long remainingAmount;
    private Double percentage;
    private String status; // NORMAL, WARNING, OVERBUDGET, UNSPENT
    private String month;

    public Long getBudgetAmount() {
        return budgetAmount != null ? budgetAmount : limitAmount;
    }

    public Long getLimitAmount() {
        return limitAmount != null ? limitAmount : budgetAmount;
    }
}
