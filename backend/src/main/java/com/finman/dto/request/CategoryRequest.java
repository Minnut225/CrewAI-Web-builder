package com.finman.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CategoryRequest {
    @NotBlank(message = "Category name is required")
    private String name;

    @NotBlank(message = "Category type is required")
    private String type; // INCOME or EXPENSE

    private String icon;

    private String color;
}
