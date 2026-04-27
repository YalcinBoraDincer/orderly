package com.bora.orderly.repository;

import com.bora.orderly.entity.Order;
import com.bora.orderly.enums.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByStatus(OrderStatus status);
    List<Order> findByStatusIn(List<OrderStatus> statuses);
    Optional<Order> findByTableIdAndStatusIn(Long tableId, List<OrderStatus> statuses);
}
