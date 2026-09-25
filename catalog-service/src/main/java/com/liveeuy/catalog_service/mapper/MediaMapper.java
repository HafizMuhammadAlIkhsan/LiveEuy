package com.liveeuy.catalog_service.mapper;

import com.liveeuy.catalog_service.dto.request.MediaRequestDTO;
import com.liveeuy.catalog_service.dto.response.MediaItemDTO;
import com.liveeuy.catalog_service.entity.Media;
import org.springframework.stereotype.Component;

/**
 * Mapper untuk mengubah (convert) antara Entity Media, RequestDTO, dan ResponseDTO.
 * Pemisahan tanggung jawab ini menjaga Controller dan Service tetap bersih (Clean Code).
 */
@Component
public class MediaMapper {

    /**
     * Mengubah Entity {@link Media} menjadi {@link MediaItemDTO} untuk dikirim ke Frontend.
     */
    public MediaItemDTO toDTO(Media media) {
        if (media == null) return null;
        return MediaItemDTO.builder()
                .id(media.getId())
                .title(media.getTitle())
                .originalTitle(media.getOriginalTitle())
                .type(media.getType())
                .tagline(media.getTagline())
                .overview(media.getOverview())
                .posterUrl(media.getPosterUrl())
                .backdropUrl(media.getBackdropUrl())
                .logoUrl(media.getLogoUrl())
                .releaseYear(media.getReleaseYear())
                .country(media.getCountry())
                .rating(media.getRating())
                .matchScore(media.getMatchScore())
                .ageRating(media.getAgeRating())
                .duration(media.getDuration())
                .totalSeasons(media.getTotalSeasons())
                .genres(media.getGenres())
                .cast(media.getCastList())  // Perhatikan: castList (entity) -> cast (DTO/Frontend)
                .director(media.getDirector())
                .videoUrl(media.getVideoUrl())
                .trailerUrl(media.getTrailerUrl())
                .isTrending(media.getIsTrending())
                .isFeatured(media.getIsFeatured())
                .topRank(media.getTopRank())
                .quality(media.getQuality())
                .audio(media.getAudio())
                .build();
    }

    /**
     * Mengubah {@link MediaRequestDTO} (data dari Frontend) menjadi Entity {@link Media}
     * untuk disimpan ke database. ID tidak di-set karena akan di-generate otomatis oleh DB.
     */
    public Media toEntity(MediaRequestDTO dto) {
        if (dto == null) return null;
        Media media = new Media();
        media.setTitle(dto.getTitle());
        media.setOriginalTitle(dto.getOriginalTitle());
        media.setType(dto.getType());
        media.setTagline(dto.getTagline());
        media.setOverview(dto.getOverview());
        media.setPosterUrl(dto.getPosterUrl());
        media.setBackdropUrl(dto.getBackdropUrl());
        media.setLogoUrl(dto.getLogoUrl());
        media.setReleaseYear(dto.getReleaseYear());
        media.setCountry(dto.getCountry());
        media.setRating(dto.getRating());
        media.setMatchScore(dto.getMatchScore());
        media.setAgeRating(dto.getAgeRating());
        media.setDuration(dto.getDuration());
        media.setTotalSeasons(dto.getTotalSeasons());
        media.setGenres(dto.getGenres());
        media.setCastList(dto.getCast()); // Perhatikan: cast (DTO) -> castList (entity)
        media.setDirector(dto.getDirector());
        media.setVideoUrl(dto.getVideoUrl());
        media.setTrailerUrl(dto.getTrailerUrl());
        media.setIsTrending(dto.getIsTrending());
        media.setIsFeatured(dto.getIsFeatured());
        media.setTopRank(dto.getTopRank());
        media.setQuality(dto.getQuality());
        media.setAudio(dto.getAudio());
        return media;
    }
}
