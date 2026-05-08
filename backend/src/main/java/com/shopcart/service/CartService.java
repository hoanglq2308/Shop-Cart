package com.shopcart.service;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.Optional;

// import com.shopcart.repository.CartRepository;
// import com.shopcart.repository.CartItemRepository;
import com.shopcart.repository.*;
import com.shopcart.dto.CartResponse;
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
        Product product = productRepository.findById(productId).orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại"));
        if(product.getStockQuantity() <= 0) {
            throw new RuntimeException("Hết hàng");
        }else if (quantity > product.getStockQuantity()) {
            throw new RuntimeException("Số lượng yêu cầu vượt quá tồn kho hiện tại");
        }else{
             // Logic để thêm sản phẩm vào giỏ hàng sẽ được thực hiện ở đây
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
            // Tạo chi tiết giỏ hàng mới và lưu vào cơ sở dữ liệu
            CartItem cartItem = new CartItem();
            cartItem.setCart(cart);
            cartItem.setProductId(product);
            cartItem.setQuantity(quantity);
            cartItemRepository.save(cartItem);
            return new CartResponse(true, "Thêm vào giỏ hàng thành công", product.getPrice().multiply(new BigDecimal(cartItem.getQuantity())).longValue());
        }
        
        
    }
    public void removeFromCart(Long userId, Long productId){
            Optional<Cart> optioalCart = cartRepository.findByUserId(userId);
            if(optioalCart.isPresent()) {
                Optional<CartItem> optionalCartItem = cartItemRepository.findByCartIdAndProductId(optioalCart.get().getId(), productId);
                if(optionalCartItem.isPresent()) {
                    cartItemRepository.delete(optionalCartItem.get());
                }else {
                    throw new RuntimeException("Sản phẩm không tồn tại trong giỏ hàng");
                }
            }else {
                throw new RuntimeException("Giỏ hàng không tồn tại");
            }
    }
    public void updateCartItemQuantity(Long userId, Long ProductId, int newQuantity){
        Optional<Cart> OptionalCart = cartRepository.findByUserId(userId);
        if(OptionalCart.isPresent()){
            Optional<CartItem> optionalCartItem = cartItemRepository.findByCartIdAndProductId(OptionalCart.get().getId(), ProductId);
            int check = newQuantity + optionalCartItem.get().getQuantity();
            if(check > optionalCartItem.get().getProductId().getStockQuantity()) {
                throw new RuntimeException("Số lượng yêu cầu vượt quá tồn kho hiện tại");
            }else {
                if(optionalCartItem.isPresent()) {
                    CartItem cartItem = optionalCartItem.get();
                    cartItem.setQuantity(newQuantity);
                    cartItemRepository.save(cartItem);
                }
            }
        }
    }

    
}
