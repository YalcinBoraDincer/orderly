package com.bora.orderly.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateOrderRequest {

    @NotNull(message = "Masa seçilmeli")
    private Long tableId;

    private Long waiterId;

    @NotEmpty(message = "Sipariş en az 1 ürün içermeli")
    private List<OrderItemRequest> items;

    private String notes;
}
