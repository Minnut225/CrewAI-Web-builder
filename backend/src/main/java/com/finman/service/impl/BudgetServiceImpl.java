package com.finman.service.impl;

import com.finman.dto.budget.BudgetResponse;
import com.finman.dto.budget.BudgetSummaryResponse;
import com.finman.dto.budget.UpsertBudgetRequest;
import com.finman.entity.Budget;
import com.finman.entity.Category;
import com.finman.exception.BadRequestException;
import com.finman.exception.ResourceNotFoundException;
import com.finman.repository.BudgetRepository;
import com.finman.repository.CategoryRepository;
import com.finman.repository.TransactionRepository;
import com.finman.service.BudgetService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class BudgetServiceImpl implements BudgetService {

    private final BudgetRepository budgetRepository;
    private final CategoryRepository categoryRepository;
    private final TransactionRepository transactionRepository;

    @Override
    public String calculateBudgetStatus(Long budgetAmount, Long amountSpent) {
        if (budgetAmount == null || budgetAmount <= 0) {
            return (amountSpent != null && amountSpent > 0) ? "OVERBUDGET" : "NORMAL";
        }
        long spent = amountSpent != null ? amountSpent : 0L;
        double percentage = (spent * 100.0) / budgetAmount;
        if (percentage > 100.0) {
            return "OVERBUDGET";
        } else if (percentage >= 80.0) {
            return "WARNING";
        } else {
            return "NORMAL";
        }
    }

    @Override
    @Transactional(readOnly = true)
    public BudgetSummaryResponse getBudgetSummary(Long userId, String month) {
        if (month == null || month.trim().isEmpty()) {
            month = YearMonth.now().toString();
        }

        // Fetch user expense categories
        List<Category> allCategories = categoryRepository.findByUserIdIsNullOrUserId(userId);
        List<Category> expenseCategories = allCategories.stream()
                .filter(c -> "EXPENSE".equalsIgnoreCase(c.getType()))
                .collect(Collectors.toList());

        // Fetch existing budgets for user in this month
        List<Budget> budgets = budgetRepository.findByUserIdAndMonthWithCategory(userId, month);
        Map<Long, Budget> categoryBudgetMap = budgets.stream()
                .collect(Collectors.toMap(Budget::getCategoryId, b -> b, (b1, b2) -> b1));

        List<BudgetSummaryResponse.BudgetCategoryItem> categoryItems = new ArrayList<>();
        long totalLimit = 0L;
        long totalSpent = 0L;
        long overbudgetCount = 0;
        long warningCount = 0;
        long normalCount = 0;

        for (Category cat : expenseCategories) {
            Budget budget = categoryBudgetMap.get(cat.getId());
            Long limitAmount = budget != null ? budget.getAmountLimit() : 0L;
            Long spent = transactionRepository.sumExpensesByUserAndCategoryAndMonth(userId, cat.getId(), month);
            if (spent == null) spent = 0L;

            Long remaining = Math.max(0L, limitAmount - spent);
            double percentage = limitAmount > 0 ? (spent * 100.0) / limitAmount : (spent > 0 ? 100.0 : 0.0);
            String status = calculateBudgetStatus(limitAmount, spent);

            if ("OVERBUDGET".equals(status)) {
                overbudgetCount++;
            } else if ("WARNING".equals(status)) {
                warningCount++;
            } else {
                normalCount++;
            }

            if (limitAmount > 0) {
                totalLimit += limitAmount;
            }
            totalSpent += spent;

            categoryItems.add(BudgetSummaryResponse.BudgetCategoryItem.builder()
                    .budgetId(budget != null ? budget.getId() : null)
                    .categoryId(cat.getId())
                    .categoryName(cat.getName())
                    .categoryIcon(cat.getIcon())
                    .categoryColor(null)
                    .limitAmount(limitAmount)
                    .spentAmount(spent)
                    .amountSpent(spent)
                    .remainingAmount(remaining)
                    .remaining(remaining)
                    .percentage(Math.round(percentage * 10.0) / 10.0)
                    .status(status)
                    .build());
        }

        // Sort items: configured budgets first, then highest spent
        categoryItems.sort((a, b) -> {
            boolean aHasBudget = a.getLimitAmount() > 0;
            boolean bHasBudget = b.getLimitAmount() > 0;
            if (aHasBudget != bHasBudget) {
                return aHasBudget ? -1 : 1;
            }
            return Long.compare(b.getSpentAmount(), a.getSpentAmount());
        });

        long totalRemaining = Math.max(0L, totalLimit - totalSpent);
        double overallPercentage = totalLimit > 0 ? (totalSpent * 100.0) / totalLimit : 0.0;
        double safetyScore = Math.max(0.0, 100.0 - overallPercentage);

        Map<String, Long> statusBreakdown = new HashMap<>();
        statusBreakdown.put("OVERBUDGET", overbudgetCount);
        statusBreakdown.put("WARNING", warningCount);
        statusBreakdown.put("NORMAL", normalCount);

        return BudgetSummaryResponse.builder()
                .month(month)
                .totalLimit(totalLimit)
                .totalBudget(totalLimit)
                .totalSpent(totalSpent)
                .totalRemaining(totalRemaining)
                .overallPercentage(Math.round(overallPercentage * 10.0) / 10.0)
                .safetyScore(Math.round(safetyScore * 10.0) / 10.0)
                .statusBreakdown(statusBreakdown)
                .categories(categoryItems)
                .build();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public BudgetResponse upsertBudget(Long userId, UpsertBudgetRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy danh mục"));

        if (!"EXPENSE".equalsIgnoreCase(category.getType())) {
            throw new BadRequestException("Chỉ được đặt ngân sách cho danh mục chi tiêu");
        }

        Long amountLimit = request.getEffectiveAmount();
        if (amountLimit < 0) {
            throw new BadRequestException("Hạn mức ngân sách phải lớn hơn hoặc bằng 0");
        }

        Budget budget = budgetRepository.findByUserIdAndCategoryIdAndMonth(userId, request.getCategoryId(), request.getMonth())
                .orElseGet(() -> Budget.builder()
                        .userId(userId)
                        .categoryId(category.getId())
                        .month(request.getMonth())
                        .build());

        budget.setAmountLimit(amountLimit);
        Budget savedBudget = budgetRepository.save(budget);

        Long spent = transactionRepository.sumExpensesByUserAndCategoryAndMonth(userId, category.getId(), request.getMonth());
        if (spent == null) spent = 0L;

        Long remaining = Math.max(0L, amountLimit - spent);
        double percentage = amountLimit > 0 ? (spent * 100.0) / amountLimit : (spent > 0 ? 100.0 : 0.0);
        String status = calculateBudgetStatus(amountLimit, spent);

        return BudgetResponse.builder()
                .id(savedBudget.getId())
                .categoryId(category.getId())
                .categoryName(category.getName())
                .categoryIcon(category.getIcon())
                .categoryColor(null)
                .limitAmount(savedBudget.getAmountLimit())
                .budgetAmount(savedBudget.getAmountLimit())
                .spentAmount(spent)
                .remainingAmount(remaining)
                .percentage(Math.round(percentage * 10.0) / 10.0)
                .status(status)
                .month(savedBudget.getMonth())
                .build();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteBudget(Long userId, Long budgetId) {
        Budget budget = budgetRepository.findById(budgetId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy ngân sách"));

        if (!budget.getUserId().equals(userId)) {
            throw new ResourceNotFoundException("Không tìm thấy ngân sách");
        }

        budgetRepository.delete(budget);
        log.info("Deleted budget id {} for user {}", budgetId, userId);
    }
}
