package com.bora.orderly.controller;

import com.bora.orderly.dto.request.LoginRequest;
import com.bora.orderly.dto.request.RefreshTokenRequest;
import com.bora.orderly.dto.request.RegisterRequest;
import com.bora.orderly.dto.response.AuthResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

@Tag(name = "Kimlik Doğrulama", description = "Login ve kayıt işlemleri")
public interface IAuthController {

    @Operation(summary = "Giriş yap", description = "Kullanıcı adı ve şifre ile JWT token alır")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Giriş başarılı, token döndü"),
            @ApiResponse(responseCode = "401", description = "Hatalı kullanıcı adı veya şifre")
    })
    ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request);

    @Operation(summary = "Kayıt ol", description = "Yeni kullanıcı oluşturur ve token döndürür")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Kayıt başarılı"),
            @ApiResponse(responseCode = "400", description = "Kullanıcı adı zaten kullanımda")
    })
    ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request);

    @Operation(summary = "Token yenile",
            description = "Refresh token ile yeni access token alır (token rotasyonu)")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Yeni token üretildi"),
            @ApiResponse(responseCode = "400", description = "Geçersiz veya süresi dolmuş refresh token")
    })
    ResponseEntity<AuthResponse> refresh(@Valid @RequestBody RefreshTokenRequest request);

    @Operation(summary = "Çıkış yap", description = "Kullanıcının tüm refresh token'larını iptal eder")
    @ApiResponse(responseCode = "204", description = "Çıkış başarılı")
    ResponseEntity<Void> logout(@RequestParam Long userId);

}
