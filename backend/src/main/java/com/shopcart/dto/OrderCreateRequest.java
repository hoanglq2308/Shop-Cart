package com.shopcart.dto;

import java.math.BigDecimal;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderCreateRequest {
    private Customer customer;
    private List<OrderItemRequest> items;
    private BigDecimal total;
    private String couponCode;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Customer {
        private String fullName;
        private String phone;
        private String address;
        private String city;
        private String district;
        private String cityLabel;
        private String districtLabel;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItemRequest {
        private Long productId;
        private int quantity;
    }
}