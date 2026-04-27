package com.bora.orderly.controller.impl;

import com.bora.orderly.controller.IOrderController;
import com.bora.orderly.dto.request.CreateOrderRequest;
import com.bora.orderly.dto.request.OrderItemRequest;
import com.bora.orderly.dto.request.UpdateOrderStatusRequest;
import com.bora.orderly.dto.response.OrderResponse;
import com.bora.orderly.service.IOrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController implements IOrderController {

    private final IOrderService orderService;

    @PostMapping
    @Override
    public ResponseEntity<OrderResponse> createOrder(@Valid @RequestBody CreateOrderRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(orderService.createOrder(request));
    }

    @GetMapping("/{id}")
    @Override
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    @GetMapping("/table/{tableId}/active")
    @Override
    public ResponseEntity<OrderResponse> getActiveOrderByTable(@PathVariable Long tableId) {
        return ResponseEntity.ok(orderService.getActiveOrderByTable(tableId));
    }

    @PatchMapping("/{id}/status")
    @Override
    public ResponseEntity<OrderResponse> updateOrderStatus(@PathVariable Long id,
                                                           @Valid @RequestBody UpdateOrderStatusRequest request) {
        return ResponseEntity.ok(orderService.updateOrderStatus(id, request));
    }

    @PostMapping("/{id}/items")
    @Override
    public ResponseEntity<OrderResponse> addItemsToOrder(@PathVariable Long id,
                                                         @Valid @RequestBody List<OrderItemRequest> items) {
        return ResponseEntity.ok(orderService.addItemsToOrder(id, items));
    }
}
