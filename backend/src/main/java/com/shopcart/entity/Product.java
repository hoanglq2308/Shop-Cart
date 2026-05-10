package com.shopcart.entity;

import java.math.BigDecimal;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

    @Entity
    @Table(name = "products")
    @Getter
    @Setter
    public class Product {
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;
        
        
        @Column(name = "name", nullable = false)
        private String name;
        @Column(name = "image_url", length = 512)
        private String imageUrl;
        @Column(name = "stock_quantity", nullable = false)
        private int stockQuantity;
        @Column(name = "price", nullable = false, precision = 10, scale = 2)
        private BigDecimal price;
        @Column(length = 20)
        private String status = "active";
}
