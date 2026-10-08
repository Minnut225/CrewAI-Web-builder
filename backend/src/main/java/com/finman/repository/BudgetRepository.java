package com.finman.repository;

import com.finman.entity.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {
    List<Budget> findByUserIdAndMonth(Long userId, String month);
    Optional<Budget> findByUserIdAndCategoryIdAndMonth(Long userId, Long categoryId, String month);

    @Query("SELECT b FROM Budget b LEFT JOIN FETCH b.category WHERE b.userId = :userId AND b.month = :month")
    List<Budget> findByUserIdAndMonthWithCategory(@Param("userId") Long userId, @Param("month") String month);

    void deleteByUserId(Long userId);
}
