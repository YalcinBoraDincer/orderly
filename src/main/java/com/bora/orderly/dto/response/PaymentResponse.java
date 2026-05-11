package com.bora.orderly.dto.response;

import com.bora.orderly.enums.PaymentMethod;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class PaymentResponse {
    private Long id;
    private Long orderId;
    private String takenBy;
    private BigDecimal amount;
    private BigDecimal tipAmount;
    private PaymentMethod paymentMethod;
    private LocalDateTime createdAt;
}
