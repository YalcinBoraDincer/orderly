package com.bora.orderly.service;

import com.bora.orderly.dto.response.KitchenOrderResponse;
import com.bora.orderly.dto.response.OrderItemResponse;
import java.util.List;

public interface IKitchenService {
    List<KitchenOrderResponse> getActiveOrders();
    KitchenOrderResponse startOrder(Long orderId);
    OrderItemResponse markItemReady(Long itemId);
    KitchenOrderResponse completeOrder(Long orderId);
    KitchenOrderResponse markAllReady(Long orderId);
}
