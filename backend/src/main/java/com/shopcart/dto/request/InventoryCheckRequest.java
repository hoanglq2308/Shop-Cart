package com.shopcart.dto.request;

import java.util.List;

public record InventoryCheckRequest(List<OrderItemRequest> items) {
}
