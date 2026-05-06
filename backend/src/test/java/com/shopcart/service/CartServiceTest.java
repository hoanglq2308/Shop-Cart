package com.shopcart.service;


import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import com.shopcart.entity.Cart;
import com.shopcart.entity.CartItem;
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
    @Test
    @DisplayName("Thêm Sản Phẩm vào giỏ hàng thành công")
    public void TestAddToCart_Success(){
        Long userId = 1L;
        Long ProductId = 1L;
        int requestQuantity = 3;
        Product mockProduct = new Product();
        mockProduct.setId (ProductId);
        mockProduct.setStockQuantity(5);
        when(productRepository.findById(ProductId)).thenReturn(Optional.of(mockProduct));
        cartService.addToCart(userId, ProductId, requestQuantity);
        verify(cartRepository, times(1)).save(any());

    }
    @Test
    @DisplayName("Thêm sản sản phẩm vào giỏ đã tồn tại của User")
    public void TestAddToCart_WhenUserHasExistingCart(){
        Long userId = 1L;
        Long ProductId = 1L;
        int requestQuantity = 2;

        Product mockProduct = new Product();
        mockProduct.setId(ProductId);
        mockProduct.setStockQuantity(5);
        Cart mockCart = new Cart();
        mockCart.setId(111L);
        when(cartRepository.findByUserId(userId)).thenReturn(Optional.of(mockCart));
        when(productRepository.findById(ProductId)).thenReturn(Optional.of(mockProduct));
        cartService.addToCart(userId, ProductId, requestQuantity);
        verify(cartRepository, never()).save(any());
        verify(cartItemRepository, times(1)).save(any());

    }
    @Test
    @DisplayName("Thêm sản phẩm khi đã hết hàng tồn kho = 0")
    public void TestAddToCart_ThrowException_WhenStockQuantityIsZero(){
        Long userId = 1L;
        Long productId = 1L;
        int requestQuantity = 1;
        Product mockProduct = new Product();
        mockProduct.setId(productId);
        mockProduct.setStockQuantity(0);
        when(productRepository.findById(productId)).thenReturn(Optional.of(mockProduct));
        RuntimeException exception = assertThrows(RuntimeException.class,() ->{
            cartService.addToCart(userId, productId, requestQuantity);
        });
        assertEquals("Hết hàng", exception.getMessage());
    }
    @Test
    @DisplayName("Xóa Sản Phẩm Khỏi Giỏ Hàng")
    public void TestRemoveFromCart_Success(){
        Long userId = 1L;
        Long productId = 1L;
        Long cartItemId = 1L;
        Product mockProduct = new Product();
        // gia lap gio hang
        Cart mockCart = new Cart(); 
        mockCart.setId(1L);
        mockProduct.setId(productId);
        // gia lap chi tiet gio hang
        CartItem mockCartItem = new CartItem();
        mockCartItem.setProductId(mockProduct);
        mockCartItem.setId(cartItemId);       
        // mockCart.setId(userId);
        when(cartRepository.findByUserId(userId)).thenReturn(Optional.of(mockCart));
        when(cartItemRepository.findByCartIdAndProductId(mockCart.getId(), productId)).thenReturn(Optional.of(mockCartItem));
        
        cartService.removeFromCart(userId, productId);
        verify(cartItemRepository, times(1)).delete(mockCartItem);

        
    }
    @Test
    @DisplayName("Cập Nhật Số Lượng Sản Phẩm Trong Giỏ Hàng")
    public void TestUpdateCartItemQuantity_Success(){
        Long UserId = 1L;
        Long ProductId = 1L;
        Long CartItemId = 1L;
        Long CartId = 1L;
        int newQlty = 4;
        // gia lap san pham
        Product mockProduct = new Product();
        mockProduct.setId(ProductId);
        mockProduct.setStockQuantity(10);
        // gia lap gio hang
        Cart mockCart = new Cart();
        mockCart.setId(CartId);
        // gia lap chi tiet gio hang
        CartItem mockCartItem = new CartItem();
        mockCartItem.setId(CartItemId);
        mockCartItem.setProductId(mockProduct);
        
        when(cartRepository.findByUserId(UserId)).thenReturn(Optional.of(mockCart));
        when(cartItemRepository.findByCartIdAndProductId(mockCart.getId(),ProductId)).thenReturn(Optional.of(mockCartItem));
       
        cartService.updateCartItemQuantity(UserId, ProductId, newQlty);
        assertEquals(newQlty, mockCartItem.getQuantity());
        verify(cartItemRepository, times(1)).save(mockCartItem);


    }
}
