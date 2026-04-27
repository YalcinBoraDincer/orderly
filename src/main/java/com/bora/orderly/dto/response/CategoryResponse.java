package com.bora.orderly.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder

public class CategoryResponse {
    private Long id;
    private String name;
    private String description;
    private Integer displayOrder;
    private Boolean active;
}
