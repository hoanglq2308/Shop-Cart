package com.shopcart.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.util.List;

import com.shopcart.dto.OrderCreateRequest;
import com.shopcart.dto.OrderCreateRequest.Customer;
import com.shopcart.dto.OrderCreateRequest.OrderItemRequest;
import com.shopcart.dto.OrderPricingResponse;
import com.shopcart.service.OrderService;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.ObjectMapper;

@WebMvcTest(OrderController.class)
@DisplayName("Order API Integration Tests")
public class OrderControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private OrderService orderService;

    @Test
    @DisplayName("POST /orders - Tạo đơn hàng thành công")
    public void testCreateOrderSuccess() throws Exception {
        OrderCreateRequest request = OrderCreateRequest.builder()
            .customer(Customer.builder()
                .fullName("Nguyễn Văn A")
                .phone("0901234567")
                .address("12 Nguyễn Huệ")
                .city("hcm")
                .district("q1")
                .cityLabel("Hồ Chí Minh")
                .districtLabel("Quận 1")
                .build())
            .items(List.of(
                OrderItemRequest.builder().productId(1L).quantity(2).build()
            ))
            .total(BigDecimal.valueOf(30050000L))
            .build();

        OrderPricingResponse pricing = OrderPricingResponse.builder()
            .subtotal(BigDecimal.valueOf(15000000L))
            .shippingFee(BigDecimal.valueOf(15000L))
            .discountAmount(BigDecimal.ZERO)
            .total(BigDecimal.valueOf(15015000L))
            .couponCode(null)
            .build();
        
        when(orderService.calculatePricing(any())).thenReturn(pricing);
        when(orderService.processOrder(any(), any())).thenReturn("ORD-001");

        mockMvc.perform(post("/orders")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.message").value("Đặt hàng thành công"))
            .andExpect(jsonPath("$.orderId").value("ORD-001"))
            .andExpect(jsonPath("$.payment").value("COD"))
            .andExpect(jsonPath("$.total").value(15015000));
    }

    @Test
    @DisplayName("POST /orders - Dữ liệu không hợp lệ trả về 400")
    public void testCreateOrderInvalidRequest() throws Exception {
        OrderCreateRequest request = OrderCreateRequest.builder()
            .customer(null)
            .items(List.of())
            .total(BigDecimal.ZERO)
            .build();

        mockMvc.perform(post("/orders")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.success").value(false))
            .andExpect(jsonPath("$.message").value("Dữ liệu đặt hàng không hợp lệ"));
    }

    @Test
    @DisplayName("OPTIONS /orders - Kiểm tra CORS và headers")
    public void testCorsHeaders() throws Exception {
        mockMvc.perform(options("/orders")
                .header("Origin", "http://localhost:3000")
                .header("Access-Control-Request-Method", "POST"))
            .andExpect(status().isOk())
            .andExpect(header().exists("Access-Control-Allow-Origin"));
    }
}
