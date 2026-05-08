package com.shopcart.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.shopcart.dto.CartItemRequest;
import com.shopcart.dto.CartResponse;
import com.shopcart.service.CartService;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/cart")
public class CartController {
    @Autowired
    private CartService cartService;
    @PostMapping("/add")
    public ResponseEntity<CartResponse> addToCart(
            @RequestHeader(value = "Authorization", required = false) String token,
            @RequestBody CartItemRequest request) {
                try{
                    if(request.getQuantity() <= 0){
                        return ResponseEntity.badRequest().body(CartResponse.builder()
                        .success(false)
                        .message("Số lượng phải lớn hơn 0")
                        .build());
                    }
                    Long productId = Long.valueOf(request.getProductId().replace("P", "").trim());
                    cartService.addToCart(1L, productId, request.getQuantity());
                    CartResponse response = CartResponse.builder()
                    .success(true)
                    .message("Thêm vào giỏ hàng thành công")
                    .cartTotal(50000L)
                    .build();
                    return ResponseEntity.ok(response);
                } catch (Exception e) {
                    CartResponse errorResponse = CartResponse.builder()
                    .success(false)
                    .message(e.getMessage()) // Lấy đúng câu chửi "Số lượng phải lớn hơn 0" nhét vào đây
                    .cartTotal(0L)
                    .build();
                     return ResponseEntity.badRequest().body(errorResponse);
                }
                
                
        }
}
 
    

