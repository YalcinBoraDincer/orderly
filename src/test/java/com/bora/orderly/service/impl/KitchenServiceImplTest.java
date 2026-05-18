package com.bora.orderly.service.impl;

import com.bora.orderly.dto.response.KitchenOrderResponse;
import com.bora.orderly.entity.MenuItem;
import com.bora.orderly.entity.Order;
import com.bora.orderly.entity.OrderItem;
import com.bora.orderly.entity.RestaurantTable;
import com.bora.orderly.enums.ItemStatus;
import com.bora.orderly.enums.OrderStatus;
import com.bora.orderly.exception.BusinessException;
import com.bora.orderly.repository.OrderItemRepository;
import com.bora.orderly.repository.OrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class KitchenServiceImplTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private OrderItemRepository orderItemRepository;

    @InjectMocks
    private KitchenServiceImpl kitchenService;

    private Order testOrder;
    private OrderItem testItem1;
    private OrderItem testItem2;

    @BeforeEach
    void setUp() {
        RestaurantTable table = RestaurantTable.builder()
                .id(1L)
                .tableNumber("12")
                .build();

        MenuItem pizza = MenuItem.builder()
                .id(101L)
                .name("Pizza")
                .price(BigDecimal.valueOf(150))
                .build();

        MenuItem burger = MenuItem.builder()
                .id(102L)
                .name("Burger")
                .price(BigDecimal.valueOf(120))
                .build();

        testOrder = Order.builder()
                .id(1L)
                .table(table)
                .status(OrderStatus.PENDING)
                .orderItems(new ArrayList<>())
                .build();

        testItem1 = OrderItem.builder()
                .id(10L)
                .order(testOrder)
                .menuItem(pizza)
                .quantity(1)
                .unitPrice(pizza.getPrice())
                .itemStatus(ItemStatus.WAITING)
                .build();

        testItem2 = OrderItem.builder()
                .id(11L)
                .order(testOrder)
                .menuItem(burger)
                .quantity(2)
                .unitPrice(burger.getPrice())
                .itemStatus(ItemStatus.WAITING)
                .build();

        testOrder.getOrderItems().add(testItem1);
        testOrder.getOrderItems().add(testItem2);
    }

    @Test
    @DisplayName("Bekleyen siparis mutfakta hazirlanmaya baslandiginda durumu guncellenmeli")
    void startOrder_ShouldSuccess_WhenStatusIsPending() {
        when(orderRepository.findById(1L)).thenReturn(Optional.of(testOrder));
        when(orderRepository.save(any(Order.class))).thenReturn(testOrder);

        KitchenOrderResponse response = kitchenService.startOrder(1L);

        assertNotNull(response);
        assertEquals(OrderStatus.IN_PROGRESS, testOrder.getStatus());
        assertEquals(ItemStatus.PREPARING, testItem1.getItemStatus());
        assertEquals(ItemStatus.PREPARING, testItem2.getItemStatus());

        verify(orderRepository, times(1)).save(testOrder);
    }

    @Test
    @DisplayName("Beklemede olmayan siparis hazirlanmaya baslanmak istendiginde hata firlatmali")
    void startOrder_ShouldThrowException_WhenStatusIsNotPending() {
        testOrder.setStatus(OrderStatus.IN_PROGRESS);
        when(orderRepository.findById(1L)).thenReturn(Optional.of(testOrder));

        BusinessException exception = assertThrows(BusinessException.class, () -> {
            kitchenService.startOrder(1L);
        });

        assertEquals("Sadece PENDING siparişler başlatılabilir!", exception.getMessage());
        verify(orderRepository, never()).save(any(Order.class));
    }

    @Test
    @DisplayName("Tumu Hazir dendiginde tum kalemler ve siparis durumu hazir olmali")
    void markAllReady_ShouldSuccess_AndSetOrderStatusAndAllItemsToReady() {
        testOrder.setStatus(OrderStatus.IN_PROGRESS);
        testItem1.setItemStatus(ItemStatus.PREPARING);
        testItem2.setItemStatus(ItemStatus.PREPARING);

        when(orderRepository.findById(1L)).thenReturn(Optional.of(testOrder));
        when(orderRepository.save(any(Order.class))).thenReturn(testOrder);

        KitchenOrderResponse response = kitchenService.markAllReady(1L);

        assertNotNull(response);
        assertEquals(OrderStatus.READY, testOrder.getStatus());
        assertEquals(ItemStatus.READY, testItem1.getItemStatus());
        assertEquals(ItemStatus.READY, testItem2.getItemStatus());

        verify(orderRepository, times(1)).save(testOrder);
    }
}
