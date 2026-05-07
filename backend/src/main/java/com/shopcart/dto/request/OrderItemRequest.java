package com.shopcart.dto.request;

public record OrderItemRequest(Long productId, int quantity) {
}
