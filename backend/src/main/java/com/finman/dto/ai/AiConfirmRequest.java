package com.finman.dto.ai;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record AiConfirmRequest(
    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    Long amount,

    String type,
    String categoryName,
    Long categoryId,
    String accountName,
    Long accountId,
    String note,
    String description,
    String transactionDate
) {}
