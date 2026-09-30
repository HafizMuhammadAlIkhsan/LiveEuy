package com.liveeuy.catalog_service.storage;

import com.liveeuy.catalog_service.config.R2Properties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.time.Duration;
import java.util.UUID;

/**
 * Implementasi {@link R2StorageService} menggunakan AWS SDK v2 yang terhubung ke Cloudflare R2.
 * <p>
 * Semua exception dari AWS SDK dibungkus menjadi {@link R2StorageException}
 * agar layer controller dan service tidak perlu tahu detail SDK.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class R2StorageServiceImpl implements R2StorageService {

    private final S3Client s3Client;
    private final S3Presigner s3Presigner;
    private final R2Properties r2Properties;

    // ─────────────────────────────────────────────────────────────────────────
    // Upload
    // ─────────────────────────────────────────────────────────────────────────

    @Override
    public String upload(MultipartFile file, String folder, String fileName) {
        // Sanitasi nama file: hapus path traversal, pertahankan extension
        String safeFileName = sanitizeFileName(fileName != null ? fileName
                : file.getOriginalFilename());
        String objectKey = buildObjectKey(folder, safeFileName);

        log.info("Mengupload file ke R2: bucket={}, key={}, size={} bytes",
                r2Properties.getBucketName(), objectKey, file.getSize());

        try {
            PutObjectRequest putRequest = PutObjectRequest.builder()
                    .bucket(r2Properties.getBucketName())
                    .key(objectKey)
                    .contentType(resolveContentType(file))
                    .contentLength(file.getSize())
                    // Cache-Control: poster & thumbnail bisa di-cache 7 hari
                    .cacheControl("public, max-age=604800, immutable")
                    .build();

            s3Client.putObject(putRequest, RequestBody.fromBytes(file.getBytes()));
            log.info("Upload berhasil: {}", objectKey);
            return buildPublicUrl(objectKey);

        } catch (IOException e) {
            throw new R2StorageException("Gagal membaca file untuk upload: " + e.getMessage(), e);
        } catch (S3Exception e) {
            throw new R2StorageException("Upload ke R2 gagal: " + e.awsErrorDetails().errorMessage(), e);
        }
    }

    @Override
    public String uploadStream(InputStream inputStream, String objectKey,
                               String contentType, long contentLength) {
        log.info("Mengupload stream ke R2: bucket={}, key={}", r2Properties.getBucketName(), objectKey);

        try {
            PutObjectRequest putRequest = PutObjectRequest.builder()
                    .bucket(r2Properties.getBucketName())
                    .key(objectKey)
                    .contentType(contentType)
                    .contentLength(contentLength)
                    .build();

            s3Client.putObject(putRequest, RequestBody.fromInputStream(inputStream, contentLength));
            log.info("Upload stream berhasil: {}", objectKey);
            return buildPublicUrl(objectKey);

        } catch (S3Exception e) {
            throw new R2StorageException("Upload stream ke R2 gagal: " + e.awsErrorDetails().errorMessage(), e);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Delete
    // ─────────────────────────────────────────────────────────────────────────

    @Override
    public void delete(String objectKey) {
        log.info("Menghapus file dari R2: bucket={}, key={}", r2Properties.getBucketName(), objectKey);

        try {
            DeleteObjectRequest deleteRequest = DeleteObjectRequest.builder()
                    .bucket(r2Properties.getBucketName())
                    .key(objectKey)
                    .build();

            s3Client.deleteObject(deleteRequest);
            log.info("File berhasil dihapus dari R2: {}", objectKey);

        } catch (S3Exception e) {
            // Log sebagai warning — file mungkin sudah tidak ada
            log.warn("Gagal menghapus dari R2 (mungkin sudah tidak ada): key={}, error={}",
                    objectKey, e.awsErrorDetails().errorMessage());
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Presigned URLs
    // ─────────────────────────────────────────────────────────────────────────

    @Override
    public URL generatePresignedDownloadUrl(String objectKey, Duration expiry) {
        log.debug("Membuat presigned download URL: key={}, expiry={}", objectKey, expiry);

        try {
            GetObjectRequest getRequest = GetObjectRequest.builder()
                    .bucket(r2Properties.getBucketName())
                    .key(objectKey)
                    .build();

            GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                    .signatureDuration(expiry)
                    .getObjectRequest(getRequest)
                    .build();

            URL url = s3Presigner.presignGetObject(presignRequest).url();
            log.debug("Presigned download URL dibuat: {}", url);
            return url;

        } catch (S3Exception e) {
            throw new R2StorageException("Gagal membuat presigned download URL: " + e.getMessage(), e);
        }
    }

    @Override
    public URL generatePresignedUploadUrl(String objectKey, String contentType, Duration expiry) {
        log.debug("Membuat presigned upload URL: key={}, contentType={}, expiry={}",
                objectKey, contentType, expiry);

        try {
            PutObjectRequest putRequest = PutObjectRequest.builder()
                    .bucket(r2Properties.getBucketName())
                    .key(objectKey)
                    .contentType(contentType)
                    .build();

            PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
                    .signatureDuration(expiry)
                    .putObjectRequest(putRequest)
                    .build();

            URL url = s3Presigner.presignPutObject(presignRequest).url();
            log.debug("Presigned upload URL dibuat: {}", url);
            return url;

        } catch (S3Exception e) {
            throw new R2StorageException("Gagal membuat presigned upload URL: " + e.getMessage(), e);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Utility
    // ─────────────────────────────────────────────────────────────────────────

    @Override
    public boolean exists(String objectKey) {
        try {
            s3Client.headObject(HeadObjectRequest.builder()
                    .bucket(r2Properties.getBucketName())
                    .key(objectKey)
                    .build());
            return true;
        } catch (NoSuchKeyException e) {
            return false;
        } catch (S3Exception e) {
            log.warn("Error saat cek keberadaan file R2: key={}, error={}", objectKey, e.getMessage());
            return false;
        }
    }

    @Override
    public String buildPublicUrl(String objectKey) {
        String publicUrl = r2Properties.getPublicUrl();
        if (StringUtils.hasText(publicUrl)) {
            // Custom domain: https://cdn.liveeuy.com/posters/film.jpg
            return publicUrl.stripTrailing() + "/" + objectKey;
        }
        // Fallback ke URL bucket R2
        return r2Properties.getEndpointUrl() + "/" + r2Properties.getBucketName() + "/" + objectKey;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Private helpers
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Bangun object key dari folder + nama file unik berbasis UUID.
     * Contoh: {@code "posters/a1b2c3d4-poster.jpg"}
     */
    private String buildObjectKey(String folder, String safeFileName) {
        String uniquePrefix = UUID.randomUUID().toString().substring(0, 8);
        String normalizedFolder = folder.replaceAll("[^a-zA-Z0-9/_-]", "").stripTrailing();
        return normalizedFolder + "/" + uniquePrefix + "-" + safeFileName;
    }

    /**
     * Sanitasi nama file: hapus path traversal, pertahankan extension.
     */
    private String sanitizeFileName(String originalFilename) {
        if (!StringUtils.hasText(originalFilename)) {
            return UUID.randomUUID() + ".bin";
        }
        // Ambil hanya nama file (bukan path)
        String clean = new java.io.File(originalFilename).getName();
        // Hapus karakter tidak aman
        clean = clean.replaceAll("[^a-zA-Z0-9._-]", "_");
        return clean.isEmpty() ? UUID.randomUUID() + ".bin" : clean;
    }

    /**
     * Resolusi Content-Type dari MultipartFile, fallback ke application/octet-stream.
     */
    private String resolveContentType(MultipartFile file) {
        String ct = file.getContentType();
        return (ct != null && !ct.isBlank()) ? ct : "application/octet-stream";
    }
}
