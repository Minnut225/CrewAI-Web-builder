package com.finman.service;

import com.finman.dto.budget.BudgetResponse;
import com.finman.dto.budget.BudgetSummaryResponse;
import com.finman.dto.budget.UpsertBudgetRequest;
import com.finman.entity.Budget;
import com.finman.entity.Category;
import com.finman.exception.BadRequestException;
import com.finman.repository.BudgetRepository;
import com.finman.repository.CategoryRepository;
import com.finman.repository.TransactionRepository;
import com.finman.service.impl.BudgetServiceImpl;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BudgetServiceTest {

    @Mock
    private BudgetRepository budgetRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private TransactionRepository transactionRepository;

    @InjectMocks
    private BudgetServiceImpl budgetService;

    @Test
    @DisplayName("TC_BDG_01: Thiết lập ngân sách danh mục chi tiêu thành công (Upsert)")
    void testUpsertBudgetSuccess() {
        Long userId = 1L;
        Category category = Category.builder().id(10L).name("Ăn uống").type("EXPENSE").icon("restaurant").build();
        UpsertBudgetRequest request = UpsertBudgetRequest.builder()
                .categoryId(10L)
                .limitAmount(3000000L)
                .month("2026-09")
                .build();

        when(categoryRepository.findById(10L)).thenReturn(Optional.of(category));
        when(budgetRepository.findByUserIdAndCategoryIdAndMonth(userId, 10L, "2026-09")).thenReturn(Optional.empty());
        when(budgetRepository.save(any(Budget.class))).thenAnswer(invocation -> {
            Budget b = invocation.getArgument(0);
            b.setId(100L);
            return b;
        });
        when(transactionRepository.sumExpensesByUserAndCategoryAndMonth(userId, 10L, "2026-09")).thenReturn(1500000L);

        BudgetResponse response = budgetService.upsertBudget(userId, request);

        assertNotNull(response);
        assertEquals(3000000L, response.getLimitAmount());
        assertEquals("2026-09", response.getMonth());
        assertEquals("NORMAL", response.getStatus());
        assertEquals(1500000L, response.getSpentAmount());
        assertEquals(1500000L, response.getRemainingAmount());
        verify(budgetRepository, times(1)).save(any(Budget.class));
    }

    @Test
    @DisplayName("TC_BDG_02: Chặn tạo ngân sách cho danh mục Thu nhập (INCOME)")
    void testCreateBudgetForIncomeCategoryThrowsException() {
        Long userId = 1L;
        Category incomeCategory = Category.builder().id(20L).name("Lương").type("INCOME").build();
        UpsertBudgetRequest request = UpsertBudgetRequest.builder()
                .categoryId(20L)
                .limitAmount(5000000L)
                .month("2026-09")
                .build();

        when(categoryRepository.findById(20L)).thenReturn(Optional.of(incomeCategory));

        BadRequestException exception = assertThrows(BadRequestException.class, () -> {
            budgetService.upsertBudget(userId, request);
        });

        assertEquals("Chỉ được đặt ngân sách cho danh mục chi tiêu", exception.getMessage());
        verify(budgetRepository, never()).save(any(Budget.class));
    }

    @Test
    @DisplayName("TC_BDG_03: Trạng thái bình thường (< 80%)")
    void testBudgetStatusNormal() {
        // Budget 3,000,000đ, Spent 1,500,000đ (50%)
        String status = budgetService.calculateBudgetStatus(3000000L, 1500000L);
        assertEquals("NORMAL", status);
    }

    @Test
    @DisplayName("TC_BDG_04: Trạng thái sắp chạm ngưỡng (80% - 100%)")
    void testBudgetStatusWarning() {
        // Budget 3,000,000đ, Spent 2,500,000đ (83.3%)
        String status = budgetService.calculateBudgetStatus(3000000L, 2500000L);
        assertEquals("WARNING", status);

        // Exactly 80%
        String status80 = budgetService.calculateBudgetStatus(3000000L, 2400000L);
        assertEquals("WARNING", status80);

        // Exactly 100%
        String status100 = budgetService.calculateBudgetStatus(3000000L, 3000000L);
        assertEquals("WARNING", status100);
    }

    @Test
    @DisplayName("TC_BDG_05: Trạng thái vượt hạn mức (> 100%)")
    void testBudgetStatusOverBudget() {
        // Budget 3,000,000đ, Spent 3,200,000đ (106.6%)
        String status = budgetService.calculateBudgetStatus(3000000L, 3200000L);
        assertEquals("OVERBUDGET", status);
    }

    @Test
    @DisplayName("TC_BDG_06: getBudgetSummary tổng hợp chính xác dữ liệu ngân sách")
    void testGetBudgetSummarySuccess() {
        Long userId = 1L;
        String month = "2026-09";
        Category cat1 = Category.builder().id(10L).name("Ăn uống").type("EXPENSE").icon("restaurant").build();
        Category cat2 = Category.builder().id(11L).name("Mua sắm").type("EXPENSE").icon("shopping_bag").build();

        Budget b1 = Budget.builder().id(1L).userId(userId).categoryId(10L).amountLimit(2000000L).month(month).build();

        when(categoryRepository.findByUserIdIsNullOrUserId(userId)).thenReturn(List.of(cat1, cat2));
        when(budgetRepository.findByUserIdAndMonthWithCategory(userId, month)).thenReturn(List.of(b1));
        when(transactionRepository.sumExpensesByUserAndCategoryAndMonth(userId, 10L, month)).thenReturn(1000000L);
        when(transactionRepository.sumExpensesByUserAndCategoryAndMonth(userId, 11L, month)).thenReturn(500000L);

        BudgetSummaryResponse summary = budgetService.getBudgetSummary(userId, month);

        assertNotNull(summary);
        assertEquals(month, summary.getMonth());
        assertEquals(2000000L, summary.getTotalLimit());
        assertEquals(1500000L, summary.getTotalSpent());
        assertEquals(500000L, summary.getTotalRemaining());
        assertEquals(2, summary.getCategories().size());
    }
}
