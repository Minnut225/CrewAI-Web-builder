package com.finman.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class BudgetUpdateRequest {
    @NotNull(message = "Budget amount is required")
    @Min(value = 0, message = "Budget amount must be greater than or equal to 0")
    private Long amount;
}
