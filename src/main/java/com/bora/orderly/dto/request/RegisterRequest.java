package com.bora.orderly.dto.request;

import com.bora.orderly.enums.UserRole;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank(message = "Username boş olamaz")
    private String username;

    @NotBlank(message = "Password boş olamaz")
    private String password;

    @NotBlank(message = "Ad soyad boş olamaz")
    private String fullName;

    @NotNull(message = "Rol boş olamaz")
    private UserRole role;
}
