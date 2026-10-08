package com.finman.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record TestDto(
    @NotBlank(message = "Tên không được để trống")
    @Size(min = 3, max = 50, message = "Tên phải từ 3 đến 50 ký tự")
    String name,

    @Min(value = 0, message = "Tuổi phải lớn hơn hoặc bằng 0")
    @Max(value = 100, message = "Tuổi phải nhỏ hơn hoặc bằng 100")
    Integer age
) {
}