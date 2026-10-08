package com.finman.dto.ai;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDate;

public record AiParseResponse(
    Long amount,
    String type,          // Strictly "INCOME" or "EXPENSE"
    String categoryName,
    String description,
    String paymentMethod,
    Double confidence,
    String rawPrompt
) {
    @JsonProperty("accountName")
    public String accountName() {
        return paymentMethod != null && !paymentMethod.isBlank() ? paymentMethod : "Ví tiền mặt";
    }

    @JsonProperty("confidenceScore")
    public Double confidenceScore() {
        return confidence != null ? confidence : 0.95;
    }

    @JsonProperty("transactionDate")
    public String transactionDate() {
        return LocalDate.now().toString();
    }
}
