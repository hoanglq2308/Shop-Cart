package com.shopcart.dto.response;

import java.math.BigDecimal;

public record OrderTotalResponse(
        BigDecimal subtotal,
        BigDecimal discountAmount,
        BigDecimal shippingFee,
        BigDecimal totalPrice,
        String couponCode,
        boolean couponApplied
) {
}
