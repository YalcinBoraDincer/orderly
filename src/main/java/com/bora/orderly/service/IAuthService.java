package com.bora.orderly.service;

import com.bora.orderly.dto.request.LoginRequest;
import com.bora.orderly.dto.request.RegisterRequest;
import com.bora.orderly.dto.response.AuthResponse;

public interface IAuthService {
    AuthResponse login(LoginRequest request);
    AuthResponse register(RegisterRequest request);
    void logout(Long userId);
    AuthResponse refresh(String refreshToken);

}
