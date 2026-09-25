package com.liveeuy.catalog_service.controller;

import com.liveeuy.catalog_service.dto.ApiResponse;
import com.liveeuy.catalog_service.dto.request.MediaRequestDTO;
import com.liveeuy.catalog_service.dto.response.MediaResponseDTO;
import com.liveeuy.catalog_service.service.MediaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;

import java.util.List;

@RestController
@RequestMapping("/media")
@RequiredArgsConstructor
public class MediaController {

    private final MediaService mediaService;

    // @GetMapping("/featured")
    // public ResponseEntity<ApiResponse<MediaResponseDTO>> getFeaturedMedia() {
    //     MediaResponseDTO featured = mediaService.getFeaturedMedia();
    //     if (featured == null) {
    //         return ResponseEntity.ok(ApiResponse.success(null, "Catalog Service is Online (no featured media yet)"));
    //     }
    //     return ResponseEntity.ok(ApiResponse.success(featured, "Featured media berhasil diambil"));
    // }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<MediaResponseDTO>>> getAllMedia(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String genre,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String sortBy,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Page<MediaResponseDTO> mediaPage = mediaService.getAllMedia(type, genre, search, sortBy, page, size);
        return ResponseEntity.ok(ApiResponse.success(mediaPage));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MediaResponseDTO>> getMediaById(@PathVariable String id) {
        MediaResponseDTO media = mediaService.getMediaById(id);
        return ResponseEntity.ok(ApiResponse.success(media));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<MediaResponseDTO>> createMedia(@Valid @RequestBody MediaRequestDTO requestDTO) {
        MediaResponseDTO createdMedia = mediaService.createMedia(requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(createdMedia, "Media berhasil ditambahkan"));
    }

    @PostMapping("/batch")
    public ResponseEntity<ApiResponse<List<MediaResponseDTO>>> getMediaByIds(@RequestBody List<String> ids) {
        List<MediaResponseDTO> mediaList = mediaService.getMediaByIds(ids);
        return ResponseEntity.ok(ApiResponse.success(mediaList));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<MediaResponseDTO>> updateMedia(
            @PathVariable String id,
            @Valid @RequestBody MediaRequestDTO requestDTO) {
        MediaResponseDTO updatedMedia = mediaService.updateMedia(id, requestDTO);
        return ResponseEntity.ok(ApiResponse.success(updatedMedia, "Media berhasil diperbarui"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteMedia(@PathVariable String id) {
        mediaService.deleteMedia(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Media berhasil dihapus"));
    }
}
