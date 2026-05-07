package com.shopcart.dto.response;

import java.util.List;

public record InventoryCheckResponse(
        boolean available,
        List<InventoryItemAvailabilityResponse> items,
        String message
) {
}
