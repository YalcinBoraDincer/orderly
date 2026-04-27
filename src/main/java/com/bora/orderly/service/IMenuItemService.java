package com.bora.orderly.service;

import com.bora.orderly.dto.request.MenuItemRequest;
import com.bora.orderly.dto.response.MenuItemResponse;
import java.util.List;

public interface IMenuItemService {
    List<MenuItemResponse> getAllMenuItems();
    List<MenuItemResponse> getMenuItemsByCategory(Long categoryId);
    MenuItemResponse getMenuItemById(Long id);
    MenuItemResponse createMenuItem(MenuItemRequest request);
    MenuItemResponse updateMenuItem(Long id, MenuItemRequest request);
    MenuItemResponse toggleAvailability(Long id);
}
