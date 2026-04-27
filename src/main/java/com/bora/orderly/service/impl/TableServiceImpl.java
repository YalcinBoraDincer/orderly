package com.bora.orderly.service.impl;

import com.bora.orderly.dto.request.TableRequest;
import com.bora.orderly.dto.response.TableResponse;
import com.bora.orderly.entity.Category;
import com.bora.orderly.entity.RestaurantTable;
import com.bora.orderly.enums.TableStatus;
import com.bora.orderly.exception.BusinessException;
import com.bora.orderly.exception.ResourceNotFoundException;
import com.bora.orderly.repository.TableRepository;
import com.bora.orderly.service.IQrCodeService;
import com.bora.orderly.service.ITableService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
public class TableServiceImpl implements ITableService {

    private final TableRepository tableRepository;
    private final IQrCodeService qrCodeService;


    @Override
    public List<TableResponse> getAllTables() {
        return tableRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();

    }

    @Override
    public TableResponse getTableById(Long id) {
        RestaurantTable table = tableRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Masa", id));

        return toResponse(table);
    }

    @Override
    public TableResponse createTable(TableRequest request) {
        if (tableRepository.findByTableNumber(request.getTableNumber()).isPresent()) {
            throw new BusinessException("Bu masa zaten mevcut"+request.getTableNumber());
        }
        RestaurantTable table=RestaurantTable.builder()
                .tableNumber(request.getTableNumber())
                .capacity(request.getCapacity())
                .status(TableStatus.AVAILABLE)
                .location(request.getLocation())
                .build();

        return toResponse(tableRepository.save(table));
    }

    @Override
    public TableResponse updateTableStatus(Long id, TableStatus status) {
        RestaurantTable table = tableRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Masa", id));
        table.setStatus(status);
        tableRepository.save(table);

        return toResponse(table);
    }

    @Override
    public byte[] generateQrCode(Long id) throws Exception {
        RestaurantTable table = tableRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Masa", id));
        // QR kod içeriği — müşteri okuyunca bu URL'e gidecek
        String qrContent = "http://localhost:8080/api/menu?table=" + table.getTableNumber();
        // QR kodu üret (300x300 px)
        byte[] qrCode = qrCodeService.generateQrCode(qrContent, 300, 300);
        // URL'i tabloya kaydet (opsiyonel — frontend için)
        table.setQrCodeUrl("/api/tables/" + id + "/qr");
        tableRepository.save(table);
        return qrCode;
    }


    private TableResponse toResponse(RestaurantTable restaurantTable) {
        return TableResponse.builder()
                .id(restaurantTable.getId())
                .tableNumber(restaurantTable.getTableNumber())
                .capacity(restaurantTable.getCapacity())
                .status(restaurantTable.getStatus())
                .qrCodeUrl(restaurantTable.getQrCodeUrl()).
                location(restaurantTable.getLocation())
                .build();

    }
}
