package com.shopcart.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.jayway.jsonpath.JsonPath;
import com.shopcart.entity.Product;
import com.shopcart.entity.User;
import com.shopcart.enums.ProductStatus;
import com.shopcart.repository.CouponRepository;
import com.shopcart.repository.OrderRepository;
import com.shopcart.repository.ProductRepository;
import com.shopcart.repository.UserRepository;
import java.math.BigDecimal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class OrderControllerIntegrationTest {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CouponRepository couponRepository;

    @Autowired
    private OrderRepository orderRepository;

    private User user;
    private Product product;

    @BeforeEach
    void setUp() {
        orderRepository.deleteAll();
        couponRepository.deleteAll();
        productRepository.deleteAll();
        userRepository.deleteAll();

        user = userRepository.save(new User("Khang", "khang@example.com", "0900000000", "123456"));
        product = productRepository.save(new Product(
                "Monitor",
                new BigDecimal("100000.00"),
                10,
                ProductStatus.ACTIVE
        ));
    }

    @Test
    void postApiOrders_whenRequestValid_shouldReturn201AndExpectedJsonStructure() throws Exception {
        // Arrange
        String payload = """
                {
                  "userId": %d,
                  "shippingAddress": "123 Nguyen Trai, Quan 1",
                  "paymentMethod": "COD",
                  "shippingFee": 15000,
                  "items": [
                    { "productId": %d, "quantity": 2 }
                  ]
                }
                """.formatted(user.getId(), product.getId());

        // Act & Assert
        mockMvc.perform(post("/api/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.userId").value(user.getId().intValue()))
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.subtotal").value(200000.0))
                .andExpect(jsonPath("$.shippingFee").value(15000.0))
                .andExpect(jsonPath("$.discountAmount").value(0.0))
                .andExpect(jsonPath("$.totalPrice").value(215000.0))
                .andExpect(jsonPath("$.shippingAddress").value("123 Nguyen Trai, Quan 1"))
                .andExpect(jsonPath("$.items[0].productId").value(product.getId().intValue()))
                .andExpect(jsonPath("$.items[0].productName").value("Monitor"))
                .andExpect(jsonPath("$.items[0].quantity").value(2));

        Product reloaded = productRepository.findById(product.getId()).orElseThrow();
        assertThat(reloaded.getStockQuantity()).isEqualTo(8);
    }

    @Test
    void getApiOrdersById_whenOrderExists_shouldReturnCreatedOrder() throws Exception {
        // Arrange
        String payload = """
                {
                  "userId": %d,
                  "shippingAddress": "123 Nguyen Trai, Quan 1",
                  "paymentMethod": "COD",
                  "shippingFee": 0,
                  "items": [
                    { "productId": %d, "quantity": 1 }
                  ]
                }
                """.formatted(user.getId(), product.getId());
        MvcResult createResult = mockMvc.perform(post("/api/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isCreated())
                .andReturn();
        Number orderId = JsonPath.read(createResult.getResponse().getContentAsString(), "$.id");

        // Act & Assert
        mockMvc.perform(get("/api/orders/{id}", orderId.longValue()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(orderId.intValue()))
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.items[0].quantity").value(1));
    }
}
