package com.shopcart.dto.request;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public record OrderRequest(
        Long userId,
        List<OrderItemRequest> items,
        BigDecimal shippingFee,
        String shippingAddress,
        String paymentMethod,
        String couponCode,
        CustomerRequest customer,
        BigDecimal total
) {
    public String resolvedShippingAddress() {
        if (shippingAddress != null && !shippingAddress.isBlank()) {
            return shippingAddress.trim();
        }
        if (customer == null) {
            return "";
        }
        return Stream.of(customer.address(), customer.district(), customer.city())
                .filter(value -> value != null && !value.isBlank())
                .map(String::trim)
                .collect(Collectors.joining(", "));
    }

    public String resolvedPaymentMethod() {
        if (paymentMethod == null || paymentMethod.isBlank()) {
            return "COD";
        }
        return paymentMethod.trim();
    }

    public BigDecimal resolvedShippingFee() {
        return shippingFee == null ? BigDecimal.ZERO : shippingFee;
    }
}
