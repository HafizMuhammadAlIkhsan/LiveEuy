package com.liveeuy.catalog_service.controller;

import com.liveeuy.catalog_service.dto.ApiResponse;
import com.liveeuy.catalog_service.dto.request.MediaRequestDTO;
import com.liveeuy.catalog_service.dto.response.MediaItemDTO;
import com.liveeuy.catalog_service.service.MediaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller untuk endpoint API Katalog Media.
 * Prinsip Clean Code: Controller harus TIPIS — hanya menerima request,
 * meneruskan ke Service, dan membungkus hasilnya. Tidak ada logika bisnis di sini.
 */
@RestController
@RequestMapping("/media")
@RequiredArgsConstructor
public class MediaController {

    private final MediaService mediaService;

    /**
     * GET /api/v1/media/featured
     * Digunakan Frontend untuk mengecek apakah backend hidup (health check).
     */
    @GetMapping("/featured")
    public ResponseEntity<ApiResponse<MediaItemDTO>> getFeaturedMedia() {
        MediaItemDTO featured = mediaService.getFeaturedMedia();
        if (featured == null) {
            return ResponseEntity.ok(ApiResponse.success(null, "Catalog Service is Online (no featured media yet)"));
        }
        return ResponseEntity.ok(ApiResponse.success(featured, "Featured media berhasil diambil"));
    }

    /**
     * GET /api/v1/media?type=movie&genre=Aksi&search=cyber&sortBy=rating
     * Mengambil semua media dengan filter opsional.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<MediaItemDTO>>> getAllMedia(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String genre,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String country,
            @RequestParam(required = false) Integer year) {
        List<MediaItemDTO> mediaList = mediaService.getAllMedia(type, genre, search, sortBy, country, year);
        return ResponseEntity.ok(ApiResponse.success(mediaList));
    }

    /**
     * GET /api/v1/media/trending
     * Mengambil semua media yang sedang trending.
     */
    @GetMapping("/trending")
    public ResponseEntity<ApiResponse<List<MediaItemDTO>>> getTrendingMedia() {
        List<MediaItemDTO> trendingList = mediaService.getTrendingMedia();
        return ResponseEntity.ok(ApiResponse.success(trendingList));
    }

    /**
     * GET /api/v1/media/{id}
     * Mengambil detail satu media berdasarkan ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MediaItemDTO>> getMediaById(@PathVariable String id) {
        MediaItemDTO media = mediaService.getMediaById(id);
        return ResponseEntity.ok(ApiResponse.success(media));
    }

    /**
     * POST /api/v1/media
     * Menambahkan satu media baru ke database.
     * @Valid memastikan MediaRequestDTO divalidasi sebelum masuk ke Service.
     */
    @PostMapping
    public ResponseEntity<ApiResponse<MediaItemDTO>> createMedia(@Valid @RequestBody MediaRequestDTO requestDTO) {
        MediaItemDTO createdMedia = mediaService.createMedia(requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(createdMedia, "Media berhasil ditambahkan"));
    }

    /**
     * PUT /api/v1/media/{id}
     * Memperbarui data media yang sudah ada.
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<MediaItemDTO>> updateMedia(
            @PathVariable String id,
            @Valid @RequestBody MediaRequestDTO requestDTO) {
        MediaItemDTO updatedMedia = mediaService.updateMedia(id, requestDTO);
        return ResponseEntity.ok(ApiResponse.success(updatedMedia, "Media berhasil diperbarui"));
    }

    /**
     * DELETE /api/v1/media/{id}
     * Menghapus data media berdasarkan ID.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteMedia(@PathVariable String id) {
        mediaService.deleteMedia(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Media berhasil dihapus"));
    }
}
