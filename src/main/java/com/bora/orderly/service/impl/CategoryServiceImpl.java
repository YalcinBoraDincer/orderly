package com.bora.orderly.service.impl;

import com.bora.orderly.dto.request.CategoryRequest;
import com.bora.orderly.dto.response.CategoryResponse;
import com.bora.orderly.entity.Category;
import com.bora.orderly.exception.BusinessException;
import com.bora.orderly.exception.ResourceNotFoundException;
import com.bora.orderly.repository.CategoryRepository;
import com.bora.orderly.service.ICategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements ICategoryService {

    private final CategoryRepository categoryRepository;

    @Override
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findByActiveTrueOrderByDisplayOrderAsc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public CategoryResponse getCategoryById(Long id) {
        Category category = categoryRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Kategori",id));
        return toResponse(category);
    }

    @Override
    public CategoryResponse createCategory(CategoryRequest request) {
        // Aynı isimde aktif kategori var mı?
        if (categoryRepository.existsByNameIgnoreCase(request.getName())) {
            throw new BusinessException("'" + request.getName() + "' adında bir kategori zaten mevcut");
        }
        Category category = Category.builder()
                .name(request.getName())
                .description(request.getDescription())
                .displayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 0)
                .active(true)
                .build();
        return toResponse(categoryRepository.save(category));
    }
    @Override
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Kategori", id));
        // Başka bir kategoride aynı isim var mı? (kendisi hariç)
        if (categoryRepository.existsByNameIgnoreCaseAndIdNot(request.getName(), id)) {
            throw new BusinessException("'" + request.getName() + "' adında bir kategori zaten mevcut");
        }
        category.setName(request.getName());
        category.setDescription(request.getDescription());
        if (request.getDisplayOrder() != null) {
            category.setDisplayOrder(request.getDisplayOrder());
        }
        return toResponse(categoryRepository.save(category));
    }

    @Override
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Kategori",id));
        category.setActive(false);
        categoryRepository.save(category);
    }

    private CategoryResponse toResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .displayOrder(category.getDisplayOrder())
                .active(category.getActive())
                .build();
    }

}
