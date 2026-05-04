package com.shopcart.service;

import org.springframework.stereotype.Service;
// import org.springframework.beans.factory.annotation.Autowired;

import com.shopcart.entity.Product;
// import com.shopcart.repository.CartRepository;
// import com.shopcart.repository.CartItemRepository;
import com.shopcart.repository.ProductRepository;

@Service
public class CartService {
    // @Autowired
    // private CartRepository cartRepository;
    // @Autowired
    // private CartItemRepository cartItemRepository;
    // @Autowired
    private ProductRepository productRepository;

    public void addToCart(Long userId, Long productId, int quantity) {
        Product product = productRepository.findById(productId).orElseThrow(() -> new RuntimeException("Sản phẩm này không tồn tại"));
        if(quantity > product.getStockQuantity()) {
            throw new RuntimeException("Số lượng yêu cầu vượt quá tồn kho hiện tại");
        }
    }
    
}
