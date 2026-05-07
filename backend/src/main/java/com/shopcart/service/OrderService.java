package com.shopcart.service;

import com.shopcart.dto.request.OrderItemRequest;
import com.shopcart.dto.request.OrderRequest;
import com.shopcart.dto.response.OrderResponse;
import com.shopcart.dto.response.OrderTotalResponse;
import com.shopcart.entity.Coupon;
import com.shopcart.entity.Order;
import com.shopcart.entity.OrderItem;
import com.shopcart.entity.Product;
import com.shopcart.entity.User;
import com.shopcart.enums.CouponType;
import com.shopcart.enums.OrderStatus;
import com.shopcart.exception.BusinessException;
import com.shopcart.exception.ResourceNotFoundException;
import com.shopcart.repository.CouponRepository;
import com.shopcart.repository.InventoryRepository;
import com.shopcart.repository.OrderRepository;
import com.shopcart.repository.UserRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OrderService {
    private static final BigDecimal ONE_HUNDRED = BigDecimal.valueOf(100);

    private final OrderRepository orderRepository;
    private final InventoryRepository inventoryRepository;
    private final CouponRepository couponRepository;
    private final UserRepository userRepository;

    public OrderService(OrderRepository orderRepository,
                        InventoryRepository inventoryRepository,
                        CouponRepository couponRepository,
                        UserRepository userRepository) {
        this.orderRepository = orderRepository;
        this.inventoryRepository = inventoryRepository;
        this.couponRepository = couponRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public OrderResponse createOrder(OrderRequest request) {
        ValidatedOrderInput input = validateCreateOrderRequest(request);
        User user = userRepository.findById(request.userId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + request.userId()));

        Map<Long, Product> products = loadProductsForCheckout(input.quantities().keySet());
        validateProductsForCheckout(input.quantities(), products);

        PricingResult pricing = calculatePricing(input.quantities(), products, input.shippingFee(), request.couponCode());
        if (pricing.total().totalPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("totalPrice must be greater than 0");
        }

        Order order = new Order();
        order.setUser(user);
        order.setCoupon(pricing.appliedCoupon().orElse(null));
        order.setSubtotal(pricing.total().subtotal());
        order.setShippingFee(pricing.total().shippingFee());
        order.setDiscountAmount(pricing.total().discountAmount());
        order.setTotalPrice(pricing.total().totalPrice());
        order.setShippingAddress(input.shippingAddress());
        order.setPaymentMethod(input.paymentMethod());
        order.setStatus(OrderStatus.PENDING);

        input.quantities().forEach((productId, quantity) -> {
            Product product = products.get(productId);
            order.addOrderItem(new OrderItem(product, quantity, money(product.getPrice())));
            product.decreaseStock(quantity);
        });

        pricing.appliedCoupon().ifPresent(Coupon::increaseUsedCount);
        Order savedOrder = orderRepository.save(order);
        return OrderResponse.from(savedOrder);
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
        return OrderResponse.from(order);
    }

    @Transactional
    public OrderResponse cancelOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        if (!order.canBeCancelled()) {
            throw new BusinessException("Only PENDING or PAID orders can be cancelled");
        }

        order.getOrderItems().forEach(item -> item.getProduct().increaseStock(item.getQuantity()));
        if (order.getCoupon() != null) {
            order.getCoupon().decreaseUsedCount();
        }
        order.setStatus(OrderStatus.CANCELLED);

        Order savedOrder = orderRepository.save(order);
        return OrderResponse.from(savedOrder);
    }

    @Transactional(readOnly = true)
    public OrderTotalResponse calculateOrderTotal(List<OrderItemRequest> items,
                                                  BigDecimal shippingFee,
                                                  String couponCode) {
        Map<Long, Integer> quantities = normalizeItems(items);
        BigDecimal safeShippingFee = validateShippingFee(shippingFee);
        Map<Long, Product> products = loadProducts(quantities.keySet());
        validateProductsForCheckout(quantities, products);
        return calculatePricing(quantities, products, safeShippingFee, couponCode).total();
    }

    @Transactional(readOnly = true)
    public boolean checkStockBeforeOrder(List<OrderItemRequest> items) {
        try {
            Map<Long, Integer> quantities = normalizeItems(items);
            Map<Long, Product> products = loadProducts(quantities.keySet());
            return productsMatchStockRules(quantities, products);
        } catch (RuntimeException ex) {
            return false;
        }
    }

    private ValidatedOrderInput validateCreateOrderRequest(OrderRequest request) {
        if (request == null) {
            throw new BusinessException("Order request is required");
        }
        if (request.userId() == null) {
            throw new BusinessException("userId is required");
        }
        String shippingAddress = request.resolvedShippingAddress();
        if (shippingAddress.isBlank()) {
            throw new BusinessException("shippingAddress must not be blank");
        }
        BigDecimal shippingFee = validateShippingFee(request.resolvedShippingFee());
        Map<Long, Integer> quantities = normalizeItems(request.items());
        return new ValidatedOrderInput(
                quantities,
                shippingFee,
                shippingAddress,
                request.resolvedPaymentMethod()
        );
    }

    private BigDecimal validateShippingFee(BigDecimal shippingFee) {
        BigDecimal safeShippingFee = shippingFee == null ? BigDecimal.ZERO : shippingFee;
        if (safeShippingFee.compareTo(BigDecimal.ZERO) < 0) {
            throw new BusinessException("shippingFee must be greater than or equal to 0");
        }
        return money(safeShippingFee);
    }

    private Map<Long, Integer> normalizeItems(List<OrderItemRequest> items) {
        if (items == null || items.isEmpty()) {
            throw new BusinessException("Order must contain at least one item");
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

    private Map<Long, Product> loadProductsForCheckout(Collection<Long> productIds) {
        Map<Long, Product> products = new LinkedHashMap<>();
        for (Long productId : productIds) {
            Product product = inventoryRepository.findByIdForUpdate(productId)
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));
            products.put(productId, product);
        }
        return products;
    }

    private void validateProductsForCheckout(Map<Long, Integer> quantities, Map<Long, Product> products) {
        for (Map.Entry<Long, Integer> entry : quantities.entrySet()) {
            Product product = products.get(entry.getKey());
            if (product == null) {
                throw new ResourceNotFoundException("Product not found with id: " + entry.getKey());
            }
            if (!product.isActive()) {
                throw new BusinessException("Product is not active: " + entry.getKey());
            }
            if (!product.hasEnoughStock(entry.getValue())) {
                throw new BusinessException("Product is out of stock: " + entry.getKey());
            }
        }
    }

    private boolean productsMatchStockRules(Map<Long, Integer> quantities, Map<Long, Product> products) {
        if (products.size() != quantities.size()) {
            return false;
        }
        return quantities.entrySet().stream()
                .allMatch(entry -> {
                    Product product = products.get(entry.getKey());
                    return product != null && product.isActive() && product.hasEnoughStock(entry.getValue());
                });
    }

    private PricingResult calculatePricing(Map<Long, Integer> quantities,
                                           Map<Long, Product> products,
                                           BigDecimal shippingFee,
                                           String couponCode) {
        BigDecimal rawSubtotal = quantities.entrySet().stream()
                .map(entry -> money(products.get(entry.getKey()).getPrice())
                        .multiply(BigDecimal.valueOf(entry.getValue())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal subtotal = money(rawSubtotal);

        Optional<Coupon> coupon = findApplicableCoupon(couponCode, subtotal);
        BigDecimal discount = coupon
                .map(value -> calculateDiscount(value, subtotal))
                .orElse(BigDecimal.ZERO);
        BigDecimal total = money(subtotal.subtract(discount).add(shippingFee));
        OrderTotalResponse response = new OrderTotalResponse(
                subtotal,
                discount,
                shippingFee,
                total,
                coupon.map(Coupon::getCode).orElse(null),
                coupon.isPresent()
        );
        return new PricingResult(response, coupon);
    }

    private Optional<Coupon> findApplicableCoupon(String couponCode, BigDecimal subtotal) {
        if (couponCode == null || couponCode.isBlank()) {
            return Optional.empty();
        }
        return couponRepository.findByCodeIgnoreCase(couponCode.trim())
                .filter(coupon -> coupon.canApply(subtotal, LocalDateTime.now()));
    }

    private BigDecimal calculateDiscount(Coupon coupon, BigDecimal subtotal) {
        BigDecimal discount;
        if (CouponType.PERCENTAGE.equals(coupon.getDiscountType())) {
            discount = subtotal.multiply(coupon.getDiscountValue())
                    .divide(ONE_HUNDRED, 2, RoundingMode.HALF_UP);
        } else {
            discount = coupon.getDiscountValue();
        }
        return money(discount.min(subtotal));
    }

    private BigDecimal money(BigDecimal value) {
        return value.setScale(2, RoundingMode.HALF_UP);
    }

    private record ValidatedOrderInput(
            Map<Long, Integer> quantities,
            BigDecimal shippingFee,
            String shippingAddress,
            String paymentMethod
    ) {
    }

    private record PricingResult(OrderTotalResponse total, Optional<Coupon> appliedCoupon) {
    }
}
