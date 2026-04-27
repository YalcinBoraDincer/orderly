package com.bora.orderly.service;

import com.bora.orderly.dto.request.CreateOrderRequest;
import com.bora.orderly.dto.request.OrderItemRequest;
import com.bora.orderly.dto.request.UpdateOrderStatusRequest;
import com.bora.orderly.dto.response.OrderResponse;
import java.util.List;

public interface IOrderService {
    OrderResponse createOrder(CreateOrderRequest request);
    OrderResponse getOrderById(Long id);
    OrderResponse getActiveOrderByTable(Long tableId);
    OrderResponse updateOrderStatus(Long id, UpdateOrderStatusRequest request);
    OrderResponse addItemsToOrder(Long orderId, List<OrderItemRequest> items);
}
