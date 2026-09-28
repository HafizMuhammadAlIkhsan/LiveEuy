package com.liveeuy.backend.controller;

import com.liveeuy.backend.dto.ApiResponse;
import com.liveeuy.backend.dto.UserSettingsRequest;
import com.liveeuy.backend.model.UserSettings;
import com.liveeuy.backend.service.MediaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/user/settings")
@Tag(name = "User Settings", description = "Endpoints preferensi pengguna, kualitas streaming, dan manajemen pemutar")
public class UserSettingsController {

    private final MediaService mediaService;

    public UserSettingsController(MediaService mediaService) {
        this.mediaService = mediaService;
    }

    @GetMapping
    @Operation(
            summary = "Ambil preferensi pengguna",
            description = "Mengambil pengaturan pemutar, kualitas streaming (AUTO, DATA_SAVER, HD_720P, FHD_1080P, UHD_4K), dan status unduhan."
    )
    public ResponseEntity<ApiResponse<UserSettings>> getUserSettings(
            @RequestParam(defaultValue = "user_hafiz") String userId) {
        UserSettings settings = mediaService.getUserSettings(userId);
        return ResponseEntity.ok(ApiResponse.ok("Pengaturan pengguna berhasil dimuat", settings));
    }

    @PutMapping
    @Operation(
            summary = "Perbarui preferensi pengguna",
            description = "Menyimpan perubahan kualitas streaming, audio spasial Dolby Atmos, unduh Wi-Fi, dan notifikasi."
    )
    public ResponseEntity<ApiResponse<UserSettings>> updateUserSettings(
            @RequestParam(defaultValue = "user_hafiz") String userId,
            @Valid @RequestBody UserSettingsRequest request) {
        UserSettings updated = mediaService.updateUserSettings(userId, request);
        return ResponseEntity.ok(ApiResponse.ok("Pengaturan pengguna berhasil diperbarui", updated));
    }
}
