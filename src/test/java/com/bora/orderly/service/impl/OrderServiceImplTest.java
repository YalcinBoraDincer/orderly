package com.bora.orderly.service.impl;

import com.bora.orderly.dto.request.CreateOrderRequest;
import com.bora.orderly.dto.request.OrderItemRequest;
import com.bora.orderly.dto.response.OrderResponse;
import com.bora.orderly.entity.MenuItem;
import com.bora.orderly.entity.Order;
import com.bora.orderly.entity.OrderItem;
import com.bora.orderly.entity.RestaurantTable;
import com.bora.orderly.enums.ItemStatus;
import com.bora.orderly.enums.OrderStatus;
import com.bora.orderly.enums.TableStatus;
import com.bora.orderly.exception.BusinessException;
import com.bora.orderly.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class OrderServiceImplTest {

    @Mock
    private OrderRepository orderRepository;
    @Mock
    private OrderItemRepository orderItemRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private TableRepository tableRepository;
    @Mock
    private MenuItemRepository menuItemRepository;
    @Mock
    private PaymentRepository paymentRepository;

    @InjectMocks
    private OrderServiceImpl orderService;

    private RestaurantTable testTable;
    private MenuItem testMenuItem;
    private CreateOrderRequest validRequest;

    @BeforeEach
    void setUp() {
        testTable = RestaurantTable.builder()
                .id(1L)
                .tableNumber("5")
                .capacity(4)
                .status(TableStatus.AVAILABLE)
                .build();

        testMenuItem = MenuItem.builder()
                .id(10L)
                .name("Pizza")
                .price(BigDecimal.valueOf(150))
                .available(true)
                .build();

        OrderItemRequest itemRequest = new OrderItemRequest();
        itemRequest.setMenuItemId(10L);
        itemRequest.setQuantity(2);
        itemRequest.setNotes("No onions");

        validRequest = CreateOrderRequest.builder()
                .tableId(1L)
                .notes("Fast delivery")
                .items(List.of(itemRequest))
                .build();
    }

    @Test
    @DisplayName("Masada aktif siparis yoksa siparis basariyla olusturulmali")
    void createOrder_ShouldSuccess_WhenNoActiveOrderExists() {
        when(tableRepository.findById(1L)).thenReturn(Optional.of(testTable));
        when(orderRepository.findByTableIdAndStatusIn(eq(1L), any())).thenReturn(Optional.empty());
        when(menuItemRepository.findById(10L)).thenReturn(Optional.of(testMenuItem));

        Order mockOrder = Order.builder()
                .id(50L)
                .table(testTable)
                .status(OrderStatus.PENDING)
                .totalAmount(BigDecimal.valueOf(300))
                .createdAt(LocalDateTime.now())
                .build();

        when(orderRepository.save(any(Order.class))).thenReturn(mockOrder);

        OrderItem mockItem = OrderItem.builder()
                .id(200L)
                .order(mockOrder)
                .menuItem(testMenuItem)
                .quantity(2)
                .unitPrice(BigDecimal.valueOf(150))
                .itemStatus(ItemStatus.WAITING)
                .build();

        when(orderItemRepository.save(any(OrderItem.class))).thenReturn(mockItem);
        when(orderRepository.findById(50L)).thenReturn(Optional.of(mockOrder));
        when(orderItemRepository.findByOrderId(50L)).thenReturn(List.of(mockItem));
        when(paymentRepository.findByOrderId(50L)).thenReturn(Collections.emptyList());

        OrderResponse response = orderService.createOrder(validRequest);

        assertNotNull(response);
        assertEquals(50L, response.getId());
        assertEquals(TableStatus.OCCUPIED, testTable.getStatus());
        assertEquals(BigDecimal.valueOf(300), response.getTotalAmount());
        
        verify(orderRepository, atLeastOnce()).save(any(Order.class));
        verify(tableRepository, atLeastOnce()).save(testTable);
    }

    @Test
    @DisplayName("Masada aktif siparis varken yeni siparis olusturma engellenmeli")
    void createOrder_ShouldThrowException_WhenActiveOrderAlreadyExists() {
        when(tableRepository.findById(1L)).thenReturn(Optional.of(testTable));

        Order existingOrder = Order.builder()
                .id(99L)
                .status(OrderStatus.IN_PROGRESS)
                .build();

        when(orderRepository.findByTableIdAndStatusIn(eq(1L), any())).thenReturn(Optional.of(existingOrder));

        BusinessException exception = assertThrows(BusinessException.class, () -> {
            orderService.createOrder(validRequest);
        });

        assertEquals("Bu Masada Zaten Aktif Bir Siparis Var", exception.getMessage());
        verify(orderRepository, never()).save(any(Order.class));
    }
}
