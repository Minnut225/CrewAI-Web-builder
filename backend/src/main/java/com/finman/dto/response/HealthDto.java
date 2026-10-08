package com.finman.dto.response;

import java.util.Map;

public record HealthDto(
    String status,
    Map<String, Object> details
) {
}