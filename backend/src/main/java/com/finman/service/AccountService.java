package com.finman.service;

import com.finman.dto.request.AccountRequest;
import com.finman.dto.response.AccountListResponse;
import com.finman.dto.response.AccountResponse;

public interface AccountService {
    AccountListResponse getAccountsForUser(Long userId);
    AccountResponse getAccountById(Long id, Long userId);
    AccountResponse createAccount(Long userId, AccountRequest request);
    AccountResponse updateAccount(Long id, Long userId, AccountRequest request);
    void archiveAccount(Long id, Long userId);
}
