package com.shopcart.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.shopcart.entity.CartItem;
@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    Optional <CartItem> findByCartIdAndProductId(Long cartId, Long productId);
    
}

