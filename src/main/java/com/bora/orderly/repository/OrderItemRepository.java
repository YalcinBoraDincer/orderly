package com.bora.orderly.repository;

import com.bora.orderly.entity.OrderItem;
import com.bora.orderly.enums.ItemStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    List<OrderItem> findByOrderId(Long orderId);
    List<OrderItem> findByItemStatus(ItemStatus status);
}
