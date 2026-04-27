package com.bora.orderly.controller;

import com.bora.orderly.dto.request.CreateOrderRequest;
import com.bora.orderly.dto.request.OrderItemRequest;
import com.bora.orderly.dto.request.UpdateOrderStatusRequest;
import com.bora.orderly.dto.response.OrderResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@Tag(name = "Sipariş Yönetimi", description = "Sipariş oluşturma ve takip API")
public interface IOrderController {

    @Operation(summary = "Yeni sipariş oluştur",
            description = "Masaya sipariş açar, masa otomatik OCCUPIED olur")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Sipariş oluşturuldu"),
            @ApiResponse(responseCode = "400", description = "Masa zaten dolu veya ürün mevcut değil"),
            @ApiResponse(responseCode = "422", description = "Validasyon hatası")
    })
    ResponseEntity<OrderResponse> createOrder(@Valid @RequestBody CreateOrderRequest request);

    @Operation(summary = "Sipariş detayı")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Başarılı"),
            @ApiResponse(responseCode = "404", description = "Sipariş bulunamadı")
    })
    ResponseEntity<OrderResponse> getOrderById(@PathVariable Long id);

    @Operation(summary = "Masanın aktif siparişi",
            description = "Masada o an açık olan siparişi getirir")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Başarılı"),
            @ApiResponse(responseCode = "400", description = "Bu masada aktif sipariş yok")
    })
    ResponseEntity<OrderResponse> getActiveOrderByTable(@PathVariable Long tableId);

    @Operation(summary = "Sipariş durumunu güncelle",
            description = "PENDING → IN_PROGRESS → READY → DELIVERED → CLOSED")
    @ApiResponse(responseCode = "200", description = "Durum güncellendi")
    ResponseEntity<OrderResponse> updateOrderStatus(@PathVariable Long id,
                                                    @Valid @RequestBody UpdateOrderStatusRequest request);

    @Operation(summary = "Siparişe ürün ekle",
            description = "Müşteri sonradan ürün eklemek isterse kullanılır")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Ürünler eklendi"),
            @ApiResponse(responseCode = "400", description = "Kapalı siparişe ekleme yapılamaz")
    })
    ResponseEntity<OrderResponse> addItemsToOrder(@PathVariable Long id,
                                                  @Valid @RequestBody List<OrderItemRequest> items);
}
