package com.bora.orderly.dto.response;

import com.bora.orderly.enums.OrderStatus;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class OrderResponse {
    private Long id;
    private Long tableId;
    private String tableNumber;
    private String waiterName;
    private OrderStatus status;
    private BigDecimal totalAmount;
    private BigDecimal paidAmount;
    private BigDecimal remainingAmount;
    private BigDecimal tipAmount;
    private String notes;
    private List<OrderItemResponse> items;
    private LocalDateTime createdAt;
}
