package com.liveeuy.catalog_service.service;

import com.liveeuy.catalog_service.dto.request.MediaRequestDTO;
import com.liveeuy.catalog_service.dto.response.MediaResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface MediaService {

    MediaResponseDTO getFeaturedMedia();

    Page<MediaResponseDTO> getAllMedia(String type, String genre, String search, String sortBy, int page, int size);
    Page<MediaResponseDTO> getAllMedia(String type, String genre, String search, String sortBy, String country, Integer year, int page, int size);

    MediaResponseDTO getMediaById(String id);

    List<MediaResponseDTO> getMediaByIds(List<String> ids);

    MediaResponseDTO createMedia(MediaRequestDTO requestDTO);

    MediaResponseDTO updateMedia(String id, MediaRequestDTO requestDTO);

    void deleteMedia(String id);

    /**
     * Upload poster image ke Cloudflare R2 dan perbarui posterUrl pada media.
     *
     * @param mediaId  ID media yang akan diperbarui posternya
     * @param poster   file gambar poster (jpg, png, webp)
     * @return MediaResponseDTO dengan posterUrl yang sudah diperbarui
     */
    MediaResponseDTO uploadPoster(String mediaId, MultipartFile poster);

    /**
     * Upload backdrop image ke Cloudflare R2 dan perbarui backdropUrl pada media.
     *
     * @param mediaId  ID media yang akan diperbarui backdropnya
     * @param backdrop file gambar backdrop (jpg, png, webp)
     * @return MediaResponseDTO dengan backdropUrl yang sudah diperbarui
     */
    MediaResponseDTO uploadBackdrop(String mediaId, MultipartFile backdrop);

    /**
     * Upload trailer/teaser video ke Cloudflare R2 dan perbarui trailerUrl pada media.
     *
     * @param mediaId ID media yang akan diperbarui trailerUrl-nya
     * @param trailer file video trailer (mp4, webm)
     * @return MediaResponseDTO dengan trailerUrl yang sudah diperbarui
     */
    MediaResponseDTO uploadTrailer(String mediaId, MultipartFile trailer);
}
