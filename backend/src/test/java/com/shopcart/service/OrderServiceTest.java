package com.shopcart.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.shopcart.dto.request.OrderItemRequest;
import com.shopcart.dto.request.OrderRequest;
import com.shopcart.dto.response.OrderResponse;
import com.shopcart.dto.response.OrderTotalResponse;
import com.shopcart.entity.Coupon;
import com.shopcart.entity.Order;
import com.shopcart.entity.OrderItem;
import com.shopcart.entity.Product;
import com.shopcart.entity.User;
import com.shopcart.enums.CouponType;
import com.shopcart.enums.OrderStatus;
import com.shopcart.enums.ProductStatus;
import com.shopcart.exception.BusinessException;
import com.shopcart.exception.ResourceNotFoundException;
import com.shopcart.repository.CouponRepository;
import com.shopcart.repository.InventoryRepository;
import com.shopcart.repository.OrderRepository;
import com.shopcart.repository.UserRepository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {
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
    void createOrder_whenStockAvailable_shouldCreatePendingOrderAndDecreaseStock() {
        // Arrange
        User user = user(1L);
        Product monitor = product(10L, "Monitor", "100.00", 5, ProductStatus.ACTIVE);
        Product keyboard = product(11L, "Keyboard", "50.00", 2, ProductStatus.ACTIVE);
        OrderRequest request = orderRequest(1L, "10.00", null,
                List.of(new OrderItemRequest(10L, 2), new OrderItemRequest(11L, 1)));

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(inventoryRepository.findByIdForUpdate(10L)).thenReturn(Optional.of(monitor));
        when(inventoryRepository.findByIdForUpdate(11L)).thenReturn(Optional.of(keyboard));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> {
            Order saved = invocation.getArgument(0);
            saved.setId(99L);
            return saved;
        });

        // Act
        OrderResponse response = orderService.createOrder(request);

        // Assert
        assertThat(response.id()).isEqualTo(99L);
        assertThat(response.status()).isEqualTo("PENDING");
        assertThat(response.subtotal()).isEqualByComparingTo("250.00");
        assertThat(response.totalPrice()).isEqualByComparingTo("260.00");
        assertThat(response.items()).hasSize(2);
        assertThat(monitor.getStockQuantity()).isEqualTo(3);
        assertThat(keyboard.getStockQuantity()).isEqualTo(1);
    }

    @Test
    void createOrder_whenStockInsufficient_shouldThrowBusinessException() {
        // Arrange
        User user = user(1L);
        Product monitor = product(10L, "Monitor", "100.00", 1, ProductStatus.ACTIVE);
        OrderRequest request = orderRequest(1L, "0.00", null, List.of(new OrderItemRequest(10L, 2)));

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(inventoryRepository.findByIdForUpdate(10L)).thenReturn(Optional.of(monitor));

        // Act & Assert
        assertThatThrownBy(() -> orderService.createOrder(request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("out of stock");
        assertThat(monitor.getStockQuantity()).isEqualTo(1);
        verify(orderRepository, never()).save(any(Order.class));
    }

    @Test
    void getOrderById_whenOrderExists_shouldReturnOrder() {
        // Arrange
        Order order = order(44L, OrderStatus.PENDING, product(10L, "Monitor", "100.00", 5, ProductStatus.ACTIVE), 1);
        when(orderRepository.findById(44L)).thenReturn(Optional.of(order));

        // Act
        OrderResponse response = orderService.getOrderById(44L);

        // Assert
        assertThat(response.id()).isEqualTo(44L);
        assertThat(response.status()).isEqualTo("PENDING");
    }

    @Test
    void getOrderById_whenOrderMissing_shouldThrowResourceNotFoundException() {
        // Arrange
        when(orderRepository.findById(404L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> orderService.getOrderById(404L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Order not found");
    }

    @Test
    void cancelOrder_whenPending_shouldCancelAndRestoreStock() {
        // Arrange
        Product monitor = product(10L, "Monitor", "100.00", 3, ProductStatus.ACTIVE);
        Order order = order(44L, OrderStatus.PENDING, monitor, 2);
        when(orderRepository.findById(44L)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        OrderResponse response = orderService.cancelOrder(44L);

        // Assert
        assertThat(response.status()).isEqualTo("CANCELLED");
        assertThat(monitor.getStockQuantity()).isEqualTo(5);
        verify(orderRepository).save(order);
    }

    @Test
    void calculateOrderTotal_withoutCoupon_shouldReturnSubtotalPlusShipping() {
        // Arrange
        Product monitor = product(10L, "Monitor", "100.00", 5, ProductStatus.ACTIVE);
        when(inventoryRepository.findByIdIn(anyCollection())).thenReturn(List.of(monitor));

        // Act
        OrderTotalResponse response = orderService.calculateOrderTotal(
                List.of(new OrderItemRequest(10L, 2)), new BigDecimal("10.00"), null);

        // Assert
        assertThat(response.subtotal()).isEqualByComparingTo("200.00");
        assertThat(response.discountAmount()).isEqualByComparingTo("0.00");
        assertThat(response.totalPrice()).isEqualByComparingTo("210.00");
        assertThat(response.couponApplied()).isFalse();
    }

    @Test
    void calculateOrderTotal_withPercentageCoupon_shouldApplyPercentDiscount() {
        // Arrange
        Product monitor = product(10L, "Monitor", "100.00", 5, ProductStatus.ACTIVE);
        Coupon coupon = coupon("SALE10", CouponType.PERCENTAGE, "10.00",
                "0.00", 10, 0, LocalDateTime.now().plusDays(1), true);
        when(inventoryRepository.findByIdIn(anyCollection())).thenReturn(List.of(monitor));
        when(couponRepository.findByCodeIgnoreCase("SALE10")).thenReturn(Optional.of(coupon));

        // Act
        OrderTotalResponse response = orderService.calculateOrderTotal(
                List.of(new OrderItemRequest(10L, 2)), new BigDecimal("10.00"), "SALE10");

        // Assert
        assertThat(response.discountAmount()).isEqualByComparingTo("20.00");
        assertThat(response.totalPrice()).isEqualByComparingTo("190.00");
        assertThat(response.couponApplied()).isTrue();
    }

    @Test
    void calculateOrderTotal_withFixedCoupon_shouldApplyFixedDiscount() {
        // Arrange
        Product monitor = product(10L, "Monitor", "100.00", 5, ProductStatus.ACTIVE);
        Coupon coupon = coupon("TRU50", CouponType.FIXED_AMOUNT, "50.00",
                "0.00", 10, 0, LocalDateTime.now().plusDays(1), true);
        when(inventoryRepository.findByIdIn(anyCollection())).thenReturn(List.of(monitor));
        when(couponRepository.findByCodeIgnoreCase("TRU50")).thenReturn(Optional.of(coupon));

        // Act
        OrderTotalResponse response = orderService.calculateOrderTotal(
                List.of(new OrderItemRequest(10L, 2)), new BigDecimal("10.00"), "TRU50");

        // Assert
        assertThat(response.discountAmount()).isEqualByComparingTo("50.00");
        assertThat(response.totalPrice()).isEqualByComparingTo("160.00");
        assertThat(response.couponApplied()).isTrue();
    }

    @Test
    void calculateOrderTotal_withExpiredCoupon_shouldIgnoreCoupon() {
        // Arrange
        Product monitor = product(10L, "Monitor", "100.00", 5, ProductStatus.ACTIVE);
        Coupon coupon = coupon("OLD", CouponType.PERCENTAGE, "50.00",
                "0.00", 10, 0, LocalDateTime.now().minusDays(1), true);
        when(inventoryRepository.findByIdIn(anyCollection())).thenReturn(List.of(monitor));
        when(couponRepository.findByCodeIgnoreCase("OLD")).thenReturn(Optional.of(coupon));

        // Act
        OrderTotalResponse response = orderService.calculateOrderTotal(
                List.of(new OrderItemRequest(10L, 2)), BigDecimal.ZERO, "OLD");

        // Assert
        assertThat(response.discountAmount()).isEqualByComparingTo("0.00");
        assertThat(response.totalPrice()).isEqualByComparingTo("200.00");
        assertThat(response.couponApplied()).isFalse();
    }

    @Test
    void checkStockBeforeOrder_whenAllItemsAvailable_shouldReturnTrue() {
        // Arrange
        Product monitor = product(10L, "Monitor", "100.00", 2, ProductStatus.ACTIVE);
        when(inventoryRepository.findByIdIn(anyCollection())).thenReturn(List.of(monitor));

        // Act
        boolean result = orderService.checkStockBeforeOrder(List.of(new OrderItemRequest(10L, 2)));

        // Assert
        assertThat(result).isTrue();
    }

    @Test
    void checkStockBeforeOrder_whenItemMissingOrInactiveOrInsufficient_shouldReturnFalse() {
        // Arrange
        Product monitor = product(10L, "Monitor", "100.00", 1, ProductStatus.ACTIVE);
        when(inventoryRepository.findByIdIn(anyCollection())).thenReturn(List.of(monitor));

        // Act
        boolean result = orderService.checkStockBeforeOrder(List.of(new OrderItemRequest(10L, 2)));

        // Assert
        assertThat(result).isFalse();
    }

    private OrderRequest orderRequest(Long userId, String shippingFee, String couponCode, List<OrderItemRequest> items) {
        return new OrderRequest(
                userId,
                items,
                new BigDecimal(shippingFee),
                "123 Nguyen Trai, Quan 1",
                "COD",
                couponCode,
                null,
                null
        );
    }

    private User user(Long id) {
        User user = new User("Khang", "khang@example.com", "0900000000", "123456");
        user.setId(id);
        return user;
    }

    private Product product(Long id, String name, String price, int stock, ProductStatus status) {
        Product product = new Product(name, new BigDecimal(price), stock, status);
        product.setId(id);
        return product;
    }

    private Coupon coupon(String code, CouponType type, String value, String minOrderValue,
                          int usageLimit, int usedCount, LocalDateTime expiryDate, boolean active) {
        return new Coupon(
                code,
                type,
                new BigDecimal(value),
                new BigDecimal(minOrderValue),
                usageLimit,
                usedCount,
                expiryDate,
                active
        );
    }

    private Order order(Long id, OrderStatus status, Product product, int quantity) {
        User user = user(1L);
        Order order = new Order();
        order.setId(id);
        order.setUser(user);
        order.setSubtotal(product.getPrice().multiply(BigDecimal.valueOf(quantity)));
        order.setShippingFee(BigDecimal.ZERO.setScale(2));
        order.setDiscountAmount(BigDecimal.ZERO.setScale(2));
        order.setTotalPrice(order.getSubtotal());
        order.setShippingAddress("123 Nguyen Trai");
        order.setPaymentMethod("COD");
        order.setStatus(status);
        order.addOrderItem(new OrderItem(product, quantity, product.getPrice()));
        return order;
    }
}
