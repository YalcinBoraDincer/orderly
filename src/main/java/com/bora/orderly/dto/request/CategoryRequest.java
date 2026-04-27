package com.bora.orderly.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CategoryRequest {

    @NotBlank(message = "Kategori adı boş olamaz")
    private String name;

    private String description;
    private Integer displayOrder;
}
