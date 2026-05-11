package com.shopcart.controller;

import com.shopcart.dto.QuantityUpdateRequest;
import com.shopcart.dto.CartItemRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import tools.jackson.databind.ObjectMapper;

@SpringBootTest
@AutoConfigureMockMvc
public class CartSecurityTest {
    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;

    /**
     * Test Case 1: IDOR (Insecure Direct Object Reference)
     * Mô phỏng: Kẻ tấn công truy cập đổi số lượng Item trong giỏ hàng (cartItemId =
     * 2)
     * của người khác mà không có bất kỳ chứng thực nào (Authorization là null hoặc
     * user ảo).
     * BẢO MẬT ĐÚNG: Phải trả về 403 Forbidden hoặc 401 Unauthorized.
     * HIỆN TẠI: Trả về thành công 200 OK (Ứng dụng bị IDOR).
     */

    @Test
    public void TestIDOL_UpdateOtherUserCartIterm() throws Exception {
        QuantityUpdateRequest request = new QuantityUpdateRequest();
        request.setQuantity(5);
        mockMvc.perform(put("/api/cart/2/quantity")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    /**
     * Test Case 2: Kiểm tra phân quyền truy cập API / Thiếu CSRF
     * Mô phỏng: Gửi Fake Request POST từ site độc hại (Attacker) đến thêm sản phẩm
     * vào giỏ.
     * BẢO MẬT ĐÚNG: Yêu cầu trạng thái 401 hoặc cần token CSRF thì bị chặn báo 403.
     */
    @Test
    public void TEST_CSRF_AddToCartWithOutToken() throws Exception {
        CartItemRequest request = new CartItemRequest();
        request.setProductId("001");
        request.setQuantity(1);
        mockMvc.perform(post("/api/cart/add")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());

    }

}
