package com.shopcart.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.shopcart.entity.CartItem;
@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    // Custom query methods if needed
    
}
