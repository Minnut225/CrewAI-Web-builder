package com.finman.controller;

import com.finman.dto.request.CategoryRequest;
import com.finman.dto.response.ApiResponse;
import com.finman.dto.response.CategoryResponse;
import com.finman.security.UserPrincipal;
import com.finman.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/v1/categories", "/api/v1/categories", "/categories", "/api/categories"})
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getCategories(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        List<CategoryResponse> data = categoryService.getCategoriesForUser(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(data, "Categories retrieved successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> getCategoryById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        CategoryResponse data = categoryService.getCategoryById(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(data, "Category retrieved successfully"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(
            @Valid @RequestBody CategoryRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        CategoryResponse data = categoryService.createCategory(currentUser.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(data, "Category created successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody CategoryRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        CategoryResponse data = categoryService.updateCategory(id, currentUser.getId(), request);
        return ResponseEntity.ok(ApiResponse.success(data, "Category updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        categoryService.deleteCategory(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(null, "Category deleted successfully"));
    }
}
