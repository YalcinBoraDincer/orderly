package com.bora.orderly.dto.response;

import com.bora.orderly.enums.TableStatus;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TableResponse {
    private Long id;
    private String tableNumber;
    private Integer capacity;
    private TableStatus status;
    private String location;
    private String qrCodeUrl;
}
