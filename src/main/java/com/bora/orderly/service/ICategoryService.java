package com.bora.orderly.service;

import com.bora.orderly.dto.request.CategoryRequest;
import com.bora.orderly.dto.response.CategoryResponse;
import java.util.List;

public interface ICategoryService {
    List<CategoryResponse> getAllCategories();
    CategoryResponse getCategoryById(Long id);
    CategoryResponse createCategory(CategoryRequest request);
    CategoryResponse updateCategory(Long id, CategoryRequest request);
    void deleteCategory(Long id);
}
