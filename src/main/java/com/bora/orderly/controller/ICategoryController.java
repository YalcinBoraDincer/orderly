package com.bora.orderly.controller;

import com.bora.orderly.dto.request.CategoryRequest;
import com.bora.orderly.dto.response.CategoryResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@Tag(name = "Kategori Yönetimi", description = "Menü kategorilerini yönetmek için API")
public interface ICategoryController {

    @Operation(summary = "Tüm kategorileri listele", description = "Aktif kategorileri display order'a göre getirir")
    @ApiResponse(responseCode = "200", description = "Başarılı")
    ResponseEntity<List<CategoryResponse>> getAllCategories();

    @Operation(summary = "Kategori detayı", description = "ID'ye göre kategori getirir")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Başarılı"),
            @ApiResponse(responseCode = "404", description = "Kategori bulunamadı")
    })
    ResponseEntity<CategoryResponse> getCategoryById(@PathVariable Long id);

    @Operation(summary = "Yeni kategori oluştur")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Oluşturuldu"),
            @ApiResponse(responseCode = "422", description = "Validasyon hatası")
    })
    ResponseEntity<CategoryResponse> createCategory(@Valid @RequestBody CategoryRequest request);

    @Operation(summary = "Kategori güncelle")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Güncellendi"),
            @ApiResponse(responseCode = "404", description = "Kategori bulunamadı")
    })
    ResponseEntity<CategoryResponse> updateCategory(@PathVariable Long id, @Valid @RequestBody CategoryRequest request);

    @Operation(summary = "Kategoriyi pasife al (soft delete)")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Silindi"),
            @ApiResponse(responseCode = "404", description = "Kategori bulunamadı")
    })
    ResponseEntity<Void> deleteCategory(@PathVariable Long id);
}
