package com.shopcart.service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.shopcart.dto.OrderCreateRequest;
import com.shopcart.repository.CartItemRepository;
import com.shopcart.repository.CartRepository;
import com.shopcart.repository.ProductRepository;
import com.shopcart.entity.Cart;
import com.shopcart.entity.CartItem;
import com.shopcart.entity.Product;

@Service
public class OrderService {
    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    /**
     * Process an order for a given user: validate stock, decrement product stock,
     * and remove related cart items.
     *
     * @param userId
     * @param request
     * @return generated order id string
     */
    public String processOrder(Long userId, OrderCreateRequest request) {
        // Validate items
        if (request == null || request.getItems() == null || request.getItems().isEmpty()) {
            throw new RuntimeException("Dữ liệu đặt hàng không hợp lệ");
        }

        // Check and decrement stock for each item
        for (OrderCreateRequest.OrderItemRequest item : request.getItems()) {
            Long productId = item.getProductId();
            int qty = item.getQuantity();

            Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại: " + productId));

            if (product.getStockQuantity() < qty) {
                throw new RuntimeException("Sản phẩm '" + product.getName() + "' không đủ tồn kho");
            }

            product.setStockQuantity(product.getStockQuantity() - qty);
            productRepository.save(product);
        }

        // Remove items from user's cart (if any)
        Optional<Cart> optionalCart = cartRepository.findByUserId(userId);
        if (optionalCart.isPresent()) {
            Cart cart = optionalCart.get();
            List<CartItem> cartItems = cartItemRepository.findByCartId(cart.getId());
            // Remove only items that are part of order
            for (CartItem ci : cartItems) {
                final Long pid = ci.getProduct().getId();
                boolean inOrder = request.getItems().stream().anyMatch(i -> i.getProductId().equals(pid));
                if (inOrder) {
                    cartItemRepository.delete(ci);
                }
            }
        }

        // For now generate a simple order id and return it. Persisting Order entity
        // can be implemented later if needed.
        return "#LUXE-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}
