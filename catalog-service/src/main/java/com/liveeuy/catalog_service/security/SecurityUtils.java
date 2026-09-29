package com.liveeuy.catalog_service.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;

import java.util.Optional;

public final class SecurityUtils {

    private SecurityUtils() {}

    /**
     * Mengambil instance JWT dari token autentikasi saat ini jika ada.
     */
    public static Optional<Jwt> getCurrentJwt() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof Jwt jwt) {
            return Optional.of(jwt);
        }
        return Optional.empty();
    }

    /**
     * Mengambil ID user (sub claim).
     */
    public static Optional<String> getCurrentUserId() {
        return getCurrentJwt().map(Jwt::getSubject);
    }

    /**
     * Mengambil email user dari claim 'email'.
     */
    public static Optional<String> getCurrentUserEmail() {
        return getCurrentJwt().map(jwt -> jwt.getClaimAsString("email"));
    }

    /**
     * Mengambil nama user dari claim 'name'.
     */
    public static Optional<String> getCurrentUserName() {
        return getCurrentJwt().map(jwt -> jwt.getClaimAsString("name"));
    }

    /**
     * Mengambil role user dari claim 'role'.
     */
    public static Optional<String> getCurrentUserRole() {
        return getCurrentJwt().map(jwt -> jwt.getClaimAsString("role"));
    }

    /**
     * Mengambil paket tier langganan dari claim 'tier'.
     */
    public static Optional<String> getCurrentUserTier() {
        return getCurrentJwt().map(jwt -> jwt.getClaimAsString("tier"));
    }

    /**
     * Memeriksa apakah user saat ini memiliki role admin.
     */
    public static boolean isAdmin() {
        return getCurrentUserRole().map(role -> "admin".equalsIgnoreCase(role)).orElse(false);
    }

    /**
     * Memeriksa apakah user saat ini memiliki tier langganan tertentu.
     */
    public static boolean hasTier(String tier) {
        if (tier == null || tier.isBlank()) return false;
        return getCurrentUserTier().map(t -> t.equalsIgnoreCase(tier)).orElse(false);
    }
}
