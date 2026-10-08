package com.finman.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class BudgetUpsertRequest {
    @NotNull(message = "ID danh mục không được để trống")
    private Long categoryId;

    @NotNull(message = "Số tiền ngân sách không được để trống")
    @Min(value = 1, message = "Số tiền ngân sách phải lớn hơn 0")
    private Long amount;

    @NotBlank(message = "Tháng ngân sách không được để trống")
    @Pattern(regexp = "^\\d{4}-(0[1-9]|1[0-2])$", message = "Tháng phải có định dạng YYYY-MM")
    private String month; // e.g., "2026-09"
}
