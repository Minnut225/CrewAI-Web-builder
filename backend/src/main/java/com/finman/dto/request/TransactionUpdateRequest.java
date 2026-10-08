package com.finman.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.LocalDate;

public record TransactionUpdateRequest(
    @NotNull(message = "Account ID is required") Long accountId,
    @NotNull(message = "Category ID is required") Long categoryId,
    @NotNull(message = "Amount is required") @Positive(message = "Amount must be positive") @Max(value = 10000000000L, message = "Amount cannot exceed 10 billion VND") Long amount,
    @NotBlank(message = "Type is required") String type,
    @NotNull(message = "Transaction date is required") LocalDate transactionDate,
    String note
) {}
