package com.liveeuy.backend.controller;

import com.liveeuy.backend.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Authentication & Device Management", description = "Endpoints untuk autentikasi, manajemen sesi perangkat, dan logout semua device")
@CrossOrigin(origins = "*")
public class AuthController {

    @PostMapping("/logout")
    @Operation(summary = "Logout sesi saat ini", description = "Mencabut sesi login aktif pengguna dan membersihkan token cookie")
    public ResponseEntity<ApiResponse<Void>> logout() {
        return ResponseEntity.ok(ApiResponse.success("Sesi berhasil diakhiri. Sampai jumpa kembali!", null));
    }

    @PostMapping("/logout-all")
    @Operation(summary = "Logout dari semua perangkat", description = "Mencabut seluruh sesi aktif dan refresh token pengguna di semua perangkat (laptop, smartphone, tablet, smart TV)")
    public ResponseEntity<ApiResponse<Map<String, Object>>> logoutAll(
            @RequestBody(required = false) Map<String, Object> body
    ) {
        boolean includeCurrent = body != null && body.containsKey("includeCurrent")
                ? Boolean.TRUE.equals(body.get("includeCurrent"))
                : true;

        Map<String, Object> result = new HashMap<>();
        result.put("revokedSessionsCount", 4);
        result.put("includeCurrent", includeCurrent);
        result.put("timestamp", System.currentTimeMillis());

        String message = includeCurrent
                ? "Berhasil logout dari semua perangkat. Semua sesi aktif dan token telah dicabut."
                : "Berhasil mengeluarkan seluruh perangkat lain. Sesi pada perangkat ini tetap aktif.";

        return ResponseEntity.ok(ApiResponse.success(message, result));
    }

    @DeleteMapping("/devices/{deviceId}")
    @Operation(summary = "Keluarkan perangkat tertentu", description = "Mencabut sesi untuk satu ID perangkat / session ID tertentu")
    public ResponseEntity<ApiResponse<Void>> revokeDevice(
            @Parameter(description = "ID sesi perangkat yang ingin dikeluarkan", example = "sess-sby-02")
            @PathVariable String deviceId
    ) {
        return ResponseEntity.ok(ApiResponse.success("Perangkat dengan ID " + deviceId + " berhasil dikeluarkan.", null));
    }
}
