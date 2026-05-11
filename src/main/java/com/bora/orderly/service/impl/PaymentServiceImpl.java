package com.bora.orderly.service.impl;

import com.bora.orderly.dto.request.PaymentRequest;
import com.bora.orderly.dto.response.PaymentResponse;
import com.bora.orderly.entity.Order;
import com.bora.orderly.entity.Payment;
import com.bora.orderly.entity.PaymentLog;
import com.bora.orderly.entity.User;
import com.bora.orderly.enums.OrderStatus;
import com.bora.orderly.enums.TableStatus;
import com.bora.orderly.exception.BusinessException;
import com.bora.orderly.exception.ResourceNotFoundException;
import com.bora.orderly.repository.OrderRepository;
import com.bora.orderly.repository.PaymentLogRepository;
import com.bora.orderly.repository.PaymentRepository;
import com.bora.orderly.repository.TableRepository;
import com.bora.orderly.repository.UserRepository;
import com.bora.orderly.service.IPaymentService;
import lombok.AllArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@AllArgsConstructor
public class PaymentServiceImpl implements IPaymentService {

    private final PaymentRepository paymentRepository;
    private final PaymentLogRepository paymentLogRepository;
    private final OrderRepository orderRepository;
    private final TableRepository tableRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public PaymentResponse takePayment(PaymentRequest request) {
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Sipariş", request.getOrderId()));

        if (order.getStatus() == OrderStatus.CLOSED || order.getStatus() == OrderStatus.CANCELLED) {
            throw new BusinessException("Bu sipariş kapalı, ödeme alınamaz!");
        }

        // Kalan tutar hesaplama
        List<Payment> currentPayments = paymentRepository.findByOrderId(order.getId());
        BigDecimal totalPaid = currentPayments.stream()
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal remaining = order.getTotalAmount().subtract(totalPaid);

        if (request.getAmount().compareTo(remaining) > 0) {
            throw new BusinessException("Girilen tutar kalan tutardan fazladır! Kalan: " + remaining);
        }

        // Ödemeyi alanı bul
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new BusinessException("Aktif kullanıcı bulunamadı"));

        Payment payment = Payment.builder()
                .order(order)
                .amount(request.getAmount())
                .tipAmount(request.getTipAmount() != null ? request.getTipAmount() : BigDecimal.ZERO)
                .paymentMethod(request.getPaymentMethod())
                .takenBy(currentUser)
                .build();

        payment = paymentRepository.save(payment);

        // Eğer kalan tutar sıfırlandıysa siparişi kapat ve masayı serbest bırak
        if (remaining.subtract(request.getAmount()).compareTo(BigDecimal.ZERO) <= 0) {
            order.setStatus(OrderStatus.CLOSED);
            orderRepository.save(order);

            order.getTable().setStatus(TableStatus.AVAILABLE);
            tableRepository.save(order.getTable());
        }

        return toResponse(payment);
    }

    @Override
    @Transactional
    public void deletePayment(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Ödeme", paymentId));

        Order order = payment.getOrder();

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new BusinessException("Aktif kullanıcı bulunamadı"));

        // Log oluştur
        PaymentLog log = PaymentLog.builder()
                .orderId(order.getId())
                .deletedAmount(payment.getAmount())
                .deletedTipAmount(payment.getTipAmount())
                .deletedBy(currentUser)
                .reason("Kullanıcı tarafından silindi")
                .build();
        paymentLogRepository.save(log);

        paymentRepository.delete(payment);

        // Sipariş önceden CLOSED ise yeniden aç (çünkü ödeme silindi ve açık miktar oluştu)
        if (order.getStatus() == OrderStatus.CLOSED) {
            order.setStatus(OrderStatus.IN_PROGRESS); // veya PENDING (isteğe bağlı)
            orderRepository.save(order);
            
            order.getTable().setStatus(TableStatus.OCCUPIED);
            tableRepository.save(order.getTable());
        }
    }

    @Override
    public List<PaymentResponse> getPaymentsByOrder(Long orderId) {
        return paymentRepository.findByOrderId(orderId).stream()
                .map(this::toResponse).toList();
    }

    private PaymentResponse toResponse(Payment payment) {
        return PaymentResponse.builder()
                .id(payment.getId())
                .orderId(payment.getOrder().getId())
                .takenBy(payment.getTakenBy() != null ? payment.getTakenBy().getFullName() : null)
                .amount(payment.getAmount())
                .tipAmount(payment.getTipAmount())
                .paymentMethod(payment.getPaymentMethod())
                .createdAt(payment.getCreatedAt())
                .build();
    }
}
