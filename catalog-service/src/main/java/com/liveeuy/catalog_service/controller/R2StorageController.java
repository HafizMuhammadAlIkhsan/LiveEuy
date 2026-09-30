package com.liveeuy.catalog_service.controller;

import com.liveeuy.catalog_service.storage.R2StorageException;
import com.liveeuy.catalog_service.storage.R2StorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.URL;
import java.time.Duration;
import java.util.Map;

/**
 * REST Controller untuk operasi file storage via Cloudflare R2.
 * <p>
 * Base path: {@code /api/v1/storage}
 * <p>
 * Endpoint utama:
 * <ul>
 *   <li>{@code POST   /upload}              — Upload file (admin only)</li>
 *   <li>{@code DELETE /{objectKey}}         — Hapus file (admin only)</li>
 *   <li>{@code GET    /presign/download}    — Presigned URL untuk download (auth required)</li>
 *   <li>{@code POST   /presign/upload}      — Presigned URL untuk client-side upload (admin only)</li>
 *   <li>{@code GET    /exists}              — Cek keberadaan file</li>
 * </ul>
 */
@Slf4j
@RestController
@RequestMapping("/storage")
@RequiredArgsConstructor
public class R2StorageController {

    private final R2StorageService r2StorageService;

    // ─────────────────────────────────────────────────────────────────────────
    // Upload file langsung (server-side)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Upload file ke R2 dari form-data.
     * <p>
     * Contoh penggunaan (CURL):
     * <pre>
     * curl -X POST /api/v1/storage/upload \
     *   -H "Authorization: Bearer <token>" \
     *   -F "file=@/path/ke/poster.jpg" \
     *   -F "folder=posters" \
     *   -F "fileName=oppenheimer-poster.jpg"
     * </pre>
     *
     * @param file     file yang diupload (multipart)
     * @param folder   subfolder tujuan di bucket, misal {@code "posters"}, {@code "trailers"}
     * @param fileName nama file (opsional; jika kosong, pakai nama asli file)
     * @return URL publik file yang baru diupload
     */
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('SCOPE_ADMIN')")
    public ResponseEntity<Map<String, String>> uploadFile(
            @RequestPart("file") MultipartFile file,
            @RequestParam("folder") String folder,
            @RequestParam(value = "fileName", required = false) String fileName) {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "File tidak boleh kosong"));
        }

        log.info("Upload request: folder={}, originalName={}, size={} bytes",
                folder, file.getOriginalFilename(), file.getSize());

        String publicUrl = r2StorageService.upload(file, folder, fileName);

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "url", publicUrl,
                "folder", folder,
                "originalName", file.getOriginalFilename() != null ? file.getOriginalFilename() : ""
        ));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Delete
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Hapus file dari R2 berdasarkan object key.
     * <p>
     * {@code objectKey} adalah path relatif dalam bucket, misal {@code "posters/abc123-film.jpg"}.
     * Karena objectKey bisa mengandung slash, endpoint menggunakan wildcard {@code **}.
     *
     * @param objectKey path file dalam bucket (dari URL path, slash diizinkan)
     */
    @DeleteMapping("/**")
    @PreAuthorize("hasAuthority('SCOPE_ADMIN')")
    public ResponseEntity<Map<String, String>> deleteFile(
            @RequestAttribute("javax.servlet.forward.request_uri") String rawUri) {

        // Ekstrak objectKey dari path setelah /storage/
        String objectKey = rawUri.replaceFirst("^.*/storage/", "");

        log.info("Delete request: objectKey={}", objectKey);
        r2StorageService.delete(objectKey);

        return ResponseEntity.ok(Map.of(
                "message", "File berhasil dihapus",
                "objectKey", objectKey
        ));
    }

    /**
     * Versi alternatif delete yang menerima objectKey sebagai query parameter.
     * Lebih mudah digunakan dari frontend yang tidak mendukung path dengan slash.
     *
     * @param objectKey path file dalam bucket
     */
    @DeleteMapping
    @PreAuthorize("hasAuthority('SCOPE_ADMIN')")
    public ResponseEntity<Map<String, String>> deleteFileByQuery(
            @RequestParam("key") String objectKey) {

        log.info("Delete request (query): objectKey={}", objectKey);
        r2StorageService.delete(objectKey);

        return ResponseEntity.ok(Map.of(
                "message", "File berhasil dihapus",
                "objectKey", objectKey
        ));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Presigned URL — Download
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Generate presigned URL untuk download file privat secara sementara.
     * Digunakan untuk streaming video atau download konten berlisensi.
     *
     * @param objectKey  path file dalam bucket
     * @param expiryMins durasi validitas URL dalam menit (default: 60)
     * @return presigned URL
     */
    @GetMapping("/presign/download")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> presignDownload(
            @RequestParam("key") String objectKey,
            @RequestParam(value = "expiry", defaultValue = "60") int expiryMins) {

        log.debug("Presign download: key={}, expiry={}min", objectKey, expiryMins);

        URL presignedUrl = r2StorageService.generatePresignedDownloadUrl(
                objectKey,
                Duration.ofMinutes(Math.min(expiryMins, 1440)) // Maks 24 jam
        );

        return ResponseEntity.ok(Map.of(
                "url", presignedUrl.toString(),
                "objectKey", objectKey,
                "expiryMinutes", String.valueOf(expiryMins)
        ));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Presigned URL — Upload (client-side)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Generate presigned URL untuk upload langsung dari client ke R2.
     * Frontend mengirim PUT request ke URL ini dengan file binary.
     * Mengurangi beban server karena file tidak melewati backend.
     *
     * @param objectKey   path yang akan digunakan di bucket
     * @param contentType MIME type file, misal {@code "image/webp"}
     * @param expiryMins  durasi validitas URL (default: 15 menit)
     * @return presigned PUT URL
     */
    @PostMapping("/presign/upload")
    @PreAuthorize("hasAuthority('SCOPE_ADMIN')")
    public ResponseEntity<Map<String, String>> presignUpload(
            @RequestParam("key") String objectKey,
            @RequestParam("contentType") String contentType,
            @RequestParam(value = "expiry", defaultValue = "15") int expiryMins) {

        log.info("Presign upload: key={}, contentType={}, expiry={}min",
                objectKey, contentType, expiryMins);

        URL presignedUrl = r2StorageService.generatePresignedUploadUrl(
                objectKey,
                contentType,
                Duration.ofMinutes(Math.min(expiryMins, 60)) // Maks 1 jam
        );

        return ResponseEntity.ok(Map.of(
                "uploadUrl", presignedUrl.toString(),
                "objectKey", objectKey,
                "method", "PUT",
                "contentType", contentType
        ));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Exists check
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Cek apakah sebuah file ada di R2.
     *
     * @param objectKey path file dalam bucket
     * @return {@code {"exists": true/false, "objectKey": "..."}}
     */
    @GetMapping("/exists")
    @PreAuthorize("hasAuthority('SCOPE_ADMIN')")
    public ResponseEntity<Map<String, Object>> checkExists(@RequestParam("key") String objectKey) {
        boolean exists = r2StorageService.exists(objectKey);
        return ResponseEntity.ok(Map.of(
                "exists", exists,
                "objectKey", objectKey
        ));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Exception handler khusus R2
    // ─────────────────────────────────────────────────────────────────────────

    @ExceptionHandler(R2StorageException.class)
    public ResponseEntity<Map<String, String>> handleR2Exception(R2StorageException ex) {
        log.error("R2 Storage error: {}", ex.getMessage(), ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                        "error", "Storage Error",
                        "message", ex.getMessage()
                ));
    }
}
