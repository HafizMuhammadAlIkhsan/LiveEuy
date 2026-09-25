package com.liveeuy.backend.controller;

import com.liveeuy.backend.dto.ApiResponse;
import com.liveeuy.backend.dto.WatchProgressRequest;
import com.liveeuy.backend.model.WatchProgress;
import com.liveeuy.backend.service.MediaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/user/progress")
@Tag(name = "Riwayat & Progres Menonton", description = "Endpoints untuk sinkronisasi detik pemutaran terakhir dan bar progres tontonan")
public class WatchProgressController {

    private final MediaService mediaService;

    public WatchProgressController(MediaService mediaService) {
        this.mediaService = mediaService;
    }

    @GetMapping
    @Operation(summary = "Dapatkan seluruh riwayat durasi tontonan pengguna", description = "Digunakan oleh Web dan Mobile untuk menampilkan deretan 'Lanjutkan Menonton' (Continue Watching).")
    public ApiResponse<Map<String, WatchProgress>> getAllProgress() {
        return ApiResponse.success("Riwayat progres menonton berhasil dimuat", mediaService.getAllProgress());
    }

    @PutMapping
    @Operation(summary = "Sinkronisasi progres pemutaran video saat ini", description = "Mengirimkan detik terkini (currentTime) dan total durasi untuk disimpan di server.")
    public ApiResponse<WatchProgress> updateProgress(@Valid @RequestBody WatchProgressRequest request) {
        WatchProgress updated = mediaService.updateProgress(request);
        return ApiResponse.success("Progres tontonan berhasil diperbarui", updated);
    }
}
