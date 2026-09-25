package com.liveeuy.backend.controller;

import com.liveeuy.backend.dto.ApiResponse;
import com.liveeuy.backend.service.MediaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/v1/user/watchlist")
@Tag(name = "Koleksi Tontonan Pengguna", description = "Endpoints untuk menyimpan dan mengelola daftar tontonan (Watchlist) penonton")
public class WatchlistController {

    private final MediaService mediaService;

    public WatchlistController(MediaService mediaService) {
        this.mediaService = mediaService;
    }

    @GetMapping
    @Operation(summary = "Dapatkan daftar ID tontonan yang disimpan", description = "Mengembalikan kumpulan ID media yang tersimpan di dalam koleksi pengguna.")
    public ApiResponse<Set<String>> getWatchlist() {
        return ApiResponse.success("Daftar koleksi berhasil diambil", mediaService.getWatchlist());
    }

    @PostMapping("/{mediaId}/toggle")
    @Operation(summary = "Toggle simpan / hapus media dari koleksi", description = "Menambahkan media ke koleksi jika belum ada, atau menghapusnya jika sudah ada.")
    public ApiResponse<Map<String, Object>> toggleWatchlist(
            @Parameter(description = "ID media yang ingin di-toggle", example = "cyberpunk-neo-nusantara")
            @PathVariable String mediaId
    ) {
        boolean isNowInWatchlist = mediaService.toggleWatchlist(mediaId);
        String msg = isNowInWatchlist ? "Media ditambahkan ke Koleksi Saya" : "Media dihapus dari Koleksi Saya";
        return ApiResponse.success(msg, Map.of(
                "mediaId", mediaId,
                "inWatchlist", isNowInWatchlist
        ));
    }
}
