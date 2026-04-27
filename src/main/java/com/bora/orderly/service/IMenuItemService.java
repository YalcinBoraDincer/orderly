package com.bora.orderly.service;

import com.bora.orderly.dto.request.MenuItemRequest;
import com.bora.orderly.dto.response.MenuItemResponse;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface IMenuItemService {
    List<MenuItemResponse> getAllMenuItems();
    List<MenuItemResponse> getMenuItemsByCategory(Long categoryId);
    MenuItemResponse getMenuItemById(Long id);
    MenuItemResponse createMenuItem(MenuItemRequest request);
    MenuItemResponse updateMenuItem(Long id, MenuItemRequest request);
    MenuItemResponse toggleAvailability(Long id);
    MenuItemResponse uploadImage(Long id, MultipartFile file) throws IOException;

}
