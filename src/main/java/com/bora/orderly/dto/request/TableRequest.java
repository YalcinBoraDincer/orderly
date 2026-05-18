package com.bora.orderly.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TableRequest {

    @NotBlank(message = "Masa numarası boş olamaz")
    private String tableNumber;

    @NotNull(message = "Kapasite boş olamaz")
    @Min(value = 1, message = "Kapasite en az 1 olmalı")
    private Integer capacity;

    private String location; // INDOOR, OUTDOOR, VIP
}
