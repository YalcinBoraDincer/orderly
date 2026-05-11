package com.bora.orderly.service;

import com.bora.orderly.dto.request.PaymentRequest;
import com.bora.orderly.dto.response.PaymentResponse;

import java.util.List;

public interface IPaymentService {
    PaymentResponse takePayment(PaymentRequest request);
    void deletePayment(Long paymentId);
    List<PaymentResponse> getPaymentsByOrder(Long orderId);
}
