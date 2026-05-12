package com.bora.orderly.dto.response;

import com.bora.orderly.enums.ReservationStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ReservationResponse {
    private Long id;
    private String customerName;
    private String customerPhone;
    private LocalDateTime reservationTime;
    private Integer numberOfGuests;
    private Long tableId;
    private String tableNumber;
    private ReservationStatus status;
    private String specialNotes;
}
