package com.liveeuy.backend.controller;

import com.liveeuy.backend.dto.ApiResponse;
import com.liveeuy.backend.model.MediaItem;
import com.liveeuy.backend.service.MediaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/v1/user/watchlist")
@Tag(name = "User Watchlist", description = "Endpoints untuk mengelola koleksi film/serial tersimpan pengguna")
public class WatchlistController {

    private final MediaService mediaService;

    public WatchlistController(MediaService mediaService) {
        this.mediaService = mediaService;
    }

    @GetMapping
    @Operation(summary = "Dapatkan daftar watchlist pengguna", description = "Mengambil seluruh item media yang tersimpan dalam koleksi tontonan pengguna.")
    public ResponseEntity<ApiResponse<List<MediaItem>>> getWatchlist(
            @RequestParam(defaultValue = "user_hafiz") String userId) {
        return ResponseEntity.ok(ApiResponse.ok(mediaService.getWatchlistMedia(userId)));
    }

    @GetMapping("/ids")
    @Operation(summary = "Dapatkan ID media dalam watchlist", description = "Mengambil kumpulan ID media yang disimpan pengguna.")
    public ResponseEntity<ApiResponse<Set<String>>> getWatchlistIds(
            @RequestParam(defaultValue = "user_hafiz") String userId) {
        return ResponseEntity.ok(ApiResponse.ok(mediaService.getWatchlistIds(userId)));
    }

    @PostMapping("/{mediaId}")
    @Operation(summary = "Toggle simpan/hapus watchlist", description = "Menambahkan atau menghapus media dari daftar koleksi pengguna secara idempotent.")
    public ResponseEntity<ApiResponse<Map<String, Object>>> toggleWatchlist(
            @PathVariable String mediaId,
            @RequestParam(defaultValue = "user_hafiz") String userId) {
        boolean isAdded = mediaService.toggleWatchlist(userId, mediaId);
        String actionMessage = isAdded ? "Berhasil ditambahkan ke Koleksi" : "Berhasil dihapus dari Koleksi";
        return ResponseEntity.ok(ApiResponse.ok(actionMessage, Map.of(
                "mediaId", mediaId,
                "inWatchlist", isAdded
        )));
    }
}
