package com.finman.controller;

import com.finman.dto.request.TransactionCreateRequest;
import com.finman.dto.request.TransactionUpdateRequest;
import com.finman.dto.response.ApiResponse;
import com.finman.dto.response.PagedResponse;
import com.finman.dto.response.TransactionResponse;
import com.finman.security.UserPrincipal;
import com.finman.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping({"/api/v1/transactions", "/v1/transactions", "/transactions", "/api/transactions"})
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @PostMapping
    public ResponseEntity<ApiResponse<TransactionResponse>> createTransaction(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody TransactionCreateRequest request,
            jakarta.servlet.http.HttpServletRequest servletRequest
    ) {
        TransactionResponse response = transactionService.createTransaction(principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Giao dịch được tạo thành công", response, servletRequest.getRequestURI()));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<TransactionResponse>>> getFilteredTransactions(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String month,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Long accountId,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String keyword,
            jakarta.servlet.http.HttpServletRequest servletRequest
    ) {
        PagedResponse<TransactionResponse> response = transactionService.getFilteredTransactions(
                principal.getId(), page, size, month, startDate, endDate, accountId, categoryId, type, keyword
        );
        return ResponseEntity.ok(ApiResponse.success(response, servletRequest.getRequestURI()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TransactionResponse>> getTransactionById(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            jakarta.servlet.http.HttpServletRequest servletRequest
    ) {
        TransactionResponse response = transactionService.getTransactionById(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success(response, servletRequest.getRequestURI()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TransactionResponse>> updateTransaction(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody TransactionUpdateRequest request,
            jakarta.servlet.http.HttpServletRequest servletRequest
    ) {
        TransactionResponse response = transactionService.updateTransaction(principal.getId(), id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật giao dịch thành công", response, servletRequest.getRequestURI()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTransaction(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            jakarta.servlet.http.HttpServletRequest servletRequest
    ) {
        transactionService.deleteTransaction(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Xóa giao dịch thành công", null, servletRequest.getRequestURI()));
    }
}
