package com.shopcart.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartGetResponse {
    private boolean success;
    private String message;
    private List<CartItemResponse> cartItems;
    private BigDecimal cartTotal;
    private int itemCount;
}
