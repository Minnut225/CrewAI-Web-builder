package com.finman.repository;

import com.finman.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long>, JpaSpecificationExecutor<Transaction> {

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.userId = :userId AND t.category.id = :categoryId AND t.type = 'EXPENSE' AND CAST(t.transactionDate AS string) LIKE CONCAT(:month, '%')")
    Long sumExpensesByUserAndCategoryAndMonth(@Param("userId") Long userId, @Param("categoryId") Long categoryId, @Param("month") String month);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.userId = :userId AND t.type = 'EXPENSE' AND CAST(t.transactionDate AS string) LIKE CONCAT(:month, '%')")
    Long sumTotalExpensesByUserAndMonth(@Param("userId") Long userId, @Param("month") String month);

    void deleteByUserId(Long userId);
}
