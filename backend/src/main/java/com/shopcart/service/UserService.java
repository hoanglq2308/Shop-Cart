package com.shopcart.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.shopcart.dto.AuthResponse;
import com.shopcart.dto.LoginRequest;
import com.shopcart.dto.RegisterRequest;
import com.shopcart.entity.User;
import com.shopcart.repository.UserRepository;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;
    public AuthResponse register(RegisterRequest request) {
        if(userRepository.findByEmail(request.getEmail()).isPresent()){
            return AuthResponse.builder()
                .success(false)
                .message("Email đã tồn tại")
                .build();
        }
        User user = new User();
        user.setFullName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword());
        userRepository.save(user);

        return AuthResponse.builder()
            .success(true)
            .message("Đăng ký thành công")
            .name(request.getName())
            .email(request.getEmail())
            .build();
    }
    public AuthResponse login(LoginRequest request){
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        if(userOpt.isEmpty() || !userOpt.get().getPassword().equals(request.getPassword())){
            return AuthResponse.builder()
            .success(false)
            .message("Email hoặc mật khẩu không đúng")
            .build();
        }
        User user = userOpt.get();
        return AuthResponse.builder()
            .success(true)
            .message("Đăng nhập thành công")
            .name(user.getFullName())
            .email(user.getEmail())
            .build();

    }

}