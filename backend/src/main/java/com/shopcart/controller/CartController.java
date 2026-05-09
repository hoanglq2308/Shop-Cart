package com.shopcart.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import com.shopcart.dto.CartItemRequest;
import com.shopcart.dto.CartResponse;
import com.shopcart.dto.CartGetResponse;
import com.shopcart.dto.QuantityUpdateRequest;
import com.shopcart.service.CartService;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/cart")
public class CartController {
    @Autowired
    private CartService cartService;

    /**
     * GET /api/cart - Retrieve user's cart items
     */
    @GetMapping
    public ResponseEntity<?> getCart(
            @RequestHeader(value = "Authorization", required = false) String token) {
        try {
            Long userId = 1L; // In production, extract from JWT token
            CartGetResponse response = cartService.getCart(userId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(CartGetResponse.builder()
                .success(false)
                .message(e.getMessage())
                .build());
        }
    }

    /**
     * POST /api/cart/add - Add product to cart
     */
    @PostMapping("/add")
    public ResponseEntity<?> addToCart(
            @RequestHeader(value = "Authorization", required = false) String token,
            @RequestBody CartItemRequest request) {
        try {
            if(request.getQuantity() <= 0) {
                return ResponseEntity.badRequest().body(CartResponse.builder()
                    .success(false)
                    .message("Số lượng phải lớn hơn 0")
                    .build());
            }
            
            Long productId = Long.valueOf(request.getProductId().replace("P", "").trim());
            Long userId = 1L; // In production, extract from JWT token
            
            CartResponse response = cartService.addToCart(userId, productId, request.getQuantity());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(CartResponse.builder()
                .success(false)
                .message(e.getMessage())
                .build());
        }
    }

    /**
     * PUT /api/cart/{cartItemId}/quantity - Update item quantity
     */
    @PutMapping("/{cartItemId}/quantity")
    public ResponseEntity<?> updateQuantity(
            @PathVariable Long cartItemId,
            @RequestBody QuantityUpdateRequest request,
            @RequestHeader(value = "Authorization", required = false) String token) {
        try {
            if(request.getQuantity() <= 0) {
                return ResponseEntity.badRequest().body(CartResponse.builder()
                    .success(false)
                    .message("Số lượng phải lớn hơn 0")
                    .build());
            }
            
            CartResponse response = cartService.updateCartItemQuantity(cartItemId, request.getQuantity());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(CartResponse.builder()
                .success(false)
                .message(e.getMessage())
                .build());
        }
    }

    /**
     * DELETE /api/cart/{cartItemId} - Remove item from cart
     */
    @DeleteMapping("/{cartItemId}")
    public ResponseEntity<?> removeItem(
            @PathVariable Long cartItemId,
            @RequestHeader(value = "Authorization", required = false) String token) {
        try {
            cartService.removeFromCart(cartItemId);
            return ResponseEntity.ok(CartResponse.builder()
                .success(true)
                .message("Xóa sản phẩm khỏi giỏ hàng thành công")
                .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(CartResponse.builder()
                .success(false)
                .message(e.getMessage())
                .build());
        }
    }
}
 
    

