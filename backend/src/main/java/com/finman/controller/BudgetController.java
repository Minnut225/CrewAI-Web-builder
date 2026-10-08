package com.finman.controller;

import com.finman.dto.budget.BudgetResponse;
import com.finman.dto.budget.BudgetSummaryResponse;
import com.finman.dto.budget.UpsertBudgetRequest;
import com.finman.dto.response.ApiResponse;
import com.finman.security.UserPrincipal;
import com.finman.service.BudgetService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({"/api/v1/budgets", "/v1/budgets", "/budgets", "/api/budgets"})
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;

    @GetMapping
    public ResponseEntity<ApiResponse<BudgetSummaryResponse>> getBudgetSummary(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(value = "month", required = false) String month,
            HttpServletRequest request
    ) {
        BudgetSummaryResponse summary = budgetService.getBudgetSummary(principal.getId(), month);
        return ResponseEntity.ok(ApiResponse.success(summary, request.getRequestURI()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BudgetResponse>> upsertBudget(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody UpsertBudgetRequest budgetRequest,
            HttpServletRequest request
    ) {
        BudgetResponse response = budgetService.upsertBudget(principal.getId(), budgetRequest);
        return ResponseEntity.ok(ApiResponse.success("Thiết lập ngân sách thành công", response, request.getRequestURI()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteBudget(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable("id") Long id,
            HttpServletRequest request
    ) {
        budgetService.deleteBudget(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Xóa ngân sách thành công", null, request.getRequestURI()));
    }
}
