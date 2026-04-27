package com.bora.orderly.service.impl;

import com.bora.orderly.config.JwtUtil;
import com.bora.orderly.dto.response.AuthResponse;
import com.bora.orderly.entity.RefreshToken;
import com.bora.orderly.entity.User;
import com.bora.orderly.exception.BusinessException;
import com.bora.orderly.repository.RefreshTokenRepository;
import com.bora.orderly.repository.UserRepository;
import com.bora.orderly.service.IRefreshTokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class RefreshTokenServiceImpl implements IRefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;

    @Value("${jwt.refresh-expiration}")
    private Long refreshExpiration;

    @Value("${jwt.expiration}")
    private Long accessExpiration;

    @Override
    public RefreshToken createRefreshToken(User user) {
        // Kullanıcının eski token'larını iptal et (tek aktif token)
        refreshTokenRepository.revokeAllByUserId(user.getId());

        RefreshToken refreshToken = RefreshToken.builder()
                .token(UUID.randomUUID().toString())  // benzersiz UUID
                .user(user)
                .expiresAt(LocalDateTime.now().plusSeconds(refreshExpiration / 1000))
                .revoked(false)
                .build();

        return refreshTokenRepository.save(refreshToken);
    }

    @Override
    public AuthResponse refreshAccessToken(String token) {
        // 1. Token DB'de var mı?
        RefreshToken refreshToken = refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new BusinessException("Geçersiz refresh token"));

        // 2. İptal edilmiş mi?
        if (refreshToken.getRevoked()) {
            throw new BusinessException("Bu refresh token iptal edilmiş");
        }

        // 3. Süresi geçmiş mi?
        if (refreshToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            refreshToken.setRevoked(true);
            refreshTokenRepository.save(refreshToken);
            throw new BusinessException("Refresh token süresi dolmuş, lütfen tekrar giriş yapın");
        }

        // 4. Kullanıcıyı al
        User user = refreshToken.getUser();
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());

        // 5. Yeni access token üret
        String newAccessToken = jwtUtil.generateToken(userDetails);

        // 6. Token rotasyonu — eski iptal et, yeni oluştur
        refreshToken.setRevoked(true);
        refreshTokenRepository.save(refreshToken);

        RefreshToken newRefreshToken = createRefreshToken(user);

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken.getToken())
                .username(user.getUsername())
                .role(user.getRole().name())
                .expiresIn(accessExpiration)
                .build();
    }

    @Override
    public void revokeAllUserTokens(Long userId) {
        refreshTokenRepository.revokeAllByUserId(userId);
    }
}
