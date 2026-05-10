package com.shopcart.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import com.shopcart.dto.AuthResponse;
import com.shopcart.dto.LoginRequest;
import com.shopcart.dto.RegisterRequest;
import com.shopcart.service.UserService;

import tools.jackson.databind.ObjectMapper;
@WebMvcTest(UserController.class)
@DisplayName("UserController Mock Test")
public class UserControllerMockTest {
    @Autowired
    MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;
    @MockitoBean
    private UserService userService;

    @Test
    @DisplayName("Register User - Success")
    public void testRegisterSuccess() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setName("Test User");
        request.setEmail("test@gmail.com");
        request.setPassword("123456");

        AuthResponse response = AuthResponse.builder()
                .success(true)
                .message("Đăng ký thành công")
                .name("Test User")
                .email("test@gmail.com")
                .build();

        when(userService.register(any(RegisterRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/users/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Đăng ký thành công"))
                .andExpect(jsonPath("$.email").value("test@gmail.com"));
    }

    @Test
    @DisplayName("Login User - Success")
    public void testLoginSuccess() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setEmail("test@gmail.com");
        request.setPassword("123456");

        AuthResponse response = AuthResponse.builder()
                .success(true)
                .message("Đăng nhập thành công")
                .name("Test User")
                .email("test@gmail.com")
                .build();

        when(userService.login(any(LoginRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/users/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Đăng nhập thành công"))
                .andExpect(jsonPath("$.name").value("Test User"));
    }
    
}
