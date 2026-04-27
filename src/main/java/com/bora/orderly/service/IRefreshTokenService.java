package com.bora.orderly.service;

import com.bora.orderly.dto.response.AuthResponse;
import com.bora.orderly.entity.RefreshToken;
import com.bora.orderly.entity.User;

public interface IRefreshTokenService {
    RefreshToken createRefreshToken(User user);
    AuthResponse refreshAccessToken(String refreshToken);
    void revokeAllUserTokens(Long userId);
}
