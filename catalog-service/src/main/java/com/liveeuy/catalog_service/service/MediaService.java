package com.liveeuy.catalog_service.service;

import com.liveeuy.catalog_service.dto.request.MediaRequestDTO;
import com.liveeuy.catalog_service.dto.response.MediaItemDTO;

import java.util.List;

/**
 * Interface Service untuk katalog media.
 * Mendefinisikan kontrak (contract) semua operasi bisnis yang tersedia.
 * Controller hanya berinteraksi dengan interface ini, bukan implementasinya (DIP principle).
 */
public interface MediaService {

    /**
     * Mengambil semua media, dengan filter opsional berdasarkan tipe, genre, dan pencarian judul.
     */
    List<MediaItemDTO> getAllMedia(String type, String genre, String search, String sortBy);

    /**
     * Mengambil satu media berdasarkan ID-nya.
     */
    MediaItemDTO getMediaById(String id);

    /**
     * Mengambil satu media yang ditandai sebagai isFeatured=true.
     * Digunakan sebagai health check endpoint oleh Frontend.
     */
    MediaItemDTO getFeaturedMedia();

    /**
     * Mengambil daftar media yang sedang trending.
     */
    List<MediaItemDTO> getTrendingMedia();

    /**
     * Menyimpan satu media baru ke database.
     */
    MediaItemDTO createMedia(MediaRequestDTO requestDTO);

    /**
     * Memperbarui data media yang sudah ada berdasarkan ID.
     */
    MediaItemDTO updateMedia(String id, MediaRequestDTO requestDTO);

    /**
     * Menghapus data media berdasarkan ID.
     */
    void deleteMedia(String id);
}
