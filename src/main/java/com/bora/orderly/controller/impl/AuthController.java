package com.bora.orderly.controller.impl;

import com.bora.orderly.controller.IAuthController;
import com.bora.orderly.dto.request.LoginRequest;
import com.bora.orderly.dto.request.RefreshTokenRequest;
import com.bora.orderly.dto.request.RegisterRequest;
import com.bora.orderly.dto.response.AuthResponse;
import com.bora.orderly.service.IAuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController implements IAuthController {

    private final IAuthService authService;

    @PostMapping("/login")
    @Override
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/register")
    @Override
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }
    @PostMapping("/refresh")
    @Override
    public ResponseEntity<AuthResponse> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        return ResponseEntity.ok(authService.refresh(request.getRefreshToken()));
    }

    @PostMapping("/logout")
    @Override
    public ResponseEntity<Void> logout(@RequestParam Long userId) {
        authService.logout(userId);
        return ResponseEntity.noContent().build();
    }

}
