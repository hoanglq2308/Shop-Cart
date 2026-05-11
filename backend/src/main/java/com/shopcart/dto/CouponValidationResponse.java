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
public class CouponValidationResponse {
    private boolean success;
    private String message;
    private CouponInfo coupon;
    private BigDecimal subtotal;
    private BigDecimal shippingFee;
    private BigDecimal discountAmount;
    private BigDecimal total;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CouponInfo {
        private String code;
        private String discountType;
        private BigDecimal discountValue;
        private BigDecimal minOrderValue;
        private Integer usageLimit;
        private Integer usedCount;
        private String expiryDate;
        private Boolean isActive;
    }
}