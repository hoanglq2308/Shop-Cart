package com.shopcart.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.shopcart.dto.request.OrderItemRequest;
import com.shopcart.dto.request.OrderRequest;
import com.shopcart.dto.response.OrderResponse;
import com.shopcart.entity.Order;
import com.shopcart.entity.Product;
import com.shopcart.entity.User;
import com.shopcart.enums.OrderStatus;
import com.shopcart.enums.ProductStatus;
import com.shopcart.repository.CouponRepository;
import com.shopcart.repository.InventoryRepository;
import com.shopcart.repository.OrderRepository;
import com.shopcart.repository.UserRepository;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class OrderServiceMockTest {
    @Mock
    private OrderRepository orderRepository;

    @Mock
    private InventoryRepository inventoryRepository;

    @Mock
    private CouponRepository couponRepository;

    @Mock
    private UserRepository userRepository;

    private OrderService orderService;

    @BeforeEach
    void setUp() {
        orderService = new OrderService(orderRepository, inventoryRepository, couponRepository, userRepository);
    }

    @Test
    void createOrder_shouldCaptureSavedOrderAndVerifyRepositoryInteractions() {
        // Arrange
        User user = new User("Khang", "khang@example.com", "0900000000", "123456");
        user.setId(1L);
        Product product = new Product("Monitor", new BigDecimal("100.00"), 10, ProductStatus.ACTIVE);
        product.setId(10L);
        OrderRequest request = new OrderRequest(
                1L,
                List.of(new OrderItemRequest(10L, 3)),
                new BigDecimal("15.00"),
                "123 Nguyen Trai, Quan 1",
                "COD",
                null,
                null,
                null
        );

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(inventoryRepository.findByIdForUpdate(10L)).thenReturn(Optional.of(product));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> {
            Order order = invocation.getArgument(0);
            order.setId(88L);
            return order;
        });

        // Act
        OrderResponse response = orderService.createOrder(request);

        // Assert
        ArgumentCaptor<Order> orderCaptor = ArgumentCaptor.forClass(Order.class);
        verify(orderRepository, times(1)).save(orderCaptor.capture());
        verify(inventoryRepository, times(1)).findByIdForUpdate(10L);
        verify(userRepository, times(1)).findById(1L);

        Order capturedOrder = orderCaptor.getValue();
        assertThat(response.id()).isEqualTo(88L);
        assertThat(capturedOrder.getStatus()).isEqualTo(OrderStatus.PENDING);
        assertThat(capturedOrder.getSubtotal()).isEqualByComparingTo("300.00");
        assertThat(capturedOrder.getShippingFee()).isEqualByComparingTo("15.00");
        assertThat(capturedOrder.getTotalPrice()).isEqualByComparingTo("315.00");
        assertThat(capturedOrder.getShippingAddress()).isEqualTo("123 Nguyen Trai, Quan 1");
        assertThat(capturedOrder.getOrderItems()).hasSize(1);
        assertThat(capturedOrder.getOrderItems().getFirst().getQuantity()).isEqualTo(3);
        assertThat(capturedOrder.getOrderItems().getFirst().getUnitPrice()).isEqualByComparingTo("100.00");
        assertThat(product.getStockQuantity()).isEqualTo(7);
    }
}
