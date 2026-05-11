package com.shopcart.config;

import java.math.BigDecimal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.shopcart.entity.Coupon;
import com.shopcart.entity.Product;
import com.shopcart.repository.CouponRepository;
import com.shopcart.repository.ProductRepository;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CouponRepository couponRepository;

    @Override
    public void run(String... args) throws Exception {
        if (productRepository.count() == 0) {
            Product p1 = new Product();
            p1.setName("Màn hình ASUS 24 inch");
            p1.setImageUrl("http://localhost:8081/product/manhinh.webp");
            p1.setPrice(new BigDecimal("2500000.00"));
            p1.setStockQuantity(50);
            p1.setStatus("ACTIVE");
            productRepository.save(p1);

            Product p2 = new Product();
            p2.setName("Bàn phím cơ");
            p2.setImageUrl("http://localhost:8081/product/phimco.webp");
            p2.setPrice(new BigDecimal("1500000.00"));
            p2.setStockQuantity(1);
            p2.setStatus("ACTIVE");
            productRepository.save(p2);

            Product p3 = new Product();
            p3.setName("Chuột Gaming");
            p3.setImageUrl("http://localhost:8081/product/chuot.webp");
            p3.setPrice(new BigDecimal("500000.00"));
            p3.setStockQuantity(0);
            p3.setStatus("ACTIVE");
            productRepository.save(p3);

            Product p4 = new Product();
            p4.setName("Tai nghe cũ");
            p4.setImageUrl("http://localhost:8081/product/tainghe.png");
            p4.setPrice(new BigDecimal("300000.00"));
            p4.setStockQuantity(10);
            p4.setStatus("INACTIVE");
            productRepository.save(p4);
            
            System.out.println("===== DATABASE SEEDED WITH SAMPLE PRODUCTS =====");
        }

        if (couponRepository.count() == 0) {
            Coupon c1 = new Coupon();
            c1.setCode("WELCOME50");
            c1.setDiscountType("FIXED_AMOUNT");
            c1.setDiscountValue(new BigDecimal("50000.00"));
            c1.setMinOrderValue(new BigDecimal("0.00"));
            c1.setUsageLimit(100);
            c1.setUsedCount(0);
            c1.setExpiryDate("2026-12-31 23:59:59");
            c1.setIsActive(true);
            couponRepository.save(c1);

            Coupon c2 = new Coupon();
            c2.setCode("GIAM10");
            c2.setDiscountType("PERCENTAGE");
            c2.setDiscountValue(new BigDecimal("10.00"));
            c2.setMinOrderValue(new BigDecimal("0.00"));
            c2.setUsageLimit(100);
            c2.setUsedCount(5);
            c2.setExpiryDate("2026-12-31 23:59:59");
            c2.setIsActive(true);
            couponRepository.save(c2);

            Coupon c3 = new Coupon();
            c3.setCode("TRU50K");
            c3.setDiscountType("FIXED_AMOUNT");
            c3.setDiscountValue(new BigDecimal("50000.00"));
            c3.setMinOrderValue(new BigDecimal("2000000.00"));
            c3.setUsageLimit(50);
            c3.setUsedCount(10);
            c3.setExpiryDate("2026-12-31 23:59:59");
            c3.setIsActive(true);
            couponRepository.save(c3);

            Coupon c4 = new Coupon();
            c4.setCode("HETHAN");
            c4.setDiscountType("PERCENTAGE");
            c4.setDiscountValue(new BigDecimal("20.00"));
            c4.setMinOrderValue(new BigDecimal("0.00"));
            c4.setUsageLimit(100);
            c4.setUsedCount(0);
            c4.setExpiryDate("2023-01-01 00:00:00");
            c4.setIsActive(true);
            couponRepository.save(c4);

            Coupon c5 = new Coupon();
            c5.setCode("HETLUOT");
            c5.setDiscountType("FIXED_AMOUNT");
            c5.setDiscountValue(new BigDecimal("100000.00"));
            c5.setMinOrderValue(new BigDecimal("0.00"));
            c5.setUsageLimit(10);
            c5.setUsedCount(10);
            c5.setExpiryDate("2026-12-31 23:59:59");
            c5.setIsActive(true);
            couponRepository.save(c5);

            System.out.println("===== DATABASE SEEDED WITH SAMPLE COUPONS =====");
        }
    }
}