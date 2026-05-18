package com.bora.orderly.service.impl;

import com.bora.orderly.dto.request.CategoryRequest;
import com.bora.orderly.dto.response.CategoryResponse;
import com.bora.orderly.entity.Category;
import com.bora.orderly.exception.BusinessException;
import com.bora.orderly.repository.CategoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class CategoryServiceImplTest {

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private CategoryServiceImpl categoryService;

    private Category testCategory;
    private CategoryRequest validRequest;

    @BeforeEach
    void setUp() {
        testCategory = Category.builder()
                .id(1L)
                .name("Burgers")
                .description("Delicious burgers")
                .displayOrder(1)
                .active(true)
                .build();

        validRequest = CategoryRequest.builder()
                .name("Burgers")
                .description("Delicious burgers")
                .displayOrder(1)
                .build();
    }

    @Test
    @DisplayName("Kategori adi benzersiz oldugunda basariyla olusturulmali")
    void createCategory_ShouldSuccess_WhenNameIsUnique() {
        when(categoryRepository.existsByNameIgnoreCase("Burgers")).thenReturn(false);
        when(categoryRepository.save(any(Category.class))).thenReturn(testCategory);

        CategoryResponse response = categoryService.createCategory(validRequest);

        assertNotNull(response);
        assertEquals("Burgers", response.getName());
        assertEquals(1, response.getDisplayOrder());
        verify(categoryRepository, times(1)).save(any(Category.class));
    }

    @Test
    @DisplayName("Kategori adi zaten varsa hata firlatmali")
    void createCategory_ShouldThrowException_WhenNameAlreadyExists() {
        when(categoryRepository.existsByNameIgnoreCase("Burgers")).thenReturn(true);

        BusinessException exception = assertThrows(BusinessException.class, () -> {
            categoryService.createCategory(validRequest);
        });

        assertEquals("'Burgers' adında bir kategori zaten mevcut", exception.getMessage());
        verify(categoryRepository, never()).save(any(Category.class));
    }

    @Test
    @DisplayName("Guncellenmek istenen ad baska bir kategoride varsa hata firlatmali")
    void updateCategory_ShouldThrowException_WhenNameAlreadyExistsOnOtherCategory() {
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(testCategory));
        when(categoryRepository.existsByNameIgnoreCaseAndIdNot("Burgers", 1L)).thenReturn(true);

        BusinessException exception = assertThrows(BusinessException.class, () -> {
            categoryService.updateCategory(1L, validRequest);
        });

        assertEquals("'Burgers' adında bir kategori zaten mevcut", exception.getMessage());
        verify(categoryRepository, never()).save(any(Category.class));
    }

    @Test
    @DisplayName("Kategori silindiginde tamamen silinmek yerine soft-delete olmali")
    void deleteCategory_ShouldSoftDeleteCategory() {
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(testCategory));

        categoryService.deleteCategory(1L);

        assertFalse(testCategory.getActive());
        verify(categoryRepository, times(1)).save(testCategory);
        verify(categoryRepository, never()).delete(any(Category.class));
    }
}
