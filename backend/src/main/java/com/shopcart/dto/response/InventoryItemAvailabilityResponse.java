package com.shopcart.dto.response;

public record InventoryItemAvailabilityResponse(
        Long productId,
        String productName,
        int requestedQuantity,
        int availableStock,
        boolean active,
        boolean available
) {
}
