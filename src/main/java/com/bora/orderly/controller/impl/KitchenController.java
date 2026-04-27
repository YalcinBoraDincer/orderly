package com.bora.orderly.controller.impl;

import com.bora.orderly.controller.IKitchenController;
import com.bora.orderly.dto.response.KitchenOrderResponse;
import com.bora.orderly.dto.response.OrderItemResponse;
import com.bora.orderly.service.IKitchenService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/kitchen")
@RequiredArgsConstructor
public class KitchenController implements IKitchenController {

    private final IKitchenService kitchenService;

    @GetMapping("/orders")
    @Override
    public ResponseEntity<List<KitchenOrderResponse>> getActiveOrders() {
        return ResponseEntity.ok(kitchenService.getActiveOrders());
    }

    @PatchMapping("/orders/{orderId}/start")
    @Override
    public ResponseEntity<KitchenOrderResponse> startOrder(@PathVariable Long orderId) {
        return ResponseEntity.ok(kitchenService.startOrder(orderId));
    }

    @PatchMapping("/items/{itemId}/ready")
    @Override
    public ResponseEntity<OrderItemResponse> markItemReady(@PathVariable Long itemId) {
        return ResponseEntity.ok(kitchenService.markItemReady(itemId));
    }
}
