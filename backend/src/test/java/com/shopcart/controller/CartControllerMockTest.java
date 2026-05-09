package com.shopcart.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.DisplayName;
import org.springframework.http.MediaType;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import com.shopcart.dto.CartItemRequest;
import com.shopcart.dto.CartResponse;
import com.shopcart.service.CartService;
import tools.jackson.databind.ObjectMapper;

@WebMvcTest(CartController.class)
@DisplayName("CartController Mock Test")
public class CartControllerMockTest {
    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;
    @MockitoBean
    private CartService cartService;
    @Test
    @DisplayName("Add to cart with mocked service - Verify Interaction")
    public void testAddToCardWithMockedService() throws Exception{
        // chuan bi du lieu dau vao
        CartItemRequest request = CartItemRequest.builder()
        .productId("P001")
        .quantity(2)
        .build();

        CartResponse response = CartResponse.builder()
        .success(true)
        .message("Thêm vào giỏ hàng thành công")
        .cartTotal(50000L)
        .build();
        when(cartService.addToCart(any(), any(), anyInt())).thenReturn(response);
        mockMvc.perform(post("/api/cart/add")
            .header("Authorization","Bearer mtoken123")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.message").value("Thêm vào giỏ hàng thành công"))
            .andExpect(jsonPath("$.cartTotal").value(50000L));
            verify(cartService, times(1)).addToCart(any(), any(), anyInt());
    }
    

    
}
