package com.bora.orderly.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {

    @NotBlank(message = "Username boş olamaz")
    private String username;

    @NotBlank(message = "Password boş olamaz")
    private String password;
}
