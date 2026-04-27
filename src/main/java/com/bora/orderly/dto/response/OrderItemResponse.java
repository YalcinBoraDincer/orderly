package com.bora.orderly.dto.response;

import com.bora.orderly.enums.ItemStatus;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class OrderItemResponse {
    private Long id;
    private Long menuItemId;
    private String menuItemName;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal subTotal;  // quantity * unitPrice
    private ItemStatus itemStatus;
    private String notes;
}
