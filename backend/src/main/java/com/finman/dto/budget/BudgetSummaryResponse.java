package com.finman.dto.budget;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BudgetSummaryResponse {
    private String month;
    private Long totalLimit;
    private Long totalBudget;
    private Long totalSpent;
    private Long totalRemaining;
    private Double overallPercentage;
    private Double safetyScore;
    private Map<String, Long> statusBreakdown;
    private List<BudgetCategoryItem> categories;

    public Long getTotalBudget() {
        return totalBudget != null ? totalBudget : totalLimit;
    }

    public Long getTotalLimit() {
        return totalLimit != null ? totalLimit : totalBudget;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BudgetCategoryItem {
        private Long budgetId;
        private Long categoryId;
        private String categoryName;
        private String categoryIcon;
        private String categoryColor;
        private Long limitAmount;
        private Long spentAmount;
        private Long amountSpent;
        private Long remainingAmount;
        private Long remaining;
        private Double percentage;
        private String status; // NORMAL, WARNING, OVERBUDGET, UNSPENT

        public Long getAmountSpent() {
            return amountSpent != null ? amountSpent : spentAmount;
        }

        public Long getSpentAmount() {
            return spentAmount != null ? spentAmount : amountSpent;
        }

        public Long getRemaining() {
            return remaining != null ? remaining : remainingAmount;
        }

        public Long getRemainingAmount() {
            return remainingAmount != null ? remainingAmount : remaining;
        }
    }
}
