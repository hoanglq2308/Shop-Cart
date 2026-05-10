package com.shopcart.controller;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.shopcart.dto.OrderCreateRequest;
import com.shopcart.dto.OrderCreateResponse;
import com.shopcart.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;

@RestController
@CrossOrigin(origins = "*", maxAge = 3600)
@RequestMapping("/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @PostMapping
    public ResponseEntity<OrderCreateResponse> createOrder(@RequestBody OrderCreateRequest request) {
        if (request == null || request.getCustomer() == null || request.getItems() == null || request.getItems().isEmpty()) {
            return ResponseEntity.badRequest().body(OrderCreateResponse.builder()
                .success(false)
                .message("Dữ liệu đặt hàng không hợp lệ")
                .build());
        }

        try {
            String orderId = orderService.processOrder(1L, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(OrderCreateResponse.builder()
                .success(true)
                .message("Đặt hàng thành công")
                .orderId(orderId)
                .total(request.getTotal())
                .payment("COD")
                .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(OrderCreateResponse.builder()
                .success(false)
                .message(e.getMessage())
                .build());
        }
    }
}