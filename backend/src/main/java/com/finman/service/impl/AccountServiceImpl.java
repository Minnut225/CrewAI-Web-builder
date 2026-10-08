package com.finman.service.impl;

import com.finman.dto.request.AccountRequest;
import com.finman.dto.response.AccountListResponse;
import com.finman.dto.response.AccountResponse;
import com.finman.entity.Account;
import com.finman.repository.AccountRepository;
import com.finman.service.AccountService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AccountServiceImpl implements AccountService {

    private final AccountRepository accountRepository;

    @Override
    @Transactional(readOnly = true)
    public AccountListResponse getAccountsForUser(Long userId) {
        List<Account> accounts = accountRepository.findByUserIdAndIsArchivedFalse(userId);
        
        List<AccountResponse> accountResponses = accounts.stream()
                .map(AccountResponse::fromEntity)
                .collect(Collectors.toList());

        long totalAssets = 0L;
        long totalLiabilities = 0L;

        for (Account account : accounts) {
            long balance = account.getBalance() != null ? account.getBalance() : 0L;
            String type = account.getType() != null ? account.getType().toUpperCase() : "";
            
            // Treat CREDIT or LIABILITY types as liabilities, or negative balance
            if ("CREDIT".equals(type) || "LIABILITY".equals(type) || balance < 0) {
                totalLiabilities += Math.abs(balance);
            } else {
                totalAssets += balance;
            }
        }

        long netWorth = totalAssets - totalLiabilities;
        long totalBalance = totalAssets - totalLiabilities;

        return AccountListResponse.builder()
                .accounts(accountResponses)
                .totalBalance(totalBalance)
                .netWorth(netWorth)
                .totalAssets(totalAssets)
                .totalLiabilities(totalLiabilities)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public AccountResponse getAccountById(Long id, Long userId) {
        Account account = accountRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new EntityNotFoundException("Account not found with id: " + id));
        return AccountResponse.fromEntity(account);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public AccountResponse createAccount(Long userId, AccountRequest request) {
        Account account = Account.builder()
                .userId(userId)
                .name(request.getName())
                .type(request.getType())
                .balance(request.getBalance() != null ? request.getBalance() : 0L)
                .currency(request.getCurrency() != null ? request.getCurrency() : "VND")
                .isArchived(false)
                .build();

        Account saved = accountRepository.save(account);
        log.info("Created account id {} for user id {}", saved.getId(), userId);
        return AccountResponse.fromEntity(saved);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public AccountResponse updateAccount(Long id, Long userId, AccountRequest request) {
        Account account = accountRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new EntityNotFoundException("Account not found with id: " + id));

        account.setName(request.getName());
        account.setType(request.getType());
        account.setBalance(request.getBalance() != null ? request.getBalance() : 0L);
        account.setCurrency(request.getCurrency() != null ? request.getCurrency() : account.getCurrency());

        Account updated = accountRepository.save(account);
        log.info("Updated account id {} for user id {}", updated.getId(), userId);
        return AccountResponse.fromEntity(updated);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void archiveAccount(Long id, Long userId) {
        Account account = accountRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new EntityNotFoundException("Account not found with id: " + id));

        account.setIsArchived(true);
        accountRepository.save(account);
        log.info("Archived account id {} for user id {}", id, userId);
    }
}
