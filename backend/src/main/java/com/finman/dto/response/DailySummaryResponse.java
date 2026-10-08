package com.finman.dto.response;

import java.time.LocalDate;
import java.util.List;

public record DailySummaryResponse(
        LocalDate date,
        Long totalIncome,
        Long totalExpense,
        List<TransactionResponse> transactions
) {}
