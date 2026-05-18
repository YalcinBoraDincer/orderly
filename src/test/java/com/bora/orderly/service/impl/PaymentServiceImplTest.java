package com.bora.orderly.service.impl;

import com.bora.orderly.dto.request.PaymentRequest;
import com.bora.orderly.dto.response.PaymentResponse;
import com.bora.orderly.entity.Order;
import com.bora.orderly.entity.Payment;
import com.bora.orderly.entity.RestaurantTable;
import com.bora.orderly.entity.User;
import com.bora.orderly.enums.OrderStatus;
import com.bora.orderly.enums.PaymentMethod;
import com.bora.orderly.enums.TableStatus;
import com.bora.orderly.exception.BusinessException;
import com.bora.orderly.repository.OrderRepository;
import com.bora.orderly.repository.PaymentLogRepository;
import com.bora.orderly.repository.PaymentRepository;
import com.bora.orderly.repository.TableRepository;
import com.bora.orderly.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PaymentServiceImplTest {

    @Mock
    private PaymentRepository paymentRepository;
    @Mock
    private PaymentLogRepository paymentLogRepository;
    @Mock
    private OrderRepository orderRepository;
    @Mock
    private TableRepository tableRepository;
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private PaymentServiceImpl paymentService;

    private RestaurantTable testTable;
    private Order testOrder;
    private User testUser;
    private PaymentRequest validRequest;

    @BeforeEach
    void setUp() {
        testTable = RestaurantTable.builder()
                .id(1L)
                .tableNumber("12")
                .status(TableStatus.OCCUPIED)
                .build();

        testOrder = Order.builder()
                .id(100L)
                .table(testTable)
                .status(OrderStatus.DELIVERED)
                .totalAmount(BigDecimal.valueOf(250))
                .build();

        testUser = User.builder()
                .id(9L)
                .username("waiter_bora")
                .fullName("Bora Karaca")
                .build();

        validRequest = PaymentRequest.builder()
                .orderId(100L)
                .amount(BigDecimal.valueOf(250))
                .tipAmount(BigDecimal.valueOf(20))
                .paymentMethod(PaymentMethod.CREDIT_CARD)
                .build();
    }

    @Test
    @DisplayName("Tam odeme alindiginda siparis kapatilmali ve masa serbest birakilmali")
    void takePayment_ShouldSuccessAndCloseOrderAndReleaseTable_WhenAmountSettlesOrder() {
        Authentication authentication = mock(Authentication.class);
        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn("waiter_bora");
        SecurityContextHolder.setContext(securityContext);

        when(orderRepository.findById(100L)).thenReturn(Optional.of(testOrder));
        when(paymentRepository.findByOrderId(100L)).thenReturn(Collections.emptyList());
        when(userRepository.findByUsername("waiter_bora")).thenReturn(Optional.of(testUser));

        Payment mockSavedPayment = Payment.builder()
                .id(1000L)
                .order(testOrder)
                .amount(BigDecimal.valueOf(250))
                .tipAmount(BigDecimal.valueOf(20))
                .paymentMethod(PaymentMethod.CREDIT_CARD)
                .takenBy(testUser)
                .build();

        when(paymentRepository.save(any(Payment.class))).thenReturn(mockSavedPayment);

        PaymentResponse response = paymentService.takePayment(validRequest);

        assertNotNull(response);
        assertEquals(1000L, response.getId());
        assertEquals(OrderStatus.CLOSED, testOrder.getStatus());
        assertEquals(TableStatus.AVAILABLE, testTable.getStatus());

        verify(orderRepository, times(1)).save(testOrder);
        verify(tableRepository, times(1)).save(testTable);
        verify(paymentRepository, times(1)).save(any(Payment.class));
    }

    @Test
    @DisplayName("Odeme miktari kalan borctan fazla oldugunda hata firlatmali")
    void takePayment_ShouldThrowException_WhenPaymentAmountExceedsRemainingBalance() {
        validRequest.setAmount(BigDecimal.valueOf(300));

        when(orderRepository.findById(100L)).thenReturn(Optional.of(testOrder));
        when(paymentRepository.findByOrderId(100L)).thenReturn(Collections.emptyList());

        BusinessException exception = assertThrows(BusinessException.class, () -> {
            paymentService.takePayment(validRequest);
        });

        assertTrue(exception.getMessage().contains("Kalan: 250"));
        verify(paymentRepository, never()).save(any(Payment.class));
    }
}
