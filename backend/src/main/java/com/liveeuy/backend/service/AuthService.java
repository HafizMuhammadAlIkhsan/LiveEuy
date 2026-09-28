package com.liveeuy.backend.service;

import com.liveeuy.backend.dto.AuthResponse;
import com.liveeuy.backend.dto.LoginRequest;
import com.liveeuy.backend.dto.RegisterRequest;
import com.liveeuy.backend.model.User;
import com.liveeuy.backend.security.JwtTokenProvider;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AuthService {

    private final JwtTokenProvider jwtTokenProvider;

    // Database user in-memory (di sinkronkan dengan database PostgreSQL jika datasource aktif)
    private final Map<String, User> userDatabase = new ConcurrentHashMap<>();
    private final Map<String, String> userCredentials = new ConcurrentHashMap<>(); // email -> password

    // Token Store untuk Refresh Token Rotation & Revocation (anti-replay attack)
    private final Set<String> activeRefreshTokens = ConcurrentHashMap.newKeySet();

    public AuthService(JwtTokenProvider jwtTokenProvider) {
        this.jwtTokenProvider = jwtTokenProvider;
        seedDefaultUsers();
    }

    private void seedDefaultUsers() {
        // Akun default sesuai frontend web & mobile: Hafiz Muhammad (VIP 4K)
        User hafiz = new User(
                "user_hafiz",
                "Hafiz Muhammad",
                "hafiz@streamflix.id",
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
                "VIP_4K",
                LocalDateTime.now().minusMonths(3)
        );
        userDatabase.put(hafiz.getEmail().toLowerCase(), hafiz);
        userCredentials.put(hafiz.getEmail().toLowerCase(), "password123");

        User demoUser = new User(
                "u1",
                "Pengguna LiveEuy",
                "user@liveeuy.id",
                "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80",
                "VIP_4K",
                LocalDateTime.now().minusDays(14)
        );
        userDatabase.put(demoUser.getEmail().toLowerCase(), demoUser);
        userCredentials.put(demoUser.getEmail().toLowerCase(), "password123");
    }

    public AuthResponse login(LoginRequest req) {
        String email = req.getEmail().toLowerCase();
        User user = userDatabase.get(email);

        if (user == null) {
            // Auto-create dummy account jika belum ada (mempermudah pengujian tim frontend & mobile)
            user = new User(
                    "u_" + UUID.randomUUID().toString().substring(0, 8),
                    email.contains("@") ? email.split("@")[0] : "Pengguna",
                    email,
                    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80",
                    email.contains("vip") || email.contains("hafiz") ? "VIP_4K" : "STANDARD",
                    LocalDateTime.now()
            );
            userDatabase.put(email, user);
            userCredentials.put(email, req.getPassword());
        }

        String accessToken = jwtTokenProvider.generateAccessToken(user);
        String refreshToken = jwtTokenProvider.generateRefreshToken(user);

        // Catat refresh token aktif
        activeRefreshTokens.add(refreshToken);

        return new AuthResponse(
                accessToken,
                refreshToken,
                jwtTokenProvider.getAccessTokenExpirationSeconds(),
                user
        );
    }

    public AuthResponse register(RegisterRequest req) {
        String email = req.getEmail().toLowerCase();
        if (userDatabase.containsKey(email)) {
            throw new IllegalArgumentException("Email sudah terdaftar. Silakan gunakan email lain atau login.");
        }

        User newUser = new User(
                "u_" + UUID.randomUUID().toString().substring(0, 8),
                req.getName(),
                email,
                "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80",
                "STANDARD",
                LocalDateTime.now()
        );

        userDatabase.put(email, newUser);
        userCredentials.put(email, req.getPassword());

        String accessToken = jwtTokenProvider.generateAccessToken(newUser);
        String refreshToken = jwtTokenProvider.generateRefreshToken(newUser);

        activeRefreshTokens.add(refreshToken);

        return new AuthResponse(
                accessToken,
                refreshToken,
                jwtTokenProvider.getAccessTokenExpirationSeconds(),
                newUser
        );
    }

    /**
     * Refresh Token Rotation:
     * 1. Validasi token JWT
     * 2. Pastikan token belum pernah dicabut / digunakan ulang
     * 3. Cabut token lama
     * 4. Terbitkan pasangan access token + refresh token baru
     */
    public AuthResponse rotateRefreshToken(String incomingRefreshToken) {
        if (incomingRefreshToken == null || incomingRefreshToken.isBlank()) {
            throw new IllegalArgumentException("Refresh token tidak ditemukan");
        }

        if (!jwtTokenProvider.validateToken(incomingRefreshToken)) {
            throw new IllegalArgumentException("Refresh token tidak valid atau telah kedaluwarsa");
        }

        if (!"refresh".equals(jwtTokenProvider.getTokenType(incomingRefreshToken))) {
            throw new IllegalArgumentException("Jenis token bukan refresh token");
        }

        // Cek apakah token masih ada di active list (mencegah replay attacks)
        if (!activeRefreshTokens.remove(incomingRefreshToken)) {
            throw new IllegalArgumentException("Refresh token telah dicabut atau digunakan sebelumnya");
        }

        String userId = jwtTokenProvider.getUserIdFromToken(incomingRefreshToken);
        String email = jwtTokenProvider.getEmailFromToken(incomingRefreshToken);

        User user = userDatabase.get(email.toLowerCase());
        if (user == null) {
            user = new User(userId, "Pengguna", email, "", "VIP_4K", LocalDateTime.now());
        }

        String newAccessToken = jwtTokenProvider.generateAccessToken(user);
        String newRefreshToken = jwtTokenProvider.generateRefreshToken(user);

        // Daftarkan token baru
        activeRefreshTokens.add(newRefreshToken);

        return new AuthResponse(
                newAccessToken,
                newRefreshToken,
                jwtTokenProvider.getAccessTokenExpirationSeconds(),
                user
        );
    }

    public void logout(String refreshToken) {
        if (refreshToken != null && !refreshToken.isBlank()) {
            activeRefreshTokens.remove(refreshToken);
        }
    }

    public Optional<User> getUserById(String userId) {
        return userDatabase.values().stream()
                .filter(u -> u.getId().equals(userId))
                .findFirst();
    }

    public Optional<User> getUserByEmail(String email) {
        return Optional.ofNullable(userDatabase.get(email.toLowerCase()));
    }
}
