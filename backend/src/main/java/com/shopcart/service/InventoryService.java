package com.shopcart.service;

import com.shopcart.dto.request.InventoryCheckRequest;
import com.shopcart.dto.request.OrderItemRequest;
import com.shopcart.dto.response.InventoryCheckResponse;
import com.shopcart.dto.response.InventoryItemAvailabilityResponse;
import com.shopcart.entity.Product;
import com.shopcart.exception.BusinessException;
import com.shopcart.repository.InventoryRepository;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class InventoryService {
    private final InventoryRepository inventoryRepository;

    public InventoryService(InventoryRepository inventoryRepository) {
        this.inventoryRepository = inventoryRepository;
    }

    @Transactional(readOnly = true)
    public InventoryCheckResponse checkAvailability(InventoryCheckRequest request) {
        Map<Long, Integer> quantities = normalizeItems(request.items());
        Map<Long, Product> products = loadProducts(quantities.keySet());

        List<InventoryItemAvailabilityResponse> items = quantities.entrySet().stream()
                .map(entry -> toAvailabilityResponse(entry.getKey(), entry.getValue(), products.get(entry.getKey())))
                .toList();
        boolean available = items.stream().allMatch(InventoryItemAvailabilityResponse::available);
        String message = available ? "All requested products are available" : "Some products are not available";
        return new InventoryCheckResponse(available, items, message);
    }

    private Map<Long, Integer> normalizeItems(List<OrderItemRequest> items) {
        if (items == null || items.isEmpty()) {
            throw new BusinessException("Inventory check must contain at least one item");
        }

        Map<Long, Integer> quantities = new LinkedHashMap<>();
        for (OrderItemRequest item : items) {
            if (item == null || item.productId() == null) {
                throw new BusinessException("productId is required for every item");
            }
            if (item.quantity() <= 0) {
                throw new BusinessException("quantity must be greater than 0");
            }
            quantities.merge(item.productId(), item.quantity(), Integer::sum);
        }
        return quantities;
    }

    private Map<Long, Product> loadProducts(Collection<Long> productIds) {
        return inventoryRepository.findByIdIn(productIds).stream()
                .collect(Collectors.toMap(Product::getId, Function.identity()));
    }

    private InventoryItemAvailabilityResponse toAvailabilityResponse(Long productId, int requestedQuantity, Product product) {
        if (product == null) {
            return new InventoryItemAvailabilityResponse(productId, null, requestedQuantity, 0, false, false);
        }
        boolean available = product.isActive() && product.hasEnoughStock(requestedQuantity);
        return new InventoryItemAvailabilityResponse(
                product.getId(),
                product.getName(),
                requestedQuantity,
                product.getStockQuantity(),
                product.isActive(),
                available
        );
    }
}
