package com.liveeuy.backend.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.liveeuy.backend.model.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtTokenProvider {

    private final String secretKey;
    private final long accessTokenExpirationSeconds;
    private final long refreshTokenExpirationSeconds;
    private final ObjectMapper objectMapper;

    public JwtTokenProvider(
            @Value("${liveeuy.jwt.secret:liveeuy-super-secret-key-cinema-streaming-platform-2026-xyz}") String secretKey,
            @Value("${liveeuy.jwt.access-token-expiration-seconds:900}") long accessTokenExpirationSeconds, // 15 minutes
            @Value("${liveeuy.jwt.refresh-token-expiration-seconds:604800}") long refreshTokenExpirationSeconds // 7 days
    ) {
        this.secretKey = secretKey;
        this.accessTokenExpirationSeconds = accessTokenExpirationSeconds;
        this.refreshTokenExpirationSeconds = refreshTokenExpirationSeconds;
        this.objectMapper = new ObjectMapper();
    }

    public long getAccessTokenExpirationSeconds() {
        return accessTokenExpirationSeconds;
    }

    public long getRefreshTokenExpirationSeconds() {
        return refreshTokenExpirationSeconds;
    }

    /**
     * Menghasilkan Short-lived Access Token (JWT)
     */
    public String generateAccessToken(User user) {
        return createJwt(user.getId(), user.getEmail(), user.getMembershipTier(), "access", accessTokenExpirationSeconds);
    }

    /**
     * Menghasilkan Long-lived Refresh Token (JWT)
     */
    public String generateRefreshToken(User user) {
        return createJwt(user.getId(), user.getEmail(), user.getMembershipTier(), "refresh", refreshTokenExpirationSeconds);
    }

    private String createJwt(String userId, String email, String membershipTier, String tokenType, long expirationSeconds) {
        try {
            long now = Instant.now().getEpochSecond();
            long exp = now + expirationSeconds;

            // Header
            Map<String, Object> header = new HashMap<>();
            header.put("alg", "HS256");
            header.put("typ", "JWT");
            String encodedHeader = base64UrlEncode(objectMapper.writeValueAsBytes(header));

            // Claims Payload
            Map<String, Object> payload = new HashMap<>();
            payload.put("sub", userId);
            payload.put("email", email);
            payload.put("tier", membershipTier);
            payload.put("type", tokenType);
            payload.put("iat", now);
            payload.put("exp", exp);
            String encodedPayload = base64UrlEncode(objectMapper.writeValueAsBytes(payload));

            // Signature
            String contentToSign = encodedHeader + "." + encodedPayload;
            String signature = signHmacSha256(contentToSign, secretKey);

            return contentToSign + "." + signature;
        } catch (Exception e) {
            throw new RuntimeException("Gagal membuat JWT: " + e.getMessage(), e);
        }
    }

    /**
     * Memvalidasi format, tanda tangan, dan kedaluwarsa token JWT
     */
    public boolean validateToken(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length != 3) {
                return false;
            }

            String content = parts[0] + "." + parts[1];
            String expectedSignature = signHmacSha256(content, secretKey);

            if (!MessageDigest.isEqual(parts[2].getBytes(StandardCharsets.UTF_8), expectedSignature.getBytes(StandardCharsets.UTF_8))) {
                return false;
            }

            Map<String, Object> claims = parseClaims(token);
            long exp = ((Number) claims.get("exp")).longValue();
            return Instant.now().getEpochSecond() < exp;
        } catch (Exception e) {
            return false;
        }
    }

    public String getUserIdFromToken(String token) {
        Map<String, Object> claims = parseClaims(token);
        return (String) claims.get("sub");
    }

    public String getEmailFromToken(String token) {
        Map<String, Object> claims = parseClaims(token);
        return (String) claims.get("email");
    }

    public String getTokenType(String token) {
        Map<String, Object> claims = parseClaims(token);
        return (String) claims.get("type");
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> parseClaims(String token) {
        try {
            String[] parts = token.split("\\.");
            byte[] decoded = Base64.getUrlDecoder().decode(parts[1]);
            return objectMapper.readValue(decoded, Map.class);
        } catch (Exception e) {
            throw new RuntimeException("Klaim token tidak valid", e);
        }
    }

    private String signHmacSha256(String data, String key) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKeySpec);
            byte[] signedBytes = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return base64UrlEncode(signedBytes);
        } catch (Exception e) {
            throw new RuntimeException("Gagal enkripsi HMAC-SHA256", e);
        }
    }

    private String base64UrlEncode(byte[] bytes) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}
