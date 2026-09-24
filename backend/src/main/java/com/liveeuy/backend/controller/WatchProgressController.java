package com.liveeuy.backend.controller;

import com.liveeuy.backend.dto.ApiResponse;
import com.liveeuy.backend.dto.WatchProgressRequest;
import com.liveeuy.backend.model.WatchProgress;
import com.liveeuy.backend.service.MediaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/user/progress")
@Tag(name = "Watch Progress", description = "Endpoints sinkronisasi durasi dan riwayat Lanjutkan Menonton")
public class WatchProgressController {

    private final MediaService mediaService;

    public WatchProgressController(MediaService mediaService) {
        this.mediaService = mediaService;
    }

    @GetMapping
    @Operation(summary = "Daftar progres tontonan", description = "Mengambil riwayat posisi menonton pengguna untuk fitur Lanjutkan Menonton.")
    public ResponseEntity<ApiResponse<List<WatchProgress>>> getUserProgress(
            @RequestParam(defaultValue = "user_hafiz") String userId) {
        return ResponseEntity.ok(ApiResponse.ok(mediaService.getUserProgressList(userId)));
    }

    @PostMapping
    @Operation(summary = "Sinkronisasi posisi tontonan (UPSERT)", description = "Memperbarui progres durasi tontonan (0.0 s.d 1.0) secara asynchronous dari mobile player.")
    public ResponseEntity<ApiResponse<WatchProgress>> updateWatchProgress(
            @RequestParam(defaultValue = "user_hafiz") String userId,
            @Valid @RequestBody WatchProgressRequest request) {
        WatchProgress updated = mediaService.updateWatchProgress(userId, request);
        return ResponseEntity.ok(ApiResponse.ok("Progres tontonan berhasil disinkronisasi", updated));
    }
}
