package com.shopcart.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartItemRequest {
    // Lưu ý: Đề bài của giảng viên dùng "P001" nên kiểu dữ liệu là String. 
    // Nếu Database thực tế của bạn dùng ID là Long, hãy đổi lại thành Long nhé!
    private String productId; 
    private int quantity;
}