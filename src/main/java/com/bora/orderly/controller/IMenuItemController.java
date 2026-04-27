package com.bora.orderly.controller;

import com.bora.orderly.dto.request.MenuItemRequest;
import com.bora.orderly.dto.response.MenuItemResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@Tag(name = "Menü Yönetimi", description = "Menü öğelerini yönetmek için API")
public interface IMenuItemController {

    @Operation(summary = "Tüm menü öğelerini listele", description = "Sadece müsait ürünleri getirir")
    @ApiResponse(responseCode = "200", description = "Başarılı")
    ResponseEntity<List<MenuItemResponse>> getAllMenuItems();

    @Operation(summary = "Kategoriye göre menü öğeleri")
    @ApiResponse(responseCode = "200", description = "Başarılı")
    ResponseEntity<List<MenuItemResponse>> getMenuItemsByCategory(@PathVariable Long categoryId);

    @Operation(summary = "Menü öğesi detayı")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Başarılı"),
            @ApiResponse(responseCode = "404", description = "Ürün bulunamadı")
    })
    ResponseEntity<MenuItemResponse> getMenuItemById(@PathVariable Long id);

    @Operation(summary = "Yeni menü öğesi ekle")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Oluşturuldu"),
            @ApiResponse(responseCode = "422", description = "Validasyon hatası")
    })
    ResponseEntity<MenuItemResponse> createMenuItem(@Valid @RequestBody MenuItemRequest request);

    @Operation(summary = "Menü öğesi güncelle")
    @ApiResponse(responseCode = "200", description = "Güncellendi")
    ResponseEntity<MenuItemResponse> updateMenuItem(@PathVariable Long id,
                                                    @Valid @RequestBody MenuItemRequest request);

    @Operation(summary = "Ürün müsaitliğini aç/kapat",
            description = "Stokta yoksa veya geçici kaldırılacaksa kullanılır")
    @ApiResponse(responseCode = "200", description = "Müsaitlik güncellendi")
    ResponseEntity<MenuItemResponse> toggleAvailability(@PathVariable Long id);
}
