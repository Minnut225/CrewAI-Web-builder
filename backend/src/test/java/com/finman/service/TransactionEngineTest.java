package com.finman.service;

import com.finman.dto.request.TransactionCreateRequest;
import com.finman.dto.request.TransactionUpdateRequest;
import com.finman.dto.response.PagedResponse;
import com.finman.dto.response.TransactionResponse;
import com.finman.entity.Account;
import com.finman.entity.Category;
import com.finman.entity.Transaction;
import com.finman.repository.AccountRepository;
import com.finman.repository.CategoryRepository;
import com.finman.repository.TransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class TransactionEngineTest {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private TransactionService transactionService;

    private Account testAccountA;
    private Account testAccountB;
    private Category incomeCategory;
    private Category expenseCategory;

    @BeforeEach
    void setUp() {
        // Setup test accounts with zero-float Long balances
        testAccountA = new Account();
        testAccountA.setUserId(1L);
        testAccountA.setName("Ví tiền mặt");
        testAccountA.setType("CASH");
        testAccountA.setBalance(1000000L); // 1,000,000đ
        testAccountA.setCurrency("VND");
        testAccountA.setIsArchived(false);
        testAccountA = accountRepository.save(testAccountA);

        testAccountB = new Account();
        testAccountB.setUserId(1L);
        testAccountB.setName("Tài khoản Vietcombank");
        testAccountB.setType("BANK");
        testAccountB.setBalance(5000000L); // 5,000,000đ
        testAccountB.setCurrency("VND");
        testAccountB.setIsArchived(false);
        testAccountB = accountRepository.save(testAccountB);

        // Setup categories
        incomeCategory = new Category();
        incomeCategory.setUserId(1L);
        incomeCategory.setName("Lương");
        incomeCategory.setType("INCOME");
        incomeCategory.setIcon("💰");
        incomeCategory = categoryRepository.save(incomeCategory);

        expenseCategory = new Category();
        expenseCategory.setUserId(1L);
        expenseCategory.setName("Ăn uống");
        expenseCategory.setType("EXPENSE");
        expenseCategory.setIcon("🍜");
        expenseCategory = categoryRepository.save(expenseCategory);
    }

    @Test
    @DisplayName("TC_TXN_01: Thêm Thu nhập (INCOME) cập nhật số dư ví chính xác")
    void testTcTxn01_AddIncome() {
        TransactionCreateRequest request = new TransactionCreateRequest(
                testAccountA.getId(),
                incomeCategory.getId(),
                2000000L, // +2,000,000đ
                "INCOME",
                LocalDate.now(),
                "Lương tháng 9"
        );

        TransactionResponse response = transactionService.createTransaction(1L, request);

        assertThat(response).isNotNull();
        assertThat(response.amount()).isEqualTo(2000000L);

        Account updatedAccount = accountRepository.findById(testAccountA.getId()).orElseThrow();
        // Initial 1,000,000 + 2,000,000 = 3,000,000
        assertThat(updatedAccount.getBalance()).isEqualTo(3000000L);
    }

    @Test
    @DisplayName("TC_TXN_02: Thêm Chi tiêu (EXPENSE) trừ số dư ví chính xác")
    void testTcTxn02_AddExpense() {
        TransactionCreateRequest request = new TransactionCreateRequest(
                testAccountA.getId(),
                expenseCategory.getId(),
                800000L, // -800,000đ
                "EXPENSE",
                LocalDate.now(),
                "Ăn trưa"
        );

        TransactionResponse response = transactionService.createTransaction(1L, request);

        assertThat(response).isNotNull();
        Account updatedAccount = accountRepository.findById(testAccountA.getId()).orElseThrow();
        // Initial 1,000,000 - 800,000 = 200,000
        assertThat(updatedAccount.getBalance()).isEqualTo(200000L);
    }

    @Test
    @DisplayName("TC_TXN_03: Chỉnh sửa số tiền giao dịch (Rollback cũ, áp dụng mới)")
    void testTcTxn03_UpdateTransactionAmount() {
        // Create initial expense 800,000đ (Balance becomes 200,000đ)
        TransactionCreateRequest createReq = new TransactionCreateRequest(
                testAccountA.getId(),
                expenseCategory.getId(),
                800000L,
                "EXPENSE",
                LocalDate.now(),
                "Mua sắm ban đầu"
        );

        TransactionResponse created = transactionService.createTransaction(1L, createReq);
        assertThat(accountRepository.findById(testAccountA.getId()).orElseThrow().getBalance()).isEqualTo(200000L);

        // Update amount to 1,000,000đ (Refund 800k -> 1,000k, then deduct 1,000k -> Balance 0đ)
        TransactionUpdateRequest updateReq = new TransactionUpdateRequest(
                testAccountA.getId(),
                expenseCategory.getId(),
                1000000L,
                "EXPENSE",
                LocalDate.now(),
                "Mua sắm đã sửa"
        );

        transactionService.updateTransaction(1L, created.id(), updateReq);

        Account finalAccount = accountRepository.findById(testAccountA.getId()).orElseThrow();
        assertThat(finalAccount.getBalance()).isEqualTo(0L);
    }

    @Test
    @DisplayName("TC_TXN_04: Chỉnh sửa đổi ví phát sinh (Hoàn tiền ví A, trừ tiền ví B)")
    void testTcTxn04_UpdateTransactionAccountMigration() {
        // Create expense 500,000đ on Account A (Balance A: 500,000đ, B: 5,000,000đ)
        TransactionCreateRequest createReq = new TransactionCreateRequest(
                testAccountA.getId(),
                expenseCategory.getId(),
                500000L,
                "EXPENSE",
                LocalDate.now(),
                "Chi tiêu ví A"
        );

        TransactionResponse created = transactionService.createTransaction(1L, createReq);
        assertThat(accountRepository.findById(testAccountA.getId()).orElseThrow().getBalance()).isEqualTo(500000L);

        // Migrate transaction to Account B (Account A refunded +500,000 -> 1,000,000; Account B deducted -500,000 -> 4,500,000)
        TransactionUpdateRequest updateReq = new TransactionUpdateRequest(
                testAccountB.getId(),
                expenseCategory.getId(),
                500000L,
                "EXPENSE",
                LocalDate.now(),
                "Chuyển sang ví B"
        );

        transactionService.updateTransaction(1L, created.id(), updateReq);

        assertThat(accountRepository.findById(testAccountA.getId()).orElseThrow().getBalance()).isEqualTo(1000000L);
        assertThat(accountRepository.findById(testAccountB.getId()).orElseThrow().getBalance()).isEqualTo(4500000L);
    }

    @Test
    @DisplayName("TC_TXN_05: Xóa giao dịch Chi tiêu hoàn trả số dư ví")
    void testTcTxn05_DeleteExpenseTransaction() {
        // Initial A: 1,000,000. Add expense 500,000 -> balance 500,000
        TransactionCreateRequest createReq = new TransactionCreateRequest(
                testAccountA.getId(),
                expenseCategory.getId(),
                500000L,
                "EXPENSE",
                LocalDate.now(),
                "Ăn tối"
        );

        TransactionResponse created = transactionService.createTransaction(1L, createReq);
        assertThat(accountRepository.findById(testAccountA.getId()).orElseThrow().getBalance()).isEqualTo(500000L);

        // Delete transaction -> balance restored to 1,000,000
        transactionService.deleteTransaction(1L, created.id());
        assertThat(accountRepository.findById(testAccountA.getId()).orElseThrow().getBalance()).isEqualTo(1000000L);
    }

    @Test
    @DisplayName("TC_TXN_06: Xóa giao dịch Thu nhập giảm trừ số dư ví")
    void testTcTxn06_DeleteIncomeTransaction() {
        // Initial A: 1,000,000. Add income 1,000,000 -> balance 2,000,000
        TransactionCreateRequest createReq = new TransactionCreateRequest(
                testAccountA.getId(),
                incomeCategory.getId(),
                1000000L,
                "INCOME",
                LocalDate.now(),
                "Thưởng"
        );

        TransactionResponse created = transactionService.createTransaction(1L, createReq);
        assertThat(accountRepository.findById(testAccountA.getId()).orElseThrow().getBalance()).isEqualTo(2000000L);

        // Delete income -> balance returns to 1,000,000
        transactionService.deleteTransaction(1L, created.id());
        assertThat(accountRepository.findById(testAccountA.getId()).orElseThrow().getBalance()).isEqualTo(1000000L);
    }

    @Test
    @DisplayName("TC_TXN_07: Chặn số tiền không hợp lệ (<= 0 hoặc âm)")
    void testTcTxn07_InvalidAmountValidation() {
        TransactionCreateRequest zeroReq = new TransactionCreateRequest(
                testAccountA.getId(),
                expenseCategory.getId(),
                0L, // Invalid zero amount
                "EXPENSE",
                LocalDate.now(),
                "0đ"
        );

        assertThatThrownBy(() -> transactionService.createTransaction(1L, zeroReq))
                .isInstanceOf(IllegalArgumentException.class);

        TransactionCreateRequest negativeReq = new TransactionCreateRequest(
                testAccountA.getId(),
                expenseCategory.getId(),
                -50000L, // Negative amount
                "EXPENSE",
                LocalDate.now(),
                "Âm"
        );

        assertThatThrownBy(() -> transactionService.createTransaction(1L, negativeReq))
                .isInstanceOf(IllegalArgumentException.class);

        TransactionCreateRequest exceedReq = new TransactionCreateRequest(
                testAccountA.getId(),
                expenseCategory.getId(),
                15000000000L, // > 10 billion VND (15 billion)
                "EXPENSE",
                LocalDate.now(),
                "Vượt 10 tỷ"
        );

        assertThatThrownBy(() -> transactionService.createTransaction(1L, exceedReq))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("TC_TXN_08: Tính toàn vẹn Transaction (Rollback khi có lỗi hệ thống)")
    void testTcTxn08_TransactionRollbackIntegrity() {
        // Attempting transaction with non-existent account ID should throw exception and rollback
        TransactionCreateRequest request = new TransactionCreateRequest(
                99999L, // Non-existent account
                expenseCategory.getId(),
                100000L,
                "EXPENSE",
                LocalDate.now(),
                "Lỗi ví"
        );

        assertThatThrownBy(() -> transactionService.createTransaction(1L, request))
                .isInstanceOf(RuntimeException.class);

        // Verify account A balance unchanged
        assertThat(accountRepository.findById(testAccountA.getId()).orElseThrow().getBalance()).isEqualTo(1000000L);
    }

    @Test
    @DisplayName("TC_TXN_09: Lọc giao dịch theo tháng & ngày")
    void testTcTxn09_FilterTransactionsByDate() {
        LocalDate today = LocalDate.now();
        TransactionCreateRequest request = new TransactionCreateRequest(
                testAccountA.getId(),
                expenseCategory.getId(),
                150000L,
                "EXPENSE",
                today,
                "Cà phê sáng"
        );

        transactionService.createTransaction(1L, request);

        PagedResponse<TransactionResponse> paged = transactionService.getFilteredTransactions(
                1L,
                null,
                today,
                today,
                null,
                null,
                null,
                null,
                PageRequest.of(0, 10)
        );

        assertThat(paged.content()).isNotEmpty();
        assertThat(paged.content().stream().anyMatch(t -> "Cà phê sáng".equals(t.note()))).isTrue();
    }
}
