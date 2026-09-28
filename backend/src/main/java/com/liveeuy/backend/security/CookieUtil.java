package com.liveeuy.backend.security;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseCookie;

import java.util.Arrays;
import java.util.Optional;

public class CookieUtil {

    public static final String REFRESH_TOKEN_COOKIE_NAME = "refreshToken";
    public static final String AUTH_COOKIE_PATH = "/api/v1/auth";
    public static final long REFRESH_TOKEN_EXPIRATION_SECONDS = 7 * 24 * 60 * 60; // 7 days

    /**
     * Membuat HttpOnly secure cookie untuk Refresh Token.
     * Menggunakan SameSite=Lax agar kompatibel dengan request cross-origin antara frontend (localhost:5173) dan backend (localhost:8080).
     */
    public static ResponseCookie createRefreshTokenCookie(String token, long maxAgeSeconds, boolean isSecure) {
        return ResponseCookie.from(REFRESH_TOKEN_COOKIE_NAME, token)
                .httpOnly(true)
                .secure(isSecure)
                .path(AUTH_COOKIE_PATH)
                .maxAge(maxAgeSeconds)
                .sameSite("Lax")
                .build();
    }

    /**
     * Membuat cookie penghapus (Max-Age=0) saat pengguna melakukan logout.
     */
    public static ResponseCookie deleteRefreshTokenCookie(boolean isSecure) {
        return ResponseCookie.from(REFRESH_TOKEN_COOKIE_NAME, "")
                .httpOnly(true)
                .secure(isSecure)
                .path(AUTH_COOKIE_PATH)
                .maxAge(0)
                .sameSite("Lax")
                .build();
    }

    /**
     * Mengekstrak nilai cookie dari HttpServletRequest berdasarkan nama.
     */
    public static Optional<String> getCookieValue(HttpServletRequest request, String name) {
        if (request.getCookies() == null) {
            return Optional.empty();
        }
        return Arrays.stream(request.getCookies())
                .filter(cookie -> name.equals(cookie.getName()))
                .map(Cookie::getValue)
                .findFirst();
    }
}
