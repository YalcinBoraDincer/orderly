package com.bora.orderly.service.impl;

import com.bora.orderly.dto.request.TableRequest;
import com.bora.orderly.dto.response.TableResponse;
import com.bora.orderly.entity.RestaurantTable;
import com.bora.orderly.enums.TableStatus;
import com.bora.orderly.exception.BusinessException;
import com.bora.orderly.repository.OrderRepository;
import com.bora.orderly.repository.TableRepository;
import com.bora.orderly.service.IQrCodeService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class TableServiceImplTest {

    @Mock
    private TableRepository tableRepository;
    @Mock
    private IQrCodeService qrCodeService;
    @Mock
    private OrderRepository orderRepository;

    @InjectMocks
    private TableServiceImpl tableService;

    private RestaurantTable testTable;
    private TableRequest validRequest;

    @BeforeEach
    void setUp() {
        testTable = RestaurantTable.builder()
                .id(1L)
                .tableNumber("12")
                .capacity(4)
                .status(TableStatus.AVAILABLE)
                .location("INDOOR")
                .build();

        validRequest = TableRequest.builder()
                .tableNumber("12")
                .capacity(4)
                .location("INDOOR")
                .build();
    }

    @Test
    @DisplayName("Benzersiz masa numarasi ile masa basariyla olusturulmali")
    void createTable_ShouldSuccess_WhenTableNumberIsUnique() {
        when(tableRepository.findByTableNumber("12")).thenReturn(Optional.empty());
        when(tableRepository.save(any(RestaurantTable.class))).thenReturn(testTable);

        TableResponse response = tableService.createTable(validRequest);

        assertNotNull(response);
        assertEquals("12", response.getTableNumber());
        assertEquals(4, response.getCapacity());
        verify(tableRepository, times(1)).save(any(RestaurantTable.class));
    }

    @Test
    @DisplayName("Ayni numarada masa zaten varsa hata fırlatmalı")
    void createTable_ShouldThrowException_WhenTableNumberAlreadyExists() {
        when(tableRepository.findByTableNumber("12")).thenReturn(Optional.of(testTable));

        BusinessException exception = assertThrows(BusinessException.class, () -> {
            tableService.createTable(validRequest);
        });

        assertTrue(exception.getMessage().contains("Bu masa zaten mevcut"));
        verify(tableRepository, never()).save(any(RestaurantTable.class));
    }

    @Test
    @DisplayName("Dolu olan masa silinmek istendiginde hata firlatmali")
    void deleteTable_ShouldThrowException_WhenTableIsOccupied() {
        testTable.setStatus(TableStatus.OCCUPIED);
        when(tableRepository.findById(1L)).thenReturn(Optional.of(testTable));

        BusinessException exception = assertThrows(BusinessException.class, () -> {
            tableService.deleteTable(1L);
        });

        assertEquals("Üzerinde aktif sipariş olan masa silinemez!", exception.getMessage());
        verify(tableRepository, never()).delete(any(RestaurantTable.class));
    }

    @Test
    @DisplayName("Masa icin QR kod basariyla uretilmeli ve veritabanina kaydedilmeli")
    void generateQrCode_ShouldReturnBytesAndSaveUrl() throws Exception {
        byte[] mockQrBytes = new byte[] { 1, 2, 3 };
        when(tableRepository.findById(1L)).thenReturn(Optional.of(testTable));
        when(qrCodeService.generateQrCode(any(String.class), eq(300), eq(300))).thenReturn(mockQrBytes);

        byte[] result = tableService.generateQrCode(1L);

        assertNotNull(result);
        assertArrayEquals(mockQrBytes, result);
        assertEquals("/api/tables/1/qr", testTable.getQrCodeUrl());
        verify(tableRepository, times(1)).save(testTable);
    }
}
