package com.finman.service.impl;

import com.finman.dto.request.CategoryRequest;
import com.finman.dto.response.CategoryResponse;
import com.finman.entity.Category;
import com.finman.repository.CategoryRepository;
import com.finman.service.CategoryService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getCategoriesForUser(Long userId) {
        // Returns both system default categories (userId is null) and user-specific categories
        List<Category> categories = categoryRepository.findByUserIdIsNullOrUserId(userId);
        return categories.stream()
                .map(CategoryResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryResponse getCategoryById(Long id, Long userId) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Category not found with id: " + id));

        // Check if category belongs to user or is system default
        if (category.getUserId() != null && !category.getUserId().equals(userId)) {
            throw new EntityNotFoundException("Category not found with id: " + id);
        }

        return CategoryResponse.fromEntity(category);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public CategoryResponse createCategory(Long userId, CategoryRequest request) {
        Category category = Category.builder()
                .userId(userId)
                .name(request.getName())
                .type(request.getType())
                .icon(request.getIcon())
                .build();

        Category saved = categoryRepository.save(category);
        log.info("Created custom category id {} for user id {}", saved.getId(), userId);
        return CategoryResponse.fromEntity(saved);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public CategoryResponse updateCategory(Long id, Long userId, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Category not found with id: " + id));

        if (category.getUserId() == null) {
            throw new IllegalArgumentException("Cannot update system default category");
        }

        if (!category.getUserId().equals(userId)) {
            throw new EntityNotFoundException("Category not found with id: " + id);
        }

        category.setName(request.getName());
        category.setType(request.getType());
        category.setIcon(request.getIcon());

        Category updated = categoryRepository.save(category);
        log.info("Updated custom category id {} for user id {}", id, userId);
        return CategoryResponse.fromEntity(updated);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteCategory(Long id, Long userId) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Category not found with id: " + id));

        // Prevent deleting system categories (userId is null)
        if (category.getUserId() == null) {
            throw new IllegalArgumentException("Cannot delete system default category");
        }

        if (!category.getUserId().equals(userId)) {
            throw new EntityNotFoundException("Category not found with id: " + id);
        }

        categoryRepository.delete(category);
        log.info("Deleted custom category id {} for user id {}", id, userId);
    }
}
