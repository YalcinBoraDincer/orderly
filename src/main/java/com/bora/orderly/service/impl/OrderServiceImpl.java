package com.bora.orderly.service.impl;

import com.bora.orderly.dto.request.CreateOrderRequest;
import com.bora.orderly.dto.request.OrderItemRequest;
import com.bora.orderly.dto.request.UpdateOrderStatusRequest;
import com.bora.orderly.dto.response.OrderItemResponse;
import com.bora.orderly.dto.response.OrderResponse;
import com.bora.orderly.entity.*;
import com.bora.orderly.enums.ItemStatus;
import com.bora.orderly.enums.OrderStatus;
import com.bora.orderly.enums.TableStatus;
import com.bora.orderly.exception.BusinessException;
import com.bora.orderly.exception.ResourceNotFoundException;
import com.bora.orderly.repository.*;
import com.bora.orderly.service.IOrderService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
@Service
@AllArgsConstructor
public class OrderServiceImpl implements IOrderService {
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final UserRepository userRepository;
    private final TableRepository tableRepository;
    private final MenuItemRepository menuItemRepository;
    private final PaymentRepository paymentRepository;



    @Override
    public OrderResponse createOrder(CreateOrderRequest request) {



        //1-Table Check

        RestaurantTable restaurantTable = tableRepository.findById(request.getTableId()).orElseThrow(()-> new ResourceNotFoundException("Masa",request.getTableId()));
        if (restaurantTable.getStatus()== TableStatus.OCCUPIED){
            throw new BusinessException("Bu Masada Zaten Aktif Bir Siparis Var");
        }
        //2-Waiter
        User waiter=null;
        if (request.getWaiterId()!=null){
            waiter=userRepository.findById(request.getWaiterId()).orElseThrow(()-> new ResourceNotFoundException("Garson",request.getWaiterId()));

        }
        //3-Save The Order
        Order order = Order
                .builder()
                .table(restaurantTable)
                .waiter(waiter)
                .status(OrderStatus.PENDING)
                .notes(request.getNotes())
                .totalAmount(BigDecimal.ZERO)
                .build();
        order=orderRepository.save(order);
        //4-Kalemleri Ekle Toplam Hesapla
        BigDecimal totalAmount = BigDecimal.ZERO;
        for (OrderItemRequest itemRequest : request.getItems()) {
            MenuItem menuItem=menuItemRepository.findById(itemRequest.getMenuItemId()).orElseThrow(()-> new ResourceNotFoundException("Menu Ogesi",itemRequest.getMenuItemId()));

            if (!menuItem.getAvailable()){
                throw new BusinessException(menuItem.getName()+"Su anda mevcut degil");

            }
            OrderItem orderItem=OrderItem.builder()
                    .order(order)
                    .menuItem(menuItem)
                    .quantity(itemRequest.getQuantity())
                    .unitPrice(menuItem.getPrice())//Anlik fiyat
                    .itemStatus(ItemStatus.WAITING)
                    .notes(itemRequest.getNotes())
                    .build();
            orderItem=orderItemRepository.save(orderItem);
            totalAmount=totalAmount.add(menuItem.getPrice().multiply(new BigDecimal(itemRequest.getQuantity())));
        }

        //5-Update the total
        order.setTotalAmount(totalAmount);
        orderRepository.save(order);

        //6-Change the table status occupied
        restaurantTable.setStatus(TableStatus.OCCUPIED);
        tableRepository.save(restaurantTable);
        return getOrderById(order.getId());


    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long id) {
        Order order = orderRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Siparis", id));
        return toResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getActiveOrderByTable(Long tableId) {
        List<OrderStatus> activeStatus=List.of(OrderStatus.PENDING,OrderStatus.IN_PROGRESS,
                                               OrderStatus.READY,OrderStatus.DELIVERED);

        Order order=orderRepository.findByTableIdAndStatusIn(tableId,activeStatus).orElseThrow(()-> new BusinessException("Bu masada aktif siparis yok "));
        return toResponse(order);

    }

    @Override
    public OrderResponse updateOrderStatus(Long id, UpdateOrderStatusRequest request) {
        Order order=orderRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Siparis", id));
        order.setStatus(request.getStatus());

        //Sipairs kapaninca masayi serbest birak
        if (request.getStatus()==OrderStatus.CLOSED || request.getStatus()==OrderStatus.CANCELLED){
            order.getTable().setStatus(TableStatus.AVAILABLE);
            tableRepository.save(order.getTable());
        }
        return toResponse(orderRepository.save(order));
    }

    @Override
    public OrderResponse addItemsToOrder(Long orderId, List<OrderItemRequest> items) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new ResourceNotFoundException("Siparis", orderId));
        if (order.getStatus()==OrderStatus.CLOSED || order.getStatus()==OrderStatus.CANCELLED){
            throw new BusinessException("Bu masa kapali siparis eklenemez");
        }
        BigDecimal extra = BigDecimal.ZERO;
        for (OrderItemRequest itemRequest : items) {
            MenuItem menuItem=menuItemRepository.findById(itemRequest.getMenuItemId()).orElseThrow(() -> new ResourceNotFoundException("Menu Ogesi",itemRequest.getMenuItemId()));
            if (!menuItem.getAvailable()){
                throw new BusinessException(menuItem.getName()+"Su anda mevcut degil");

            }
            OrderItem orderItem=OrderItem.builder()
                    .order(order)
                    .menuItem(menuItem)
                    .quantity(itemRequest.getQuantity())
                    .unitPrice(menuItem.getPrice())//Anlik fiyat
                    .itemStatus(ItemStatus.WAITING)
                    .notes(itemRequest.getNotes())
                    .build();
            orderItem=orderItemRepository.save(orderItem);
            extra = extra.add(menuItem.getPrice().multiply(BigDecimal.valueOf(itemRequest.getQuantity())));

        }
        order.setTotalAmount(order.getTotalAmount().add(extra));
        orderRepository.save(order);
        return getOrderById(order.getId());
    }

    //MapperMethods
    private OrderResponse toResponse(Order order) {
        List<OrderItemResponse> items = orderItemRepository.findByOrderId(order.getId()).stream().map(this::toItemResponse).toList();
        
        List<Payment> payments = paymentRepository.findByOrderId(order.getId());
        BigDecimal paidAmount = payments.stream()
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal tipAmount = payments.stream()
                .map(p -> p.getTipAmount() != null ? p.getTipAmount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal remainingAmount = order.getTotalAmount().subtract(paidAmount);
        if (remainingAmount.compareTo(BigDecimal.ZERO) < 0) {
            remainingAmount = BigDecimal.ZERO;
        }

        return OrderResponse
                .builder()
                .id(order.getId())
                .tableId(order.getTable().getId())
                .tableNumber(order.getTable().getTableNumber())
                .waiterName(order.getWaiter()!=null? order.getWaiter().getFullName():null)
                .status(order.getStatus())
                .totalAmount(order.getTotalAmount())
                .paidAmount(paidAmount)
                .remainingAmount(remainingAmount)
                .tipAmount(tipAmount)
                .notes(order.getNotes())
                .items(items)
                .createdAt(order.getCreatedAt())
                .build();
    }

    private OrderItemResponse toItemResponse(OrderItem orderItem) {
        return OrderItemResponse
                .builder()
                .id(orderItem.getId())
                .menuItemId(orderItem.getMenuItem().getId())
                .menuItemName(orderItem.getMenuItem().getName())
                .quantity(orderItem.getQuantity())
                .unitPrice(orderItem.getUnitPrice())
                .subTotal(orderItem.getUnitPrice().multiply(BigDecimal.valueOf(orderItem.getQuantity())))
                .itemStatus(orderItem.getItemStatus())
                .notes(orderItem.getNotes())
                .build();
    }
}
