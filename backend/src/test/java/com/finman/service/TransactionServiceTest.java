package com.finman.service;

import com.finman.dto.request.TransactionCreateRequest;
import com.finman.dto.request.TransactionUpdateRequest;
import com.finman.dto.response.PagedResponse;
import com.finman.dto.response.TransactionResponse;
import com.finman.entity.Account;
import com.finman.entity.Category;
import com.finman.entity.Transaction;
import com.finman.entity.User;
import com.finman.exception.ResourceNotFoundException;
import com.finman.repository.AccountRepository;
import com.finman.repository.CategoryRepository;
import com.finman.repository.TransactionRepository;
import com.finman.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class TransactionServiceTest {

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private com.finman.service.impl.TransactionServiceImpl transactionService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testCreateIncomeTransaction() {
        String email = "test@finman.com";
        User user = new User();
        user.setId(1L);
        user.setEmail(email);

        Account account = new Account();
        account.setId(10L);
        account.setBalance(1000L);

        Category category = new Category();
        category.setId(20L);
        category.setName("Salary");
        category.setIcon("wallet");

        TransactionCreateRequest request = new TransactionCreateRequest(
                10L, 20L, 500L, "INCOME", LocalDate.now(), "Monthly Salary"
        );

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(accountRepository.findById(10L)).thenReturn(Optional.of(account));
        when(categoryRepository.findById(20L)).thenReturn(Optional.of(category));
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(invocation -> {
            Transaction tx = invocation.getArgument(0);
            tx.setId(100L);
            return tx;
        });

        TransactionResponse response = transactionService.createTransaction(email, request);

        assertNotNull(response);
        assertEquals(100L, response.id());
        assertEquals(1500L, account.getBalance()); // 1000 + 500
        verify(accountRepository, times(1)).save(account);
        verify(transactionRepository, times(1)).save(any(Transaction.class));
    }

    @Test
    void testDeleteTransactionRevertsBalance() {
        String email = "test@finman.com";
        User user = new User();
        user.setId(1L);

        Account account = new Account();
        account.setId(10L);
        account.setBalance(1500L);

        Category category = new Category();
        category.setId(20L);
        category.setName("Food");

        Transaction tx = new Transaction();
        tx.setId(100L);
        tx.setUserId(user.getId());
        tx.setAccount(account);
        tx.setCategory(category);
        tx.setAmount(500L);
        tx.setType("EXPENSE");
        tx.setTransactionDate(LocalDate.now());

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(transactionRepository.findById(100L)).thenReturn(Optional.of(tx));

        transactionService.deleteTransaction(email, 100L);

        assertEquals(2000L, account.getBalance()); // 1500 + 500 reverted
        verify(transactionRepository, times(1)).delete(tx);
    }

    @Test
    void testCreateExpenseTransactionDecreasesBalance() {
        String email = "test@finman.com";
        User user = new User();
        user.setId(1L);
        user.setEmail(email);

        Account account = new Account();
        account.setId(10L);
        account.setBalance(2000L);

        Category category = new Category();
        category.setId(25L);
        category.setName("Food");
        category.setIcon("restaurant");

        TransactionCreateRequest request = new TransactionCreateRequest(
                10L, 25L, 300L, "EXPENSE", LocalDate.now(), "Dinner with team"
        );

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(accountRepository.findById(10L)).thenReturn(Optional.of(account));
        when(categoryRepository.findById(25L)).thenReturn(Optional.of(category));
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(invocation -> {
            Transaction tx = invocation.getArgument(0);
            tx.setId(101L);
            return tx;
        });

        TransactionResponse response = transactionService.createTransaction(email, request);

        assertNotNull(response);
        assertEquals(101L, response.id());
        assertEquals(1700L, account.getBalance());
        verify(accountRepository, times(1)).save(account);
        verify(transactionRepository, times(1)).save(any(Transaction.class));
    }

    @Test
    void testDeleteIncomeTransactionRevertsBalance() {
        String email = "test@finman.com";
        User user = new User();
        user.setId(1L);
        user.setEmail(email);

        Account account = new Account();
        account.setId(10L);
        account.setBalance(2500L);

        Category category = new Category();
        category.setId(20L);
        category.setName("Bonus");

        Transaction tx = new Transaction();
        tx.setId(102L);
        tx.setUserId(user.getId());
        tx.setAccount(account);
        tx.setCategory(category);
        tx.setAmount(500L);
        tx.setType("INCOME");
        tx.setTransactionDate(LocalDate.now());

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(transactionRepository.findById(102L)).thenReturn(Optional.of(tx));

        transactionService.deleteTransaction(email, 102L);

        assertEquals(2000L, account.getBalance());
        verify(transactionRepository, times(1)).delete(tx);
    }

    @Test
    void testUpdateTransactionRevertsOldAndAppliesNewBalance() {
        String email = "test@finman.com";
        User user = new User();
        user.setId(1L);
        user.setEmail(email);

        Account account = new Account();
        account.setId(10L);
        account.setBalance(1700L);

        Category oldCat = new Category();
        oldCat.setId(20L);
        oldCat.setName("Coffee");

        Category newCat = new Category();
        newCat.setId(21L);
        newCat.setName("Lunch");

        Transaction tx = new Transaction();
        tx.setId(105L);
        tx.setUserId(user.getId());
        tx.setAccount(account);
        tx.setCategory(oldCat);
        tx.setAmount(300L);
        tx.setType("EXPENSE");
        tx.setTransactionDate(LocalDate.now());

        TransactionUpdateRequest updateReq = new TransactionUpdateRequest(
                10L, 21L, 400L, "EXPENSE", LocalDate.now(), "Updated Lunch"
        );

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(transactionRepository.findById(105L)).thenReturn(Optional.of(tx));
        when(accountRepository.findById(10L)).thenReturn(Optional.of(account));
        when(categoryRepository.findById(21L)).thenReturn(Optional.of(newCat));
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TransactionResponse res = transactionService.updateTransaction(email, 105L, updateReq);

        assertNotNull(res);
        assertEquals(1600L, account.getBalance());
        assertEquals(400L, res.amount());
    }

    @Test
    void testInvalidTransactionTypeThrowsException() {
        String email = "test@finman.com";
        TransactionCreateRequest request = new TransactionCreateRequest(
                10L, 20L, 500L, "INVALID_TYPE", LocalDate.now(), "Note"
        );

        assertThrows(IllegalArgumentException.class, () -> {
            transactionService.createTransaction(1L, request);
        });
    }
}
