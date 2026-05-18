package com.bora.orderly.dto.request;

import com.bora.orderly.enums.PaymentMethod;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentRequest {

    @NotNull(message = "Sipariş ID boş olamaz")
    private Long orderId;

    @NotNull(message = "Ödeme miktarı boş olamaz")
    @Positive(message = "Ödeme miktarı pozitif olmalıdır")
    private BigDecimal amount;

    private BigDecimal tipAmount; // Opsiyonel

    @NotNull(message = "Ödeme yöntemi boş olamaz")
    private PaymentMethod paymentMethod;
}
