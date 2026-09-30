package com.liveeuy.catalog_service.storage;

/**
 * Exception yang dilempar saat terjadi error pada operasi Cloudflare R2 Storage.
 * Membungkus exception dari AWS SDK agar layer controller tidak perlu
 * bergantung langsung pada AWS SDK types.
 */
public class R2StorageException extends RuntimeException {

    public R2StorageException(String message) {
        super(message);
    }

    public R2StorageException(String message, Throwable cause) {
        super(message, cause);
    }
}
