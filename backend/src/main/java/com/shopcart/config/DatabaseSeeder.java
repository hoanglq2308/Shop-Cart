package com.shopcart.config;

import java.math.BigDecimal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.shopcart.entity.Product;
import com.shopcart.repository.ProductRepository;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    @Autowired
    private ProductRepository productRepository;

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
    }
}