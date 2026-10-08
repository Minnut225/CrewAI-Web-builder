package com.finman.service;

import com.finman.dto.budget.BudgetResponse;
import com.finman.dto.budget.BudgetSummaryResponse;
import com.finman.dto.budget.UpsertBudgetRequest;

public interface BudgetService {
    BudgetSummaryResponse getBudgetSummary(Long userId, String month);
    BudgetResponse upsertBudget(Long userId, UpsertBudgetRequest request);
    void deleteBudget(Long userId, Long budgetId);
    String calculateBudgetStatus(Long budgetAmount, Long amountSpent);
}
