package com.shopcart.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.shopcart.dto.OrderCreateRequest;
import com.shopcart.dto.OrderPricingResponse;
import com.shopcart.entity.Coupon;
import com.shopcart.repository.CartItemRepository;
import com.shopcart.repository.CartRepository;
import com.shopcart.repository.CouponRepository;
import com.shopcart.repository.ProductRepository;
import com.shopcart.entity.Cart;
import com.shopcart.entity.CartItem;
import com.shopcart.entity.Product;

@Service
public class OrderService {
    private static final BigDecimal SHIPPING_FEE = new BigDecimal("15000.00");

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private CouponService couponService;

    @Autowired
    private CouponRepository couponRepository;

    /**
     * Process an order for a given user: validate stock, decrement product stock,
     * and remove related cart items.
     *
     * @param userId
     * @param request
     * @return generated order id string
     */
    @Transactional
    public String processOrder(Long userId, OrderCreateRequest request) {
        OrderPricingResponse pricing = calculatePricing(request);
        Coupon coupon = null;

        if (StringUtils.hasText(request.getCouponCode())) {
            coupon = couponService.requireValidCoupon(request.getCouponCode(), pricing.getSubtotal());
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

        if (coupon != null) {
            couponService.incrementUsage(coupon);
        }

        // For now generate a simple order id and return it. Persisting Order entity
        // can be implemented later if needed.
        return "#LUXE-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    public OrderPricingResponse calculatePricing(OrderCreateRequest request) {
        if (request == null || request.getItems() == null || request.getItems().isEmpty()) {
            throw new RuntimeException("Dữ liệu đặt hàng không hợp lệ");
        }

        BigDecimal subtotal = BigDecimal.ZERO;
        for (OrderCreateRequest.OrderItemRequest item : request.getItems()) {
            Long productId = item.getProductId();
            int qty = item.getQuantity();

            Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại: " + productId));

            BigDecimal lineTotal = product.getPrice().multiply(BigDecimal.valueOf(qty));
            subtotal = subtotal.add(lineTotal);
        }

        BigDecimal shippingFee = subtotal.compareTo(BigDecimal.ZERO) > 0 ? SHIPPING_FEE : BigDecimal.ZERO;
        BigDecimal discountAmount = BigDecimal.ZERO;
        String couponCode = null;

        if (StringUtils.hasText(request.getCouponCode())) {
            Coupon coupon = couponService.requireValidCoupon(request.getCouponCode(), subtotal);
            discountAmount = couponService.calculateDiscount(coupon, subtotal);
            couponCode = coupon.getCode();
        }

        BigDecimal total = subtotal.add(shippingFee).subtract(discountAmount);

        return OrderPricingResponse.builder()
            .subtotal(subtotal)
            .shippingFee(shippingFee)
            .discountAmount(discountAmount)
            .total(total.max(BigDecimal.ZERO))
            .couponCode(couponCode)
            .build();
    }
}
