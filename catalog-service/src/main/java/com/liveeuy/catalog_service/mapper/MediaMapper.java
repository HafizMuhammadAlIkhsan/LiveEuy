package com.liveeuy.catalog_service.mapper;

import com.liveeuy.catalog_service.dto.request.EpisodeRequestDTO;
import com.liveeuy.catalog_service.dto.request.MediaRequestDTO;
import com.liveeuy.catalog_service.dto.request.MovieRequestDTO;
import com.liveeuy.catalog_service.dto.request.SeasonRequestDTO;
import com.liveeuy.catalog_service.dto.request.TvSeriesRequestDTO;
import com.liveeuy.catalog_service.dto.response.*;
import com.liveeuy.catalog_service.entity.*;
import com.liveeuy.catalog_service.entity.enums.VideoQuality;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class MediaMapper {

    public Media toEntity(MediaRequestDTO dto) {
        if (dto == null) return null;

        if (dto instanceof MovieRequestDTO movieDto) {
            Movie movie = new Movie();
            mapBaseMediaFields(dto, movie);
            movie.setDurationSeconds(movieDto.getDurationSeconds());
            movie.setVideoUrl(movieDto.getVideoUrl());
            if (movieDto.getQuality() != null) {
                movie.setQuality(VideoQuality.valueOf(movieDto.getQuality().toUpperCase()));
            }
            movie.setAudio(movieDto.getAudio());
            return movie;
        } else if (dto instanceof TvSeriesRequestDTO tvDto) {
            TvSeries tvSeries = new TvSeries();
            mapBaseMediaFields(tvDto, tvSeries);
            return tvSeries;
        }
        throw new IllegalArgumentException("Tipe DTO tidak dikenali");
    }

    private void mapBaseMediaFields(MediaRequestDTO dto, Media media) {
        media.setTitle(dto.getTitle());
        media.setOriginalTitle(dto.getOriginalTitle());
        media.setTagline(dto.getTagline());
        media.setOverview(dto.getOverview());
        media.setPosterUrl(dto.getPosterUrl());
        media.setBackdropUrl(dto.getBackdropUrl());
        media.setReleaseYear(dto.getReleaseYear());
        media.setAgeRating(dto.getAgeRating());
    }

    public MediaResponseDTO toDTO(Media media) {
        if (media == null) return null;

        if (media instanceof Movie movie) {
            MovieResponseDTO dto = new MovieResponseDTO();
            mapBaseDtoFields(movie, dto);
            dto.setDurationSeconds(movie.getDurationSeconds());
            dto.setVideoUrl(movie.getVideoUrl());
            dto.setQuality(movie.getQuality());
            dto.setAudio(movie.getAudio());
            return dto;
        } else if (media instanceof TvSeries tv) {
            TvSeriesResponseDTO dto = new TvSeriesResponseDTO();
            mapBaseDtoFields(tv, dto);
            if (tv.getSeasons() != null) {
                dto.setSeasons(tv.getSeasons().stream().map(this::toSeasonDTO).collect(Collectors.toList()));
            }
            return dto;
        }
        return null;
    }

    private void mapBaseDtoFields(Media media, MediaResponseDTO dto) {
        dto.setId(media.getId());
        dto.setTitle(media.getTitle());
        dto.setOriginalTitle(media.getOriginalTitle());
        dto.setType(media.getType());
        dto.setTagline(media.getTagline());
        dto.setOverview(media.getOverview());
        dto.setPosterUrl(media.getPosterUrl());
        dto.setBackdropUrl(media.getBackdropUrl());
        dto.setTrailerUrl(media.getTrailerUrl());
        dto.setReleaseYear(media.getReleaseYear());
        dto.setAgeRating(media.getAgeRating());
        
        if (media.getCastAndCrew() != null) {
            dto.setCastAndCrew(media.getCastAndCrew().stream()
                    .map(this::toPersonDTO)
                    .collect(Collectors.toList()));
        }
    }

    private PersonResponseDTO toPersonDTO(MediaCast cast) {
        return PersonResponseDTO.builder()
                .id(cast.getPerson().getId())
                .name(cast.getPerson().getName())
                .profileImageUrl(cast.getPerson().getProfileImageUrl())
                .role(cast.getRole())
                .characterName(cast.getCharacterName())
                .castOrder(cast.getCastOrder())
                .build();
    }

    public SeasonResponseDTO toSeasonDTO(Season season) {
        return SeasonResponseDTO.builder()
                .id(season.getId())
                .seasonNumber(season.getSeasonNumber())
                .title(season.getTitle())
                .posterUrl(season.getPosterUrl())
                .build();
    }

    public EpisodeResponseDTO toEpisodeDTO(Episode episode) {
        if (episode == null) return null;
        return EpisodeResponseDTO.builder()
                .id(episode.getId())
                .episodeNumber(episode.getEpisodeNumber())
                .title(episode.getTitle())
                .overview(episode.getOverview())
                .durationSeconds(episode.getDurationSeconds())
                .thumbnailUrl(episode.getThumbnailUrl())
                .videoUrl(episode.getVideoUrl())
                .quality(episode.getQuality())
                .build();
    }

    public void updateEntityFromDto(MediaRequestDTO dto, Media existingMedia) {
        if (dto == null || existingMedia == null) return;

        existingMedia.setOriginalTitle(dto.getOriginalTitle());
        existingMedia.setTagline(dto.getTagline());
        existingMedia.setOverview(dto.getOverview());
        existingMedia.setPosterUrl(dto.getPosterUrl());
        existingMedia.setBackdropUrl(dto.getBackdropUrl());
        existingMedia.setReleaseYear(dto.getReleaseYear());
        existingMedia.setAgeRating(dto.getAgeRating());

        if (dto instanceof MovieRequestDTO movieDto && existingMedia instanceof Movie movie) {
            movie.setDurationSeconds(movieDto.getDurationSeconds());
            movie.setVideoUrl(movieDto.getVideoUrl());
            if (movieDto.getQuality() != null) {
                movie.setQuality(VideoQuality.valueOf(movieDto.getQuality().toUpperCase()));
            }
            movie.setAudio(movieDto.getAudio());
        }
        
    }

    public Season toSeasonEntity(SeasonRequestDTO dto) {
        if (dto == null) return null;
        Season season = new Season();
        season.setSeasonNumber(dto.getSeasonNumber());
        season.setTitle(dto.getTitle());
        season.setPosterUrl(dto.getPosterUrl());
        return season;
    }

    public Episode toEpisodeEntity(EpisodeRequestDTO dto) {
        if (dto == null) return null;
        Episode episode = new Episode();
        episode.setEpisodeNumber(dto.getEpisodeNumber());
        episode.setTitle(dto.getTitle());
        episode.setOverview(dto.getOverview());
        episode.setDurationSeconds(dto.getDurationSeconds());
        episode.setThumbnailUrl(dto.getThumbnailUrl());
        episode.setVideoUrl(dto.getVideoUrl());
        if (dto.getQuality() != null) {
            episode.setQuality(VideoQuality.valueOf(dto.getQuality().toUpperCase()));
        }
        return episode;
    }
}
