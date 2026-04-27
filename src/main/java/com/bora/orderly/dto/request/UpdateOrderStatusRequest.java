package com.bora.orderly.dto.request;

import com.bora.orderly.enums.OrderStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateOrderStatusRequest {

    @NotNull(message = "Durum boş olamaz")
    private OrderStatus status;
}
