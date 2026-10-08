package com.finman.dto.response;

import java.time.Instant;
import java.time.LocalDate;

public record TransactionResponse(
    Long id,
    Long accountId,
    String accountName,
    Long categoryId,
    String categoryName,
    String categoryIcon,
    Long amount,
    String type,
    LocalDate transactionDate,
    String note,
    Instant createdAt
) {}
