package com.shopcart.security;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.shopcart.controller.CartController;
import com.shopcart.controller.OrderController;
import com.shopcart.dto.CartResponse;
import com.shopcart.dto.OrderCreateRequest;
import com.shopcart.dto.OrderCreateRequest.Customer;
import com.shopcart.dto.OrderCreateRequest.OrderItemRequest;
import com.shopcart.dto.QuantityUpdateRequest;
import com.shopcart.service.CartService;
import com.shopcart.service.OrderService;

import tools.jackson.databind.ObjectMapper;

@WebMvcTest({CartController.class, OrderController.class})
@DisplayName("Advanced Security Tests for Cart and Checkout APIs")
class CartCheckoutSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private CartService cartService;

    @MockitoBean
    private OrderService orderService;

    @Test
    @DisplayName("SQL injection style product id is rejected by cart add endpoint")
    void sqlInjectionStyleProductIdIsRejected() throws Exception {
        mockMvc.perform(post("/api/cart/add")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(
                    com.shopcart.dto.CartItemRequest.builder()
                        .productId("P001 OR 1=1")
                        .quantity(1)
                        .build())))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("Cart item update is accessible without authorization header")
    void cartItemUpdateWithoutAuthorizationHeaderIsAllowed() throws Exception {
        when(cartService.updateCartItemQuantity(42L, 3)).thenReturn(
            CartResponse.builder()
                .success(true)
                .message("Cập nhật số lượng thành công")
                .build());

        mockMvc.perform(put("/api/cart/42/quantity")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(QuantityUpdateRequest.builder().quantity(3).build())))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("Cart item deletion is accessible without authorization header")
    void cartItemDeletionWithoutAuthorizationHeaderIsAllowed() throws Exception {
        doNothing().when(cartService).removeFromCart(99L);

        mockMvc.perform(delete("/api/cart/99"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("Checkout request succeeds without CSRF token")
    void checkoutWithoutCsrfTokenIsAllowed() throws Exception {
        when(orderService.processOrder(any(), any())).thenReturn("ORD-SEC-001");

        OrderCreateRequest request = OrderCreateRequest.builder()
            .customer(Customer.builder()
                .fullName("<script>alert('xss')</script>")
                .phone("0901234567")
                .address("12 Nguyễn Huệ")
                .city("hcm")
                .district("q1")
                .cityLabel("Hồ Chí Minh")
                .districtLabel("Quận 1")
                .build())
            .items(List.of(OrderItemRequest.builder().productId(1L).quantity(1).build()))
            .total(BigDecimal.valueOf(1500000L))
            .build();

        mockMvc.perform(post("/orders")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.orderId").value("ORD-SEC-001"));
    }
}