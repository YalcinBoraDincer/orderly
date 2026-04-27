package com.bora.orderly.dto.response;

import com.bora.orderly.enums.OrderStatus;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class KitchenOrderResponse {
    private Long orderId;
    private String tableNumber; // mutfağın bilmesi gereken tek masa bilgisi
    private OrderStatus orderStatus;
    private List<OrderItemResponse> items;
    private LocalDateTime createdAt;
    private String notes;
}
