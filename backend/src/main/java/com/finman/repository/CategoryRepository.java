package com.finman.repository;

import com.finman.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByUserIdIsNull(); // System default categories
    List<Category> findByUserId(Long userId);
    List<Category> findByUserIdIsNullOrUserId(Long userId);
    Optional<Category> findByIdAndUserId(Long id, Long userId);
    Optional<Category> findByNameAndUserId(String name, Long userId);
    void deleteByUserId(Long userId);
}
