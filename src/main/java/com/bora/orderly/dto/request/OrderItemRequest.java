package com.bora.orderly.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class OrderItemRequest {

    @NotNull(message = "Ürün seçilmeli")
    private Long menuItemId;

    @NotNull
    @Min(value = 1, message = "Adet en az 1 olmalı")
    private Integer quantity;

    private String notes; // "az tuzlu", "yanında sos"
}
