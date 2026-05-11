package com.shopcart.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import com.shopcart.dto.OrderCreateRequest;
import com.shopcart.dto.OrderCreateRequest.OrderItemRequest;
import com.shopcart.entity.Cart;
import com.shopcart.entity.CartItem;
import com.shopcart.entity.Product;
import com.shopcart.repository.CartItemRepository;
import com.shopcart.repository.CartRepository;
import com.shopcart.repository.ProductRepository;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
@DisplayName("OrderService Unit Tests")
public class OrderServiceTest {

    @Mock
    private ProductRepository productRepository;
    @Mock
    private CartRepository cartRepository;
    @Mock
    private CartItemRepository cartItemRepository;

    @InjectMocks
    private OrderService orderService;

    @Test
    @DisplayName("TC1: processOrder - success: decrement stock and remove cart items")
    public void testProcessOrder_Success() {
        Long userId = 1L;
        Long productId = 10L;
        int qty = 2;

        Product p = new Product();
        p.setId(productId);
        p.setName("Widget");
        p.setStockQuantity(5);
        p.setPrice(new java.math.BigDecimal("10000.00"));

        when(productRepository.findById(productId)).thenReturn(Optional.of(p));

        Cart cart = new Cart();
        cart.setId(100L);
        CartItem ci = new CartItem();
        Product p2 = new Product();
        p2.setId(productId);
        ci.setProduct(p2);
        ci.setId(200L);

        when(cartRepository.findByUserId(userId)).thenReturn(Optional.of(cart));
        when(cartItemRepository.findByCartId(cart.getId())).thenReturn(List.of(ci));

        OrderCreateRequest req = new OrderCreateRequest();
        req.setItems(List.of(new OrderItemRequest(productId, qty)));

        String orderId = orderService.processOrder(userId, req);

        assertNotNull(orderId);
        assertTrue(orderId.startsWith("#LUXE-"));

        // product stock decremented and saved
        assertEquals(3, p.getStockQuantity());
        verify(productRepository, times(1)).save(p);
        // cart item removed
        verify(cartItemRepository, times(1)).delete(ci);
    }

    @Test
    @DisplayName("TC2: processOrder - product not found")
    public void testProcessOrder_ProductNotFound() {
        Long userId = 1L;
        Long productId = 99L;
        when(productRepository.findById(productId)).thenReturn(Optional.empty());

        OrderCreateRequest req = new OrderCreateRequest();
        req.setItems(List.of(new OrderItemRequest(productId, 1)));

        RuntimeException ex = assertThrows(RuntimeException.class, () -> {
            orderService.processOrder(userId, req);
        });

        assertTrue(ex.getMessage().contains("Sản phẩm không tồn tại"));
    }

    @Test
    @DisplayName("TC3: processOrder - insufficient stock")
    public void testProcessOrder_InsufficientStock() {
        Long userId = 1L;
        Long productId = 5L;
        Product p = new Product();
        p.setId(productId);
        p.setName("Gadget");
        p.setStockQuantity(1);
        p.setPrice(new java.math.BigDecimal("50000.00"));

        when(productRepository.findById(productId)).thenReturn(Optional.of(p));

        OrderCreateRequest req = new OrderCreateRequest();
        req.setItems(List.of(new OrderItemRequest(productId, 3)));

        RuntimeException ex = assertThrows(RuntimeException.class, () -> {
            orderService.processOrder(userId, req);
        });

        assertTrue(ex.getMessage().contains("không đủ tồn kho"));
    }

    @Test
    @DisplayName("TC4: processOrder - invalid request")
    public void testProcessOrder_InvalidRequest() {
        Long userId = 1L;
        RuntimeException ex1 = assertThrows(RuntimeException.class, () -> {
            orderService.processOrder(userId, null);
        });
        assertTrue(ex1.getMessage().contains("Dữ liệu đặt hàng không hợp lệ"));

        OrderCreateRequest empty = new OrderCreateRequest();
        empty.setItems(List.of());
        RuntimeException ex2 = assertThrows(RuntimeException.class, () -> {
            orderService.processOrder(userId, empty);
        });
        assertTrue(ex2.getMessage().contains("Dữ liệu đặt hàng không hợp lệ"));
    }
}
