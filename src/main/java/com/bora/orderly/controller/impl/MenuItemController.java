package com.bora.orderly.controller.impl;

import com.bora.orderly.controller.IMenuItemController;
import com.bora.orderly.dto.request.MenuItemRequest;
import com.bora.orderly.dto.response.MenuItemResponse;
import com.bora.orderly.service.IMenuItemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/menu")
@RequiredArgsConstructor
public class MenuItemController implements IMenuItemController {

    private final IMenuItemService menuItemService;

    @GetMapping
    @Override
    public ResponseEntity<List<MenuItemResponse>> getAllMenuItems() {
        return ResponseEntity.ok(menuItemService.getAllMenuItems());
    }

    @GetMapping("/category/{categoryId}")
    @Override
    public ResponseEntity<List<MenuItemResponse>> getMenuItemsByCategory(@PathVariable Long categoryId) {
        return ResponseEntity.ok(menuItemService.getMenuItemsByCategory(categoryId));
    }

    @GetMapping("/{id}")
    @Override
    public ResponseEntity<MenuItemResponse> getMenuItemById(@PathVariable Long id) {
        return ResponseEntity.ok(menuItemService.getMenuItemById(id));
    }

    @PostMapping
    @Override
    public ResponseEntity<MenuItemResponse> createMenuItem(@Valid @RequestBody MenuItemRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(menuItemService.createMenuItem(request));
    }

    @PutMapping("/{id}")
    @Override
    public ResponseEntity<MenuItemResponse> updateMenuItem(@PathVariable Long id,
                                                           @Valid @RequestBody MenuItemRequest request) {
        return ResponseEntity.ok(menuItemService.updateMenuItem(id, request));
    }

    @PatchMapping("/{id}/availability")
    @Override
    public ResponseEntity<MenuItemResponse> toggleAvailability(@PathVariable Long id) {
        return ResponseEntity.ok(menuItemService.toggleAvailability(id));
    }

    @Override
    @PostMapping("/{id}/image")
    public ResponseEntity<MenuItemResponse> uploadImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) throws IOException {

        MenuItemResponse response = menuItemService.uploadImage(id, file);
        return ResponseEntity.ok(response);
    }

}
