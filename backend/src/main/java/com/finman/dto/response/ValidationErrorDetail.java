package com.finman.dto.response;

public record ValidationErrorDetail(
    String field,
    String message
) {
}