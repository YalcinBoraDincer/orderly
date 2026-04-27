package com.bora.orderly.service.impl;

import com.bora.orderly.dto.request.MenuItemRequest;
import com.bora.orderly.dto.response.MenuItemResponse;
import com.bora.orderly.entity.Category;
import com.bora.orderly.entity.MenuItem;
import com.bora.orderly.exception.ResourceNotFoundException;
import com.bora.orderly.repository.CategoryRepository;
import com.bora.orderly.repository.MenuItemRepository;
import com.bora.orderly.service.IMenuItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;


@Service
@RequiredArgsConstructor
public class MenuItemServiceImpl implements IMenuItemService {

    private final CategoryRepository categoryRepository;
    private final MenuItemRepository menuItemRepository;


    @Override
    public List<MenuItemResponse> getAllMenuItems() {
        return menuItemRepository
                .findByAvailableTrue()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public List<MenuItemResponse> getMenuItemsByCategory(Long categoryId) {
        return menuItemRepository
                .findByCategoryIdAndAvailableTrue(categoryId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public MenuItemResponse getMenuItemById(Long id) {
        MenuItem menuItem = menuItemRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Menu Ogesi", id));
        return toResponse(menuItem);
    }

    @Override
    public MenuItemResponse createMenuItem(MenuItemRequest request) {
        Category category = categoryRepository
                .findById(request.getCategoryId()).orElseThrow(() -> new ResourceNotFoundException("Kategori", request.getCategoryId()));
        MenuItem menuItem =MenuItem.builder()
                .category(category)
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .imageUrl(request.getImageUrl())
                .preparationTimeMinutes(request.getPreparationTimeMinutes() != null ? request.getPreparationTimeMinutes() : 10)
                .available(true)
                .build();
        return toResponse(menuItemRepository.save(menuItem));
    }

    @Override
    public MenuItemResponse updateMenuItem(Long id, MenuItemRequest request) {
        MenuItem menuItem = menuItemRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Menu Ogesi", id));
        Category category = categoryRepository.findById(request.getCategoryId()).orElseThrow(() -> new ResourceNotFoundException("Kategori", request.getCategoryId()));
        menuItem.setCategory(category);
        menuItem.setName(request.getName());
        menuItem.setDescription(request.getDescription());
        menuItem.setPrice(request.getPrice());
        menuItem.setImageUrl(request.getImageUrl());
        if (request.getPreparationTimeMinutes() != null) {
            menuItem.setPreparationTimeMinutes(request.getPreparationTimeMinutes());
        }

        return toResponse(menuItemRepository.save(menuItem));
    }

    @Override
    public MenuItemResponse toggleAvailability(Long id) {
        MenuItem menuItem = menuItemRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Menu Ogesi", id));
        menuItem.setAvailable(!menuItem.getAvailable()); //True-->False,False-->True
        return toResponse(menuItemRepository.save(menuItem));
    }

    private MenuItemResponse toResponse(MenuItem menuItem) {
        return MenuItemResponse.builder()
                .id(menuItem.getId())
                .categoryId(menuItem.getCategory().getId())
                .categoryName(menuItem.getCategory().getName())
                .name(menuItem.getName())
                .description(menuItem.getDescription())
                .price(menuItem.getPrice())
                .imageUrl(menuItem.getImageUrl())
                .preparationTimeMinutes(menuItem.getPreparationTimeMinutes())
                .available(menuItem.getAvailable())
                .build();
    }
}
