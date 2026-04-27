package com.bora.orderly.controller;

import com.bora.orderly.dto.request.TableRequest;
import com.bora.orderly.dto.response.TableResponse;
import com.bora.orderly.enums.TableStatus;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@Tag(name = "Masa Yönetimi", description = "Restoran masalarını yönetmek için API")
public interface ITableController {

    @Operation(summary = "Tüm masaları listele", description = "Durum bilgisiyle birlikte tüm masaları getirir")
    @ApiResponse(responseCode = "200", description = "Başarılı")
    ResponseEntity<List<TableResponse>> getAllTables();

    @Operation(summary = "Masa detayı")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Başarılı"),
            @ApiResponse(responseCode = "404", description = "Masa bulunamadı")
    })
    ResponseEntity<TableResponse> getTableById(@PathVariable Long id);

    @Operation(summary = "Yeni masa ekle")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Oluşturuldu"),
            @ApiResponse(responseCode = "400", description = "Masa numarası zaten kullanımda")
    })
    ResponseEntity<TableResponse> createTable(@Valid @RequestBody TableRequest request);

    @Operation(summary = "Masa durumunu güncelle",
            description = "AVAILABLE, OCCUPIED veya RESERVED yapılabilir")
    @ApiResponse(responseCode = "200", description = "Güncellendi")
    ResponseEntity<TableResponse> updateTableStatus(@PathVariable Long id,
                                                    @RequestParam TableStatus status);

    @Operation(summary = "Masa QR kodu indir",
            description = "Masanın QR kodunu PNG olarak döner — müşteri tarar, menüyü görür")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "QR kod PNG"),
            @ApiResponse(responseCode = "404", description = "Masa bulunamadı")
    })
    ResponseEntity<byte[]> getTableQrCode(@PathVariable Long id) throws Exception;
}
