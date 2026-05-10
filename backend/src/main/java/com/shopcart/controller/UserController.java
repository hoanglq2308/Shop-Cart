package com.shopcart.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.shopcart.dto.AuthResponse;
import com.shopcart.dto.LoginRequest;
import com.shopcart.dto.RegisterRequest;
import com.shopcart.service.UserService;

@RestController
@RequestMapping("/api/users")
public class UserController {
    @Autowired 
    private UserService userService;
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register (@RequestBody RegisterRequest request){
        AuthResponse response = userService.register(request);
        if(response.isSuccess()){
            return ResponseEntity.ok(response);
        }else{
        return ResponseEntity.badRequest().body(response);
        }
    }
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        AuthResponse response = userService.login(request);
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }
    

    
}
