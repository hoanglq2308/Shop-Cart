package com.shopcart.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.shopcart.entity.Product;
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

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class InventoryControllerIntegrationTest {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CouponRepository couponRepository;

    @Autowired
    private UserRepository userRepository;

    private Product availableProduct;
    private Product lowStockProduct;

    @BeforeEach
    void setUp() {
        orderRepository.deleteAll();
        couponRepository.deleteAll();
        productRepository.deleteAll();
        userRepository.deleteAll();

        availableProduct = productRepository.save(new Product(
                "Monitor",
                new BigDecimal("100000.00"),
                5,
                ProductStatus.ACTIVE
        ));
        lowStockProduct = productRepository.save(new Product(
                "Keyboard",
                new BigDecimal("50000.00"),
                1,
                ProductStatus.ACTIVE
        ));
    }

    @Test
    void postApiInventoryCheck_whenOneItemInsufficient_shouldReturnAvailabilityDetails() throws Exception {
        // Arrange
        String payload = """
                {
                  "items": [
                    { "productId": %d, "quantity": 2 },
                    { "productId": %d, "quantity": 3 }
                  ]
                }
                """.formatted(availableProduct.getId(), lowStockProduct.getId());

        // Act & Assert
        mockMvc.perform(post("/api/inventory/check")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.available").value(false))
                .andExpect(jsonPath("$.items.length()").value(2))
                .andExpect(jsonPath("$.items[0].available").value(true))
                .andExpect(jsonPath("$.items[1].available").value(false))
                .andExpect(jsonPath("$.items[1].availableStock").value(1));
    }
}
