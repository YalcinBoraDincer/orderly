package com.bora.orderly.service.impl;

import com.bora.orderly.dto.request.ReservationRequest;
import com.bora.orderly.dto.response.ReservationResponse;
import com.bora.orderly.entity.Reservation;
import com.bora.orderly.entity.RestaurantTable;
import com.bora.orderly.enums.ReservationStatus;
import com.bora.orderly.enums.TableStatus;
import com.bora.orderly.repository.ReservationRepository;
import com.bora.orderly.repository.TableRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ReservationServiceTest {

    @Mock
    private ReservationRepository reservationRepository;

    @Mock
    private TableRepository tableRepository;

    @InjectMocks
    private ReservationService reservationService;

    private RestaurantTable testTable;
    private ReservationRequest validRequest;

    @BeforeEach
    void setUp() {

        testTable = RestaurantTable.builder()
                .id(1L)
                .tableNumber("101")
                .capacity(4)
                .status(TableStatus.AVAILABLE)
                .build();


        validRequest = ReservationRequest.builder()
                .tableId(1L)
                .customerName("Ahmet Yılmaz")
                .customerPhone("05555555555")
                .numberOfGuests(3)
                .reservationTime(LocalDateTime.now().plusDays(1))
                .status(ReservationStatus.CONFIRMED)
                .specialNotes("Pencere kenarı olsun.")
                .build();
    }

    @Test
    @DisplayName("Kapasite yeterli olduğunda rezervasyon başarıyla oluşturulmalı")
    void createReservation_ShouldSuccess_WhenCapacityIsEnough() {
        when(tableRepository.findById(1L)).thenReturn(Optional.of(testTable));
        
        Reservation mockSavedReservation = Reservation.builder()
                .id(100L)
                .customerName(validRequest.getCustomerName())
                .customerPhone(validRequest.getCustomerPhone())
                .numberOfGuests(validRequest.getNumberOfGuests())
                .reservationTime(validRequest.getReservationTime())
                .table(testTable)
                .status(ReservationStatus.CONFIRMED)
                .build();
        
        when(reservationRepository.save(any(Reservation.class))).thenReturn(mockSavedReservation);

        ReservationResponse response = reservationService.createReservation(validRequest);

        assertNotNull(response);
        assertEquals(100L, response.getId());
        assertEquals("Ahmet Yılmaz", response.getCustomerName());
        assertEquals(3, response.getNumberOfGuests());

        verify(reservationRepository, times(1)).save(any(Reservation.class));
    }

    @Test
    @DisplayName("Kişi sayısı masa kapasitesinden fazlaysa hata fırlatmalı")
    void createReservation_ShouldThrowException_WhenCapacityIsExceeded() {
        validRequest.setNumberOfGuests(6);
        when(tableRepository.findById(1L)).thenReturn(Optional.of(testTable));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            reservationService.createReservation(validRequest);
        });

        assertTrue(exception.getMessage().contains("Masa kapasitesi yetersiz"));
        
        verify(reservationRepository, never()).save(any(Reservation.class));
    }

    @Test
    @DisplayName("Masa doluysa bugün yapılan rezervasyon masa durumunu REZERVE yapmamalı")
    void createReservation_ShouldNotChangeTableStatus_WhenTableIsOccupied() {
        testTable.setStatus(TableStatus.OCCUPIED);
        validRequest.setReservationTime(LocalDateTime.now()); // Bugün için
        
        when(tableRepository.findById(1L)).thenReturn(Optional.of(testTable));
        
        Reservation mockSavedReservation = Reservation.builder()
                .id(100L)
                .customerName(validRequest.getCustomerName())
                .table(testTable)
                .status(ReservationStatus.CONFIRMED)
                .reservationTime(validRequest.getReservationTime())
                .build();
        
        when(reservationRepository.save(any(Reservation.class))).thenReturn(mockSavedReservation);

        reservationService.createReservation(validRequest);

        assertEquals(TableStatus.OCCUPIED, testTable.getStatus());
        
        verify(tableRepository, never()).save(testTable);
    }
}
