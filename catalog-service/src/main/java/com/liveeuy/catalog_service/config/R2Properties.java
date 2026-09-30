package com.liveeuy.catalog_service.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Konfigurasi Cloudflare R2 yang dibaca dari environment variables / application.properties.
 * <p>
 * R2 sepenuhnya kompatibel dengan AWS S3 API, sehingga kita menggunakan AWS SDK v2
 * dengan endpoint custom yang mengarah ke R2.
 * <p>
 * Prefix: {@code r2}
 */
@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "r2")
public class R2Properties {

    /**
     * Cloudflare Account ID.
     * Didapat dari: Cloudflare Dashboard → R2 → Overview
     * Format: 32-karakter hex string
     * Env: {@code R2_ACCOUNT_ID}
     */
    private String accountId;

    /**
     * R2 Access Key ID.
     * Dibuat di: Cloudflare Dashboard → R2 → Manage R2 API Tokens
     * Env: {@code R2_ACCESS_KEY_ID}
     */
    private String accessKeyId;

    /**
     * R2 Secret Access Key.
     * Env: {@code R2_SECRET_ACCESS_KEY}
     */
    private String secretAccessKey;

    /**
     * Nama bucket R2 yang digunakan oleh catalog-service.
     * Contoh: {@code liveeuy-catalog}
     * Env: {@code R2_BUCKET_NAME}
     */
    private String bucketName;

    /**
     * Custom domain publik untuk akses file (opsional).
     * Jika diset, URL yang dikembalikan akan menggunakan domain ini.
     * Contoh: {@code https://cdn.liveeuy.com}
     * Env: {@code R2_PUBLIC_URL}
     */
    private String publicUrl;

    /**
     * Durasi default (dalam menit) untuk presigned URL.
     * Default: 60 menit.
     * Env: {@code R2_PRESIGN_EXPIRY_MINUTES}
     */
    private int presignExpiryMinutes = 60;

    /**
     * Mengembalikan S3-compatible endpoint URL untuk account Cloudflare ini.
     * Format: {@code https://<accountId>.r2.cloudflarestorage.com}
     */
    public String getEndpointUrl() {
        return "https://" + accountId + ".r2.cloudflarestorage.com";
    }
}
