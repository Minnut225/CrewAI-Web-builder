package com.finman.dto.ai;

import jakarta.validation.constraints.NotBlank;

public record AiParseRequest(
    @NotBlank(message = "Prompt cannot be blank")
    String prompt
) {}
