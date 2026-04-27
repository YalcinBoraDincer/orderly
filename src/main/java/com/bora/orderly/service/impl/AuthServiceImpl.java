package com.bora.orderly.service.impl;

import com.bora.orderly.config.JwtUtil;
import com.bora.orderly.dto.request.LoginRequest;
import com.bora.orderly.dto.request.RegisterRequest;
import com.bora.orderly.dto.response.AuthResponse;
import com.bora.orderly.entity.RefreshToken;
import com.bora.orderly.entity.User;
import com.bora.orderly.exception.BusinessException;
import com.bora.orderly.repository.UserRepository;
import com.bora.orderly.service.IAuthService;
import com.bora.orderly.service.IRefreshTokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements IAuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final IRefreshTokenService refreshTokenService;

    @Value("${jwt.expiration}")
    private Long accessExpiration;



    @Override
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );
        User user = userRepository.findByUsername(request.getUsername()).orElseThrow();
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());
        String accessToken = jwtUtil.generateToken(userDetails);
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user);
        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken.getToken())
                .username(user.getUsername())
                .role(user.getRole().name())
                .expiresIn(accessExpiration)
                .build();
    }
    @Override
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BusinessException("Bu kullanıcı adı zaten kullanımda: " + request.getUsername());
        }
        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .role(request.getRole())
                .active(true)
                .build();
        user = userRepository.save(user);
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());
        String accessToken = jwtUtil.generateToken(userDetails);
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user);
        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken.getToken())
                .username(user.getUsername())
                .role(user.getRole().name())
                .expiresIn(accessExpiration)
                .build();
    }

    @Override
    public void logout(Long userId) {
        refreshTokenService.revokeAllUserTokens(userId);
    }
    @Override
    public AuthResponse refresh(String refreshToken) {
        return refreshTokenService.refreshAccessToken(refreshToken);
    }



}
