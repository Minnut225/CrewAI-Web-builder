package com.finman.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class BudgetCreateRequest {
    @NotNull(message = "Category ID is required")
    private Long categoryId;

    @NotNull(message = "Budget amount is required")
    @Min(value = 0, message = "Budget amount must be greater than or equal to 0")
    private Long amount;

    @NotNull(message = "Month is required")
    @Pattern(regexp = "^\\d{4}-(0[1-9]|1[0-2])$", message = "Month must be in YYYY-MM format")
    private String month; // e.g. "2025-05"
}
