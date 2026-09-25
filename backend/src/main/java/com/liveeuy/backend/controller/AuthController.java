package com.liveeuy.backend.controller;

import com.liveeuy.backend.dto.*;
import com.liveeuy.backend.model.User;
import com.liveeuy.backend.security.CookieUtil;
import com.liveeuy.backend.security.JwtTokenProvider;
import com.liveeuy.backend.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Authentication & Token Management", description = "Endpoints untuk autentikasi pengguna, Refresh Token Rotation, dan manajemen Cookie HttpOnly")
public class AuthController {

    private final AuthService authService;
    private final JwtTokenProvider jwtTokenProvider;
    private final boolean isProduction;

    public AuthController(
            AuthService authService,
            JwtTokenProvider jwtTokenProvider,
            @Value("${liveeuy.cookie.secure:false}") boolean isProduction
    ) {
        this.authService = authService;
        this.jwtTokenProvider = jwtTokenProvider;
        this.isProduction = isProduction;
    }

    @PostMapping("/login")
    @Operation(summary = "Login Pengguna", description = "Mengembalikan Access Token (JWT) dalam body dan menyetel Refresh Token di HttpOnly Cookie.")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest req) {
        AuthResponse authResponse = authService.login(req);

        // Buat HttpOnly Cookie untuk Refresh Token (Aman dari XSS di Web Frontend)
        ResponseCookie cookie = CookieUtil.createRefreshTokenCookie(
                authResponse.getRefreshToken(),
                jwtTokenProvider.getRefreshTokenExpirationSeconds(),
                isProduction
        );

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(ApiResponse.ok("Login berhasil. Selamat datang kembali!", authResponse));
    }

    @PostMapping("/register")
    @Operation(summary = "Pendaftaran Pengguna Baru", description = "Mendaftarkan akun baru dan langsung mengembalikan Access Token serta Refresh Token cookie.")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest req) {
        try {
            AuthResponse authResponse = authService.register(req);

            ResponseCookie cookie = CookieUtil.createRefreshTokenCookie(
                    authResponse.getRefreshToken(),
                    jwtTokenProvider.getRefreshTokenExpirationSeconds(),
                    isProduction
            );

            return ResponseEntity.status(HttpStatus.CREATED)
                    .header(HttpHeaders.SET_COOKIE, cookie.toString())
                    .body(ApiResponse.ok("Registrasi akun berhasil!", authResponse));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/refresh")
    @Operation(
            summary = "Refresh Access Token (Silent Refresh)",
            description = "Memperbarui Access Token yang telah kedaluwarsa. Mendukung pembacaan Refresh Token otomatis dari HttpOnly Cookie (untuk Web) ataupun Request Body (untuk Mobile)."
    )
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(
            @CookieValue(name = CookieUtil.REFRESH_TOKEN_COOKIE_NAME, required = false) String cookieToken,
            @RequestBody(required = false) RefreshTokenRequest bodyRequest,
            HttpServletRequest request
    ) {
        // Ambil token dari cookie (Web) atau body (Mobile) atau header cookie manual
        String tokenToVerify = cookieToken;
        if (tokenToVerify == null || tokenToVerify.isBlank()) {
            if (bodyRequest != null && bodyRequest.getRefreshToken() != null && !bodyRequest.getRefreshToken().isBlank()) {
                tokenToVerify = bodyRequest.getRefreshToken();
            } else {
                tokenToVerify = CookieUtil.getCookieValue(request, CookieUtil.REFRESH_TOKEN_COOKIE_NAME).orElse(null);
            }
        }

        if (tokenToVerify == null || tokenToVerify.isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Refresh token tidak ditemukan di cookie maupun request body. Silakan login kembali."));
        }

        try {
            // Jalankan Refresh Token Rotation (Token lama dicabut, diterbitkan token baru)
            AuthResponse authResponse = authService.rotateRefreshToken(tokenToVerify);

            ResponseCookie newCookie = CookieUtil.createRefreshTokenCookie(
                    authResponse.getRefreshToken(),
                    jwtTokenProvider.getRefreshTokenExpirationSeconds(),
                    isProduction
            );

            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, newCookie.toString())
                    .body(ApiResponse.ok("Access token berhasil diperbarui", authResponse));
        } catch (IllegalArgumentException e) {
            // Jika token invalid / sudah expired / reuse attack terdeteksi: bersihkan cookie
            ResponseCookie cleanCookie = CookieUtil.deleteRefreshTokenCookie(isProduction);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .header(HttpHeaders.SET_COOKIE, cleanCookie.toString())
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout Pengguna", description = "Mencabut refresh token dari server dan menghapus HttpOnly cookie di browser.")
    public ResponseEntity<ApiResponse<Void>> logout(
            @CookieValue(name = CookieUtil.REFRESH_TOKEN_COOKIE_NAME, required = false) String cookieToken,
            @RequestBody(required = false) RefreshTokenRequest bodyRequest
    ) {
        String tokenToRevoke = cookieToken;
        if (tokenToRevoke == null && bodyRequest != null) {
            tokenToRevoke = bodyRequest.getRefreshToken();
        }

        authService.logout(tokenToRevoke);

        // Hapus cookie di browser (Max-Age=0)
        ResponseCookie cleanCookie = CookieUtil.deleteRefreshTokenCookie(isProduction);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cleanCookie.toString())
                .body(ApiResponse.ok("Logout berhasil. Sesi telah diakhiri.", null));
    }

    @GetMapping("/me")
    @Operation(summary = "Profil Pengguna Aktif", description = "Mengambil profil pengguna yang sedang login berdasarkan Access Token di header Authorization.")
    public ResponseEntity<ApiResponse<User>> getCurrentUser(
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            if (jwtTokenProvider.validateToken(token)) {
                String userId = jwtTokenProvider.getUserIdFromToken(token);
                return authService.getUserById(userId)
                        .map(u -> ResponseEntity.ok(ApiResponse.ok(u)))
                        .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Pengguna tidak ditemukan")));
            }
        }

        // Fallback default user untuk kemudahan testing jika tanpa token
        return authService.getUserByEmail("hafiz@streamflix.id")
                .map(u -> ResponseEntity.ok(ApiResponse.ok("Profil teridentifikasi", u)))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Sesi tidak valid")));
    }
}
