package com.shopcart.entity;

import java.math.BigDecimal;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "coupons")
@Getter
@Setter
public class Coupon {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @OneToMany(mappedBy = "coupon")
    private java.util.List<Order> orders;

    @Column(name = "code", nullable = false, unique = true)
    private String code;
    @Column(name = "discount_type", nullable = false, length = 20)
    private String discountType; // "PERCENTAGE" hoặc "FIXED_AMOUNT"
    @Column(name = "discount_value", nullable = false)
    private BigDecimal discountValue;
    @Column(name = "min_order_value", nullable = false)
    private BigDecimal minOrderValue = BigDecimal.ZERO;
    @Column(name = "usage_limit", nullable = false)
    private Integer usageLimit = 1;
    @Column(name = "used_count", nullable = false)
    private Integer usedCount = 0;
    @Column(name = "expiry_date", nullable = false)
    private String expiryDate;
    @Column(name = "is_active")
    private Boolean isActive = true;
}
