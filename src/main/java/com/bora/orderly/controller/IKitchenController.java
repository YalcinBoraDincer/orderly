package com.bora.orderly.controller;

import com.bora.orderly.dto.response.KitchenOrderResponse;
import com.bora.orderly.dto.response.OrderItemResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import java.util.List;

@Tag(name = "Mutfak Ekranı", description = "Mutfak personeli için sipariş takip API")
public interface IKitchenController {

    @Operation(summary = "Aktif siparişleri getir",
            description = "PENDING ve IN_PROGRESS durumdaki tüm siparişleri getirir")
    @ApiResponse(responseCode = "200", description = "Başarılı")
    ResponseEntity<List<KitchenOrderResponse>> getActiveOrders();

    @Operation(summary = "Siparişi hazırlamaya başla",
            description = "Sipariş PENDING → IN_PROGRESS, tüm kalemler PREPARING olur")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Başarıldı"),
            @ApiResponse(responseCode = "400", description = "Sadece PENDING siparişler başlatılabilir"),
            @ApiResponse(responseCode = "404", description = "Sipariş bulunamadı")
    })
    ResponseEntity<KitchenOrderResponse> startOrder(@PathVariable Long orderId);

    @Operation(summary = "Kalemi hazır işaretle",
            description = "Tüm kalemler hazırsa sipariş otomatik READY olur")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Kalem hazır işaretlendi"),
            @ApiResponse(responseCode = "404", description = "Kalem bulunamadı")
    })
    ResponseEntity<OrderItemResponse> markItemReady(@PathVariable Long itemId);

    @Operation(summary = "Siparişi tamamla / Servis edildi",
            description = "Sipariş READY → DELIVERED olur, ekrandan düşer")
    @ApiResponse(responseCode = "200", description = "Sipariş teslim edildi")
    ResponseEntity<KitchenOrderResponse> completeOrder(@PathVariable Long orderId);

    @Operation(summary = "Tüm sipariş kalemlerini hazır işaretle",
            description = "Siparişteki tüm kalan kalemler tek seferde READY olur, sipariş durumu da READY'ye geçer")
    @ApiResponse(responseCode = "200", description = "Tüm ürünler hazır yapıldı")
    ResponseEntity<KitchenOrderResponse> markAllReady(@PathVariable Long orderId);
}
