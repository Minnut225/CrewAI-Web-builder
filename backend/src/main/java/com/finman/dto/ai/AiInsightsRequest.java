package com.finman.dto.ai;

import jakarta.validation.constraints.NotNull;

public record AiInsightsRequest(
    @NotNull(message = "Monthly income cannot be null")
    Long monthlyIncome,

    @NotNull(message = "Monthly expense cannot be null")
    Long monthlyExpense,

    String topCategory,
    Long topCategoryAmount,
    Long budgetLimit
) {}
