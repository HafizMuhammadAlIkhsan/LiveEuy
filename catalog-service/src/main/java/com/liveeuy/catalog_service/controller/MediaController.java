package com.liveeuy.catalog_service.controller;

import com.liveeuy.catalog_service.dto.ApiResponse;
import com.liveeuy.catalog_service.dto.request.MediaRequestDTO;
import com.liveeuy.catalog_service.dto.response.MediaResponseDTO;
import com.liveeuy.catalog_service.service.MediaService;
import com.liveeuy.catalog_service.storage.R2StorageException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.web.multipart.MultipartFile;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/media")
@RequiredArgsConstructor
public class MediaController {

    private final MediaService mediaService;

    @GetMapping("/featured")
    public ResponseEntity<ApiResponse<MediaResponseDTO>> getFeaturedMedia() {
        MediaResponseDTO featured = mediaService.getFeaturedMedia();
        if (featured == null) {
            return ResponseEntity.ok(ApiResponse.success(null, "Catalog Service is Online (no featured media yet)"));
        }
        return ResponseEntity.ok(ApiResponse.success(featured, "Featured media berhasil diambil"));
    }

    /**
     * Endpoint feed kurasi berdasarkan identitas pengguna & tier langganan dari JWT token.
     * Mengimplementasikan panduan integrasi JWT prompt.md (Section 1).
     */
    @GetMapping("/feed")
    public ResponseEntity<ApiResponse<Page<MediaResponseDTO>>> getPersonalizedFeed(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        String tier = jwt != null ? jwt.getClaimAsString("tier") : null;
        Page<MediaResponseDTO> mediaPage = mediaService.getAllMedia(null, null, null, "rating", page, size);
        String message = (tier != null && !tier.isBlank())
                ? "Feed kurasi katalog untuk member " + tier
                : "Feed kurasi katalog media";

        return ResponseEntity.ok(ApiResponse.success(mediaPage, message));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<MediaResponseDTO>>> getAllMedia(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String genre,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String country,
            @RequestParam(required = false) Integer year,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Page<MediaResponseDTO> mediaPage = mediaService.getAllMedia(type, genre, search, sortBy, country, year, page, size);
        return ResponseEntity.ok(ApiResponse.success(mediaPage));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MediaResponseDTO>> getMediaById(@PathVariable String id) {
        MediaResponseDTO media = mediaService.getMediaById(id);
        return ResponseEntity.ok(ApiResponse.success(media));
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_admin', 'SCOPE_admin', 'admin')")
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
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_admin', 'SCOPE_admin', 'admin')")
    public ResponseEntity<ApiResponse<MediaResponseDTO>> updateMedia(
            @PathVariable String id,
            @Valid @RequestBody MediaRequestDTO requestDTO) {
        MediaResponseDTO updatedMedia = mediaService.updateMedia(id, requestDTO);
        return ResponseEntity.ok(ApiResponse.success(updatedMedia, "Media berhasil diperbarui"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_admin', 'SCOPE_admin', 'admin')")
    public ResponseEntity<ApiResponse<Void>> deleteMedia(@PathVariable String id) {
        mediaService.deleteMedia(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Media berhasil dihapus"));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Upload file ke Cloudflare R2
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Upload poster image ke R2 dan perbarui posterUrl media.
     * <p>
     * Contoh (curl):
     * <pre>
     * curl -X POST /api/v1/media/{id}/poster \
     *   -H "Authorization: Bearer <token>" \
     *   -F "file=@/path/ke/poster.jpg"
     * </pre>
     *
     * @param id   ID media
     * @param file file gambar (jpg, png, webp) — maks 10MB
     * @return MediaResponseDTO dengan posterUrl yang diperbarui
     */
    @PostMapping(value = "/{id}/poster", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_admin', 'SCOPE_admin', 'admin')")
    public ResponseEntity<ApiResponse<MediaResponseDTO>> uploadPoster(
            @PathVariable String id,
            @RequestPart("file") MultipartFile file) {

        log.info("Upload poster untuk media '{}': name={}, size={} bytes", id, file.getOriginalFilename(), file.getSize());
        MediaResponseDTO updated = mediaService.uploadPoster(id, file);
        return ResponseEntity.ok(ApiResponse.success(updated, "Poster berhasil diupload ke R2"));
    }

    /**
     * Upload backdrop image ke R2 dan perbarui backdropUrl media.
     *
     * @param id   ID media
     * @param file file gambar (jpg, png, webp) — maks 10MB
     * @return MediaResponseDTO dengan backdropUrl yang diperbarui
     */
    @PostMapping(value = "/{id}/backdrop", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_admin', 'SCOPE_admin', 'admin')")
    public ResponseEntity<ApiResponse<MediaResponseDTO>> uploadBackdrop(
            @PathVariable String id,
            @RequestPart("file") MultipartFile file) {

        log.info("Upload backdrop untuk media '{}': name={}, size={} bytes", id, file.getOriginalFilename(), file.getSize());
        MediaResponseDTO updated = mediaService.uploadBackdrop(id, file);
        return ResponseEntity.ok(ApiResponse.success(updated, "Backdrop berhasil diupload ke R2"));
    }

    /**
     * Upload trailer/teaser video ke R2 dan perbarui trailerUrl media.
     * <p>
     * File video maksimal 500MB. Format yang didukung: MP4, WebM, MOV.
     *
     * @param id   ID media
     * @param file file video — maks 500MB
     * @return MediaResponseDTO dengan trailerUrl yang diperbarui
     */
    @PostMapping(value = "/{id}/trailer", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_admin', 'SCOPE_admin', 'admin')")
    public ResponseEntity<ApiResponse<MediaResponseDTO>> uploadTrailer(
            @PathVariable String id,
            @RequestPart("file") MultipartFile file) {

        log.info("Upload trailer untuk media '{}': name={}, size={} bytes", id, file.getOriginalFilename(), file.getSize());
        MediaResponseDTO updated = mediaService.uploadTrailer(id, file);
        return ResponseEntity.ok(ApiResponse.success(updated, "Trailer berhasil diupload ke R2"));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Exception handler khusus R2 dalam scope controller ini
    // ─────────────────────────────────────────────────────────────────────────

    @ExceptionHandler(R2StorageException.class)
    public ResponseEntity<ApiResponse<Void>> handleR2Exception(R2StorageException ex) {
        log.error("R2 Storage error pada MediaController: {}", ex.getMessage(), ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error(500, "Storage Error: " + ex.getMessage()));
    }
}

