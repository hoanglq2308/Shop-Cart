package com.shopcart.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean; 
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import tools.jackson.databind.ObjectMapper;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import com.shopcart.dto.CartItemRequest;
import com.shopcart.dto.CartResponse;
import com.shopcart.service.CartService;


@WebMvcTest(CartController.class)
@DisplayName("Cart API Integration Test")
public class CartControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private CartService cartService;
    
    @Test
    @DisplayName("Post /api/cart/add - Thêm sản phẩm ")
    public void testAddtoCart_Success_ReturnsStatus200() throws Exception {
       // Arrange
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
        // Act & Assert
        mockMvc.perform(post("/api/cart/add")
            .header("Authorization","Bearer mtoken123")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            //kiem tra response strucure
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.message").value("Thêm vào giỏ hàng thành công"))
            .andExpect(jsonPath("$.cartTotal").value(50000L));
    }
    @Test
    @DisplayName("Post /api/cart/add - Thêm sản phẩm thất bại trả về status 400")
    public void testAddToCart_Failed_ReturnsStatus400() throws Exception{

        CartItemRequest request = CartItemRequest.builder()
        .productId("P001")
        .quantity(-5)
        .build();

        CartResponse errorResponse = CartResponse.builder()
        .success(false)
        .message("Số lượng phải lớn hơn 0")
        .cartTotal(0L)
        .build();

        when(cartService.addToCart(any(), any(), anyInt())).thenReturn(errorResponse);
        mockMvc.perform(post("/api/cart/add")
            .header("Authorization","Bearer mtoken123")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isBadRequest());
       
    }
    @Test
    @DisplayName("TC3: OPTIONS /api/cart/add - Kiểm tra CORS và Headers (Phần mở rộng)")
    public void testCorsAndHeaders() throws Exception {
        // Act & Assert: Giả lập Frontend từ cổng 3000 bắn request OPTIONS
        mockMvc.perform(options("/api/cart/add")
                .header("Origin", "http://localhost:3000") // Tôi đến từ localhost:3000
                .header("Access-Control-Request-Method", "POST")) // Tôi muốn dùng method POST
                
                // 1. Kì vọng Server không chửi (Status 200 OK)
                .andExpect(status().isOk())
                
                // 2. Kì vọng Server cấp visa thông hành (CORS Headers)
                .andExpect(header().exists("Access-Control-Allow-Origin"))
                .andExpect(header().exists("Access-Control-Allow-Methods"));
    }

    
}