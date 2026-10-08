package com.finman.dto.budget;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpsertBudgetRequest {
    @NotNull(message = "Category ID is required")
    private Long categoryId;

    @NotNull(message = "Month is required")
    @Pattern(regexp = "^\\d{4}-(0[1-9]|1[0-2])$", message = "Month must be in format YYYY-MM")
    private String month;

    private Long limitAmount;
    private Long amount;

    public Long getEffectiveAmount() {
        if (limitAmount != null) return limitAmount;
        if (amount != null) return amount;
        return 0L;
    }

    public Long getLimitAmount() {
        return getEffectiveAmount();
    }

    public Long getAmount() {
        return getEffectiveAmount();
    }
}
