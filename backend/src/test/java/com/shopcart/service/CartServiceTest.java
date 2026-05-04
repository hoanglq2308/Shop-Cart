package com.shopcart.service;


import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

import java.util.Optional;

import com.shopcart.entity.Product;
import com.shopcart.repository.CartItemRepository;
import com.shopcart.repository.CartRepository;
import com.shopcart.repository.ProductRepository;


import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;


@ExtendWith(MockitoExtension.class)
public class CartServiceTest {
    @Mock
    private CartRepository cartRepository;
    @Mock
    private CartItemRepository cartItemRepository;
    @Mock
    private ProductRepository productRepository;
    @InjectMocks
    private CartService cartService;
    @Test
    @DisplayName("thêm sản phẩm với số lượng vượt quá tồn kho hiện tại")
    public void TestAddToCart_ThrowException_WhenQuantityExceedsStock(){
        Long userId = 1L;
        Long productId = 1L;
        int requestQuantity = 10;

        Product mockProduct = new Product();
        mockProduct.setId(productId);
        mockProduct.setStockQuantity(5);

        when(productRepository.findById(productId)).thenReturn(Optional.of(mockProduct));
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            cartService.addToCart(userId, productId, requestQuantity);
        });
        assertEquals("Số lượng yêu cầu vượt quá tồn kho hiện tại", exception.getMessage());
    }





    
}
