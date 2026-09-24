package com.liveeuy.backend.controller;

import com.liveeuy.backend.dto.ApiResponse;
import com.liveeuy.backend.model.MediaItem;
import com.liveeuy.backend.service.MediaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/media")
@Tag(name = "Media Catalogue", description = "Endpoints untuk eksplorasi katalog film, serial TV, dan Top 10")
public class MediaController {

    private final MediaService mediaService;

    public MediaController(MediaService mediaService) {
        this.mediaService = mediaService;
    }

    @GetMapping
    @Operation(summary = "Ambil semua katalog media", description = "Mengembalikan daftar semua film dan serial TV yang tersedia.")
    public ResponseEntity<ApiResponse<List<MediaItem>>> getAllMedia() {
        return ResponseEntity.ok(ApiResponse.ok(mediaService.getAllMedia()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Detail media berdasarkan ID", description = "Mengembalikan rincian lengkap film atau serial termasuk episode dan musim.")
    public ResponseEntity<ApiResponse<MediaItem>> getMediaById(@PathVariable String id) {
        return mediaService.getMediaById(id)
                .map(item -> ResponseEntity.ok(ApiResponse.ok(item)))
                .orElseGet(() -> ResponseEntity.status(404).body(ApiResponse.error("Media tidak ditemukan dengan ID: " + id)));
    }

    @GetMapping("/top10")
    @Operation(summary = "Daftar Top 10 Indonesia", description = "Mengambil 10 tayangan paling populer di Indonesia.")
    public ResponseEntity<ApiResponse<List<MediaItem>>> getTop10() {
        return ResponseEntity.ok(ApiResponse.ok(mediaService.getTop10()));
    }
}
