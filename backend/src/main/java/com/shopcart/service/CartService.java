package com.shopcart.service;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.Optional;
import java.util.List;
import java.util.stream.Collectors;

import com.shopcart.repository.*;
import com.shopcart.dto.CartResponse;
import com.shopcart.dto.CartItemResponse;
import com.shopcart.dto.CartGetResponse;
import com.shopcart.entity.Cart;
import com.shopcart.entity.CartItem;
import com.shopcart.entity.Product;
import com.shopcart.entity.User;
import java.math.BigDecimal;

@Service
public class CartService {
    @Autowired
    private CartRepository cartRepository;
    @Autowired
    private CartItemRepository cartItemRepository;
    @Autowired
    private ProductRepository productRepository;

    public CartResponse addToCart(Long userId, Long productId, int quantity) {
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại"));
        
        if(product.getStockQuantity() <= 0) {
            throw new RuntimeException("Hết hàng");
        }
        
        if (quantity > product.getStockQuantity()) {
            throw new RuntimeException("Số lượng yêu cầu vượt quá tồn kho hiện tại");
        }
        
        Optional<Cart> optionalCart = cartRepository.findByUserId(userId);
        Cart cart;
        
        if(optionalCart.isPresent()) {
            cart = optionalCart.get();
        } else {
            cart = new Cart();
            User user = new User();
            user.setId(userId);
            cart.setUser(user);
            cartRepository.save(cart);
        }
        
        // Check if product already in cart
        Optional<CartItem> existingItem = cartItemRepository.findByCartIdAndProductId(cart.getId(), productId);
        CartItem cartItem;
        
        if(existingItem.isPresent()) {
            cartItem = existingItem.get();
            int newQuantity = cartItem.getQuantity() + quantity;
            if(newQuantity > product.getStockQuantity()) {
                throw new RuntimeException("Số lượng yêu cầu vượt quá tồn kho hiện tại");
            }
            cartItem.setQuantity(newQuantity);
        } else {
            cartItem = new CartItem();
            cartItem.setCart(cart);
            cartItem.setProduct(product);
            cartItem.setQuantity(quantity);
        }
        
        cartItemRepository.save(cartItem);
        
        BigDecimal cartTotal = calculateCartTotal(cart.getId());
        return new CartResponse(true, "Thêm vào giỏ hàng thành công", cartTotal.longValue());
    }

    public CartGetResponse getCart(Long userId) {
        Optional<Cart> optionalCart = cartRepository.findByUserId(userId);
        
        if(!optionalCart.isPresent()) {
            return CartGetResponse.builder()
                .success(true)
                .message("Giỏ hàng trống")
                .cartItems(List.of())
                .cartTotal(BigDecimal.ZERO)
                .itemCount(0)
                .build();
        }
        
        Cart cart = optionalCart.get();
        List<CartItem> cartItems = cartItemRepository.findByCartId(cart.getId());
        List<CartItemResponse> cartItemResponses = cartItems.stream()
            .map(item -> CartItemResponse.builder()
                .cartItemId(item.getId())
                .productId(item.getProduct().getId())
                .productName(item.getProduct().getName())
                .imageUrl(item.getProduct().getImageUrl())
                .price(item.getProduct().getPrice())
                .quantity(item.getQuantity())
                .stock(item.getProduct().getStockQuantity())
                .total(item.getProduct().getPrice().multiply(new BigDecimal(item.getQuantity())))
                .build())
            .collect(Collectors.toList());
        
        BigDecimal cartTotal = cartItemResponses.stream()
            .map(CartItemResponse::getTotal)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        int itemCount = cartItemResponses.stream()
            .mapToInt(CartItemResponse::getQuantity)
            .sum();
        
        return CartGetResponse.builder()
            .success(true)
            .message("Lấy giỏ hàng thành công")
            .cartItems(cartItemResponses)
            .cartTotal(cartTotal)
            .itemCount(itemCount)
            .build();
    }

    public void removeFromCart(Long cartItemId) {
        CartItem cartItem = cartItemRepository.findById(cartItemId)
            .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại trong giỏ hàng"));
        cartItemRepository.delete(cartItem);
    }

    public CartResponse updateCartItemQuantity(Long cartItemId, int newQuantity) {
        CartItem cartItem = cartItemRepository.findById(cartItemId)
            .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại trong giỏ hàng"));
        
        if(newQuantity <= 0) {
            throw new RuntimeException("Số lượng phải lớn hơn 0");
        }
        
        Product product = cartItem.getProduct();
        if(newQuantity > product.getStockQuantity()) {
            throw new RuntimeException("Số lượng yêu cầu vượt quá tồn kho hiện tại");
        }
        
        cartItem.setQuantity(newQuantity);
        cartItemRepository.save(cartItem);
        
        BigDecimal cartTotal = calculateCartTotal(cartItem.getCart().getId());
        return new CartResponse(true, "Cập nhật số lượng thành công", cartTotal.longValue());
    }

    private BigDecimal calculateCartTotal(Long cartId) {
        List<CartItem> cartItems = cartItemRepository.findByCartId(cartId);
        return cartItems.stream()
            .map(item -> item.getProduct().getPrice().multiply(new BigDecimal(item.getQuantity())))
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
