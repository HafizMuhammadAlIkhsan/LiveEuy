package com.liveeuy.catalog_service.storage;

import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.net.URL;
import java.time.Duration;

/**
 * Port (interface) untuk semua operasi penyimpanan file di Cloudflare R2.
 * <p>
 * Semua method menggunakan {@code objectKey} — path relatif dalam bucket,
 * misalnya {@code posters/avatar-user-123.webp} atau {@code trailers/oppenheimer-trailer.mp4}.
 */
public interface R2StorageService {

    /**
     * Upload file dari MultipartFile (biasanya dari HTTP request).
     *
     * @param file      file yang diupload
     * @param folder    subfolder dalam bucket, misal {@code "posters"}, {@code "trailers"}
     * @param fileName  nama file di dalam folder (tanpa path prefix)
     * @return URL publik atau object key yang dapat digunakan untuk mengakses file
     */
    String upload(MultipartFile file, String folder, String fileName);

    /**
     * Upload file dari InputStream (berguna untuk konversi format atau test).
     *
     * @param inputStream  stream konten file
     * @param objectKey    path lengkap dalam bucket, misal {@code "posters/film.jpg"}
     * @param contentType  MIME type file, misal {@code "image/webp"}
     * @param contentLength ukuran file dalam bytes
     * @return URL publik atau object key
     */
    String uploadStream(InputStream inputStream, String objectKey, String contentType, long contentLength);

    /**
     * Hapus file dari R2 berdasarkan object key-nya.
     *
     * @param objectKey path file dalam bucket, misal {@code "posters/film.jpg"}
     */
    void delete(String objectKey);

    /**
     * Buat presigned URL untuk download sementara (tanpa autentikasi publik).
     * Cocok untuk file privat seperti konten video streaming.
     *
     * @param objectKey path file dalam bucket
     * @param expiry    durasi validitas URL
     * @return URL presigned yang dapat diakses selama durasi {@code expiry}
     */
    URL generatePresignedDownloadUrl(String objectKey, Duration expiry);

    /**
     * Buat presigned URL untuk upload langsung dari browser/app (client-side upload).
     * Menghindari file melewati backend, mengurangi beban server.
     *
     * @param objectKey   path file yang akan diupload di bucket
     * @param contentType MIME type yang diizinkan
     * @param expiry      durasi validitas URL upload
     * @return URL presigned PUT yang dapat digunakan langsung oleh client
     */
    URL generatePresignedUploadUrl(String objectKey, String contentType, Duration expiry);

    /**
     * Cek apakah sebuah objek ada di bucket.
     *
     * @param objectKey path file dalam bucket
     * @return {@code true} jika file ada
     */
    boolean exists(String objectKey);

    /**
     * Bangun URL publik untuk object key menggunakan custom domain (jika dikonfigurasi)
     * atau URL bucket R2 default.
     *
     * @param objectKey path file dalam bucket
     * @return URL publik lengkap
     */
    String buildPublicUrl(String objectKey);
}
