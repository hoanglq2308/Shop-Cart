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
public class CouponValidationRequest {
    private String code;
    private BigDecimal subtotal;
    private BigDecimal shippingFee;
}