package com.shopcart.entity;

import java.math.BigDecimal;

import jakarta.persistence.*;

    @Entity
    @Table(name = "products")

    public class Product {
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;
        @OneToMany(mappedBy = "product")
        private java.util.List<OrderItem> orderItems;
        @OneToMany(mappedBy = "product")
        private java.util.List<CartItem> cartItems;
        @Column(name = "name", nullable = false)
        private String name;
        @Column(name = "stock_quantity", nullable = false)
        private int stockQuantity;
        @Column(name = "price", nullable = false, precision = 10, scale = 2)
        private BigDecimal price;
        @Column(length = 20)
        private String status = "active";
}
