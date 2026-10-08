package com.finman.controller;

import com.finman.dto.ai.AiConfirmRequest;
import com.finman.dto.ai.AiInsightsRequest;
import com.finman.dto.ai.AiInsightsResponse;
import com.finman.dto.ai.AiParseRequest;
import com.finman.dto.ai.AiParseResponse;
import com.finman.dto.response.ApiResponse;
import com.finman.dto.response.TransactionResponse;
import com.finman.security.UserPrincipal;
import com.finman.service.AiService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({"/v1/ai", "/api/v1/ai", "/ai", "/api/ai"})
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;

    @PostMapping("/process")
    public ResponseEntity<AiParseResponse> processPromptDirect(
            @Valid @RequestBody AiParseRequest request
    ) {
        return ResponseEntity.ok(aiService.parseTransaction(request.prompt()));
    }

    @PostMapping({"/quick-add", "/parse"})
    public ResponseEntity<ApiResponse<AiParseResponse>> parseTransaction(
            @Valid @RequestBody AiParseRequest request
    ) {
        AiParseResponse response = aiService.parseTransaction(request.prompt());
        return ResponseEntity.ok(ApiResponse.success(response, "Transaction prompt parsed successfully"));
    }

    @PostMapping("/insights")
    public ResponseEntity<ApiResponse<AiInsightsResponse>> generateInsights(
            @Valid @RequestBody AiInsightsRequest request
    ) {
        AiInsightsResponse response = aiService.generateInsights(request);
        return ResponseEntity.ok(ApiResponse.success(response, "AI insights generated successfully"));
    }

    @PostMapping("/confirm")
    public ResponseEntity<ApiResponse<TransactionResponse>> confirmTransaction(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody AiConfirmRequest request
    ) {
        Long userId = principal != null ? principal.getId() : 1L;
        TransactionResponse response = aiService.confirmTransaction(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Transaction confirmed and recorded successfully"));
    }
}
