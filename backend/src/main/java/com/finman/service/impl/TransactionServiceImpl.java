package com.finman.service.impl;

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
import com.finman.service.TransactionService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TransactionServiceImpl implements TransactionService {

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public TransactionResponse createTransaction(Long userId, TransactionCreateRequest request) {
        validateTransactionType(request.type());
        validateAmount(request.amount());
        Account account = accountRepository.findById(request.accountId())
                .orElseThrow(() -> new ResourceNotFoundException("Account not found with id: " + request.accountId()));

        if (account.getUserId() != null && !account.getUserId().equals(userId)) {
            throw new ResourceNotFoundException("Account not found with id: " + request.accountId());
        }

        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.categoryId()));

        applyBalanceChange(account, request.type(), request.amount(), true);

        Transaction transaction = new Transaction();
        transaction.setUserId(userId);
        transaction.setAccount(account);
        transaction.setCategory(category);
        transaction.setAmount(request.amount());
        transaction.setType(request.type().toUpperCase());
        transaction.setTransactionDate(request.transactionDate());
        transaction.setNote(request.note());

        Transaction saved = transactionRepository.save(transaction);
        return mapToResponse(saved);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public TransactionResponse createTransaction(String userEmail, TransactionCreateRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));
        return createTransaction(user.getId(), request);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public TransactionResponse updateTransaction(Long userId, Long id, TransactionUpdateRequest request) {
        validateTransactionType(request.type());
        validateAmount(request.amount());
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with id: " + id));

        if (transaction.getUserId() != null && !transaction.getUserId().equals(userId)) {
            throw new ResourceNotFoundException("Transaction not found with id: " + id);
        }

        applyBalanceChange(transaction.getAccount(), transaction.getType(), transaction.getAmount(), false);

        Account newAccount = accountRepository.findById(request.accountId())
                .orElseThrow(() -> new ResourceNotFoundException("Account not found with id: " + request.accountId()));

        if (newAccount.getUserId() != null && !newAccount.getUserId().equals(userId)) {
            throw new ResourceNotFoundException("Account not found with id: " + request.accountId());
        }

        Category newCategory = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.categoryId()));

        applyBalanceChange(newAccount, request.type(), request.amount(), true);

        transaction.setAccount(newAccount);
        transaction.setCategory(newCategory);
        transaction.setAmount(request.amount());
        transaction.setType(request.type().toUpperCase());
        transaction.setTransactionDate(request.transactionDate());
        transaction.setNote(request.note());

        Transaction updated = transactionRepository.save(transaction);
        return mapToResponse(updated);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public TransactionResponse updateTransaction(String userEmail, Long id, TransactionUpdateRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));
        return updateTransaction(user.getId(), id, request);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteTransaction(Long userId, Long id) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with id: " + id));

        if (transaction.getUserId() != null && !transaction.getUserId().equals(userId)) {
            throw new ResourceNotFoundException("Transaction not found with id: " + id);
        }

        applyBalanceChange(transaction.getAccount(), transaction.getType(), transaction.getAmount(), false);

        transactionRepository.delete(transaction);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteTransaction(String userEmail, Long id) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));
        deleteTransaction(user.getId(), id);
    }

    @Override
    @Transactional(readOnly = true)
    public TransactionResponse getTransactionById(Long userId, Long id) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with id: " + id));

        if (transaction.getUserId() != null && !transaction.getUserId().equals(userId)) {
            throw new ResourceNotFoundException("Transaction not found with id: " + id);
        }

        return mapToResponse(transaction);
    }

    @Override
    @Transactional(readOnly = true)
    public TransactionResponse getTransactionById(String userEmail, Long id) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));
        return getTransactionById(user.getId(), id);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<TransactionResponse> getFilteredTransactions(
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
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "transactionDate", "id"));
        return getFilteredTransactions(userId, month, startDate, endDate, accountId, categoryId, type, keyword, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<TransactionResponse> getFilteredTransactions(
            Long userId,
            String month,
            LocalDate startDate,
            LocalDate endDate,
            Long accountId,
            Long categoryId,
            String type,
            String keyword,
            Pageable pageable
    ) {
        Specification<Transaction> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (userId != null) {
                predicates.add(cb.equal(root.get("userId"), userId));
            }

            if (month != null && !month.isBlank()) {
                try {
                    String[] parts = month.split("-");
                    int year = Integer.parseInt(parts[0]);
                    int m = Integer.parseInt(parts[1]);
                    LocalDate start = LocalDate.of(year, m, 1);
                    LocalDate end = start.withDayOfMonth(start.lengthOfMonth());
                    predicates.add(cb.between(root.get("transactionDate"), start, end));
                } catch (Exception ignored) {}
            }

            if (startDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("transactionDate"), startDate));
            }
            if (endDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("transactionDate"), endDate));
            }
            if (accountId != null) {
                predicates.add(cb.equal(root.get("account").get("id"), accountId));
            }
            if (categoryId != null) {
                predicates.add(cb.equal(root.get("category").get("id"), categoryId));
            }
            if (type != null && !type.isBlank()) {
                predicates.add(cb.equal(cb.upper(root.get("type")), type.toUpperCase()));
            }

            if (keyword != null && !keyword.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("note")), "%" + keyword.toLowerCase() + "%"));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Transaction> pageResult = transactionRepository.findAll(spec, pageable);
        List<TransactionResponse> content = pageResult.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return new PagedResponse<>(
                content,
                pageResult.getNumber(),
                pageResult.getSize(),
                pageResult.getTotalElements(),
                pageResult.getTotalPages(),
                pageResult.isLast()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<TransactionResponse> getFilteredTransactions(
            String userEmail,
            String month,
            LocalDate startDate,
            LocalDate endDate,
            Long accountId,
            Long categoryId,
            String type,
            String keyword,
            Pageable pageable
    ) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));
        return getFilteredTransactions(user.getId(), month, startDate, endDate, accountId, categoryId, type, keyword, pageable);
    }

    private void validateTransactionType(String type) {
        if (type == null || (!type.equalsIgnoreCase("INCOME") && !type.equalsIgnoreCase("EXPENSE"))) {
            throw new IllegalArgumentException("Invalid transaction type: " + type);
        }
    }

    private void validateAmount(Long amount) {
        if (amount == null || amount <= 0) {
            throw new IllegalArgumentException("Amount must be greater than 0");
        }
        if (amount > 10000000000L) {
            throw new IllegalArgumentException("Amount cannot exceed 10 billion VND");
        }
    }

    private void applyBalanceChange(Account account, String type, Long amount, boolean isApply) {
        long multiplier = isApply ? 1L : -1L;
        String upperType = type.toUpperCase();
        long currentBalance = account.getBalance() != null ? account.getBalance() : 0L;

        switch (upperType) {
            case "INCOME":
                account.setBalance(currentBalance + (amount * multiplier));
                break;
            case "EXPENSE":
                account.setBalance(currentBalance - (amount * multiplier));
                break;
            default:
                throw new IllegalArgumentException("Invalid transaction type: " + type);
        }
        accountRepository.save(account);
    }

    private TransactionResponse mapToResponse(Transaction tx) {
        Long accountId = tx.getAccount() != null ? tx.getAccount().getId() : null;
        String accountName = tx.getAccount() != null ? tx.getAccount().getName() : null;
        Long categoryId = tx.getCategory() != null ? tx.getCategory().getId() : null;
        String categoryName = tx.getCategory() != null ? tx.getCategory().getName() : null;
        String categoryIcon = tx.getCategory() != null ? tx.getCategory().getIcon() : null;

        return new TransactionResponse(
                tx.getId(),
                accountId,
                accountName,
                categoryId,
                categoryName,
                categoryIcon,
                tx.getAmount(),
                tx.getType(),
                tx.getTransactionDate(),
                tx.getNote(),
                tx.getCreatedAt()
        );
    }
}
