package com.finman.service;

import com.finman.dto.request.CategoryRequest;
import com.finman.dto.response.CategoryResponse;

import java.util.List;

public interface CategoryService {
    List<CategoryResponse> getCategoriesForUser(Long userId);
    CategoryResponse getCategoryById(Long id, Long userId);
    CategoryResponse createCategory(Long userId, CategoryRequest request);
    CategoryResponse updateCategory(Long id, Long userId, CategoryRequest request);
    void deleteCategory(Long id, Long userId);
}
