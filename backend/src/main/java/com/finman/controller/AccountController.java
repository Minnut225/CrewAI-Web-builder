package com.finman.controller;

import com.finman.dto.request.AccountRequest;
import com.finman.dto.response.AccountListResponse;
import com.finman.dto.response.AccountResponse;
import com.finman.dto.response.ApiResponse;
import com.finman.security.UserPrincipal;
import com.finman.service.AccountService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({"/v1/accounts", "/api/v1/accounts", "/accounts", "/api/accounts"})
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;

    @GetMapping
    public ResponseEntity<ApiResponse<AccountListResponse>> getAccounts(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        AccountListResponse data = accountService.getAccountsForUser(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(data, "Accounts retrieved successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AccountResponse>> getAccountById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        AccountResponse data = accountService.getAccountById(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(data, "Account retrieved successfully"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AccountResponse>> createAccount(
            @Valid @RequestBody AccountRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        AccountResponse data = accountService.createAccount(currentUser.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(data, "Account created successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AccountResponse>> updateAccount(
            @PathVariable Long id,
            @Valid @RequestBody AccountRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        AccountResponse data = accountService.updateAccount(id, currentUser.getId(), request);
        return ResponseEntity.ok(ApiResponse.success(data, "Account updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAccount(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        accountService.archiveAccount(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(null, "Account archived successfully"));
    }

    @PatchMapping("/{id}/archive")
    public ResponseEntity<ApiResponse<Void>> archiveAccount(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        accountService.archiveAccount(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(null, "Account archived successfully"));
    }
}
