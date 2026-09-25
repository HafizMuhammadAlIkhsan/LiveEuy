package com.liveeuy.backend.controller;

import com.liveeuy.backend.dto.ApiResponse;
import com.liveeuy.backend.model.MediaItem;
import com.liveeuy.backend.service.MediaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/media")
@Tag(name = "Katalog Media & Konten", description = "Endpoints untuk mencari, memfilter, dan membaca detail film dan serial TV")
public class MediaController {

    private final MediaService mediaService;

    public MediaController(MediaService mediaService) {
        this.mediaService = mediaService;
    }

    @GetMapping
    @Operation(summary = "Dapatkan daftar katalog media", description = "Mendukung filter berdasarkan format ('movie'/'tv'), genre, pencarian teks, dan pengurutan.")
    public ApiResponse<List<MediaItem>> getAllMedia(
            @Parameter(description = "Filter format: 'all', 'movie', atau 'tv'", example = "movie")
            @RequestParam(required = false, defaultValue = "all") String type,
            @Parameter(description = "Filter kategori genre", example = "Aksi")
            @RequestParam(required = false, defaultValue = "Semua Genre") String genre,
            @Parameter(description = "Kata kunci pencarian judul, genre, atau aktor", example = "cyberpunk")
            @RequestParam(required = false) String search,
            @Parameter(description = "Kriteria pengurutan: 'popular', 'rating', atau 'newest'", example = "popular")
            @RequestParam(required = false, defaultValue = "popular") String sortBy
    ) {
        return ApiResponse.success(mediaService.getAllMedia(type, genre, search, sortBy));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Dapatkan detail satu judul film/serial", description = "Mengembalikan data lengkap media termasuk daftar episode (jika serial) dan ulasan penonton.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Media berhasil ditemukan"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Media tidak ditemukan")
    })
    public ResponseEntity<ApiResponse<MediaItem>> getMediaById(
            @Parameter(description = "Identifier unik media", example = "cyberpunk-neo-nusantara")
            @PathVariable String id
    ) {
        return mediaService.getMediaById(id)
                .map(media -> ResponseEntity.ok(ApiResponse.success(media)))
                .orElse(ResponseEntity.status(404).body(ApiResponse.error("Media tidak ditemukan dengan id: " + id)));
    }

    @GetMapping("/featured")
    @Operation(summary = "Dapatkan tayangan sorotan utama (Hero Banner)", description = "Mengembalikan daftar media yang ditandai sebagai featured untuk carousel banner beranda.")
    public ApiResponse<List<MediaItem>> getFeatured() {
        return ApiResponse.success(mediaService.getFeaturedMedia());
    }

    @GetMapping("/top-10")
    @Operation(summary = "Dapatkan Top 10 tayangan paling populer di Indonesia", description = "Mengembalikan 10 tayangan dengan peringkat teratas yang diurutkan dari posisi 1 hingga 10.")
    public ApiResponse<List<MediaItem>> getTop10() {
        return ApiResponse.success(mediaService.getTop10());
    }
}
