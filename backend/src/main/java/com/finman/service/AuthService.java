package com.finman.service;

import com.finman.dto.request.GoogleAuthRequest;
import com.finman.dto.request.LoginRequest;
import com.finman.dto.request.RegisterRequest;
import com.finman.dto.response.AuthResponse;
import com.finman.dto.response.UserResponse;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    AuthResponse googleLogin(GoogleAuthRequest request);
    UserResponse getCurrentUser(String email);
}
