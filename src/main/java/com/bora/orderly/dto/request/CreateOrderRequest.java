package com.bora.orderly.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;

@Data
public class CreateOrderRequest {

    @NotNull(message = "Masa seçilmeli")
    private Long tableId;

    private Long waiterId;

    @NotEmpty(message = "Sipariş en az 1 ürün içermeli")
    private List<OrderItemRequest> items;

    private String notes;
}
