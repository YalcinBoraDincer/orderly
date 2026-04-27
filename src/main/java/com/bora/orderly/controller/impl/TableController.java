package com.bora.orderly.controller.impl;

import com.bora.orderly.controller.ITableController;
import com.bora.orderly.dto.request.TableRequest;
import com.bora.orderly.dto.response.TableResponse;
import com.bora.orderly.enums.TableStatus;
import com.bora.orderly.service.ITableService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/tables")
@RequiredArgsConstructor
public class TableController implements ITableController {

    private final ITableService tableService;

    @GetMapping
    @Override
    public ResponseEntity<List<TableResponse>> getAllTables() {
        return ResponseEntity.ok(tableService.getAllTables());
    }

    @GetMapping("/{id}")
    @Override
    public ResponseEntity<TableResponse> getTableById(@PathVariable Long id) {
        return ResponseEntity.ok(tableService.getTableById(id));
    }

    @PostMapping
    @Override
    public ResponseEntity<TableResponse> createTable(@Valid @RequestBody TableRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(tableService.createTable(request));
    }

    @PatchMapping("/{id}/status")
    @Override
    public ResponseEntity<TableResponse> updateTableStatus(@PathVariable Long id,
                                                           @RequestParam TableStatus status) {
        return ResponseEntity.ok(tableService.updateTableStatus(id, status));
    }

    @GetMapping("/{id}/qr")
    @Override
    public ResponseEntity<byte[]> getTableQrCode(@PathVariable Long id) throws Exception {
        byte[] qrCode = tableService.generateQrCode(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=table-" + id + "-qr.png")
                .contentType(MediaType.IMAGE_PNG)
                .body(qrCode);
    }
}
