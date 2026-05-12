package com.bora.orderly.service.impl;
import com.bora.orderly.dto.response.KitchenOrderResponse;
import com.bora.orderly.dto.response.OrderItemResponse;
import com.bora.orderly.entity.Order;
import com.bora.orderly.entity.OrderItem;
import com.bora.orderly.enums.ItemStatus;
import com.bora.orderly.enums.OrderStatus;
import com.bora.orderly.exception.BusinessException;
import com.bora.orderly.exception.ResourceNotFoundException;
import com.bora.orderly.repository.OrderItemRepository;
import com.bora.orderly.repository.OrderRepository;
import com.bora.orderly.service.IKitchenService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.List;
@Service
@RequiredArgsConstructor
@Transactional
public class KitchenServiceImpl implements IKitchenService {
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;

    @Override
    @Transactional(readOnly = true)
    public List<KitchenOrderResponse> getActiveOrders() {
        List<OrderStatus> activeStatuses = List.of(OrderStatus.PENDING, OrderStatus.IN_PROGRESS, OrderStatus.READY);
        return orderRepository.findByStatusIn(activeStatuses)
                .stream()
                .map(this::toKitchenResponse)
                .toList();
    }
    @Override
    public KitchenOrderResponse startOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Sipariş", orderId));
        if (order.getStatus() != OrderStatus.PENDING) {
            throw new BusinessException("Sadece PENDING siparişler başlatılabilir!");
        }
        order.setStatus(OrderStatus.IN_PROGRESS);
        // Tüm kalemleri PREPARING yap
        order.getOrderItems().forEach(item -> item.setItemStatus(ItemStatus.PREPARING));
        orderRepository.save(order);
        return toKitchenResponse(order);
    }
    @Override
    public OrderItemResponse markItemReady(Long itemId) {
        OrderItem item = orderItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Sipariş kalemi", itemId));
        item.setItemStatus(ItemStatus.READY);
        orderItemRepository.save(item);
        // Tüm kalemler hazırsa siparişi de READY yap
        Order order = item.getOrder();
        boolean allReady = order.getOrderItems().stream()
                .allMatch(oi -> oi.getItemStatus() == ItemStatus.READY || oi.getItemStatus() == ItemStatus.SERVED);
        if (allReady) {
            order.setStatus(OrderStatus.READY);
            orderRepository.save(order);
        }
        return OrderItemResponse.builder()
                .id(item.getId())
                .menuItemId(item.getMenuItem().getId())
                .menuItemName(item.getMenuItem().getName())
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .subTotal(item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .itemStatus(item.getItemStatus())
                .notes(item.getNotes())
                .build();
    }
    @Override
    public KitchenOrderResponse completeOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Sipariş", orderId));
        
        order.setStatus(OrderStatus.DELIVERED);
        // Tüm kalemleri de SERVED yap
        order.getOrderItems().forEach(item -> item.setItemStatus(ItemStatus.SERVED));
        
        orderRepository.save(order);
        return toKitchenResponse(order);
    }
    @Override
    public KitchenOrderResponse markAllReady(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Sipariş", orderId));
        
        order.setStatus(OrderStatus.READY);
        // Tüm kalemleri de READY yap
        order.getOrderItems().forEach(item -> item.setItemStatus(ItemStatus.READY));
        
        orderRepository.save(order);
        return toKitchenResponse(order);
    }
    private KitchenOrderResponse toKitchenResponse(Order order) {
        List<OrderItemResponse> items = order.getOrderItems().stream()
                .map(item -> OrderItemResponse.builder()
                        .id(item.getId())
                        .menuItemId(item.getMenuItem().getId())
                        .menuItemName(item.getMenuItem().getName())
                        .quantity(item.getQuantity())
                        .unitPrice(item.getUnitPrice())
                        .subTotal(item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                        .itemStatus(item.getItemStatus())
                        .notes(item.getNotes())
                        .build())
                .toList();
        return KitchenOrderResponse.builder()
                .orderId(order.getId())
                .tableNumber(order.getTable().getTableNumber())
                .orderStatus(order.getStatus())
                .items(items)
                .createdAt(order.getCreatedAt())
                .notes(order.getNotes())
                .build();
    }
}