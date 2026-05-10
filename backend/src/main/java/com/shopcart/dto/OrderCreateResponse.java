package com.shopcart.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderCreateResponse {
    private boolean success;
    private String message;
    private String orderId;
    private BigDecimal total;
    private String payment;
}