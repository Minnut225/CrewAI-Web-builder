package com.finman.service;

import com.finman.dto.request.TransactionCreateRequest;
import com.finman.dto.request.TransactionUpdateRequest;
import com.finman.dto.response.PagedResponse;
import com.finman.dto.response.TransactionResponse;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;

public interface TransactionService {
    TransactionResponse createTransaction(Long userId, TransactionCreateRequest request);
    TransactionResponse createTransaction(String userEmail, TransactionCreateRequest request);
    TransactionResponse updateTransaction(Long userId, Long id, TransactionUpdateRequest request);
    TransactionResponse updateTransaction(String userEmail, Long id, TransactionUpdateRequest request);
    void deleteTransaction(Long userId, Long id);
    void deleteTransaction(String userEmail, Long id);
    TransactionResponse getTransactionById(Long userId, Long id);
    TransactionResponse getTransactionById(String userEmail, Long id);
    PagedResponse<TransactionResponse> getFilteredTransactions(
            Long userId,
            int page,
            int size,
            String month,
            LocalDate startDate,
            LocalDate endDate,
            Long accountId,
            Long categoryId,
            String type,
            String keyword
    );
    PagedResponse<TransactionResponse> getFilteredTransactions(
            Long userId,
            String month,
            LocalDate startDate,
            LocalDate endDate,
            Long accountId,
            Long categoryId,
            String type,
            String keyword,
            Pageable pageable
    );
    PagedResponse<TransactionResponse> getFilteredTransactions(
            String userEmail,
            String month,
            LocalDate startDate,
            LocalDate endDate,
            Long accountId,
            Long categoryId,
            String type,
            String keyword,
            Pageable pageable
    );
}