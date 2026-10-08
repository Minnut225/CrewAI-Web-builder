package com.finman.service;

import com.finman.dto.ai.AiConfirmRequest;
import com.finman.dto.ai.AiInsightsRequest;
import com.finman.dto.ai.AiInsightsResponse;
import com.finman.dto.ai.AiParseResponse;
import com.finman.dto.response.TransactionResponse;

public interface AiService {
    AiParseResponse parseTransaction(String prompt);
    AiInsightsResponse generateInsights(AiInsightsRequest request);
    TransactionResponse confirmTransaction(Long userId, AiConfirmRequest request);
}
