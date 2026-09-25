package com.liveeuy.catalog_service.service.impl;

import com.liveeuy.catalog_service.dto.request.MediaRequestDTO;
import com.liveeuy.catalog_service.dto.response.MediaItemDTO;
import com.liveeuy.catalog_service.entity.Media;
import com.liveeuy.catalog_service.exception.ResourceNotFoundException;
import com.liveeuy.catalog_service.mapper.MediaMapper;
import com.liveeuy.catalog_service.repository.MediaRepository;
import com.liveeuy.catalog_service.service.MediaService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementasi dari {@link MediaService}.
 * Semua logika bisnis berada di sini, bukan di Controller.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MediaServiceImpl implements MediaService {

    private final MediaRepository mediaRepository;
    private final MediaMapper mediaMapper;

    @Override
    public List<MediaItemDTO> getAllMedia(String type, String genre, String search, String sortBy) {
        List<Media> mediaList;

        if (search != null && !search.isBlank()) {
            mediaList = mediaRepository.findByTitleContainingIgnoreCase(search);
        } else if (type != null && !type.isBlank() && !type.equalsIgnoreCase("all")) {
            mediaList = mediaRepository.findByTypeIgnoreCase(type);
        } else {
            mediaList = mediaRepository.findAll();
        }

        if (genre != null && !genre.isBlank() && !genre.equalsIgnoreCase("Semua Genre")) {
            final String finalGenre = genre;
            mediaList = mediaList.stream()
                    .filter(m -> m.getGenres() != null && m.getGenres().contains(finalGenre))
                    .collect(Collectors.toList());
        }

        if ("rating".equalsIgnoreCase(sortBy)) {
            mediaList.sort(Comparator.comparingDouble((Media m) -> m.getRating() != null ? m.getRating() : 0.0).reversed());
        } else if ("newest".equalsIgnoreCase(sortBy)) {
            mediaList.sort(Comparator.comparingInt((Media m) -> m.getReleaseYear() != null ? m.getReleaseYear() : 0).reversed());
        } else {
            mediaList.sort(Comparator.comparingInt(m -> m.getTopRank() != null ? m.getTopRank() : Integer.MAX_VALUE));
        }

        return mediaList.stream()
                .map(mediaMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public MediaItemDTO getMediaById(String id) {
        Media media = mediaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Media dengan ID '" + id + "' tidak ditemukan."));
        return mediaMapper.toDTO(media);
    }

    @Override
    public MediaItemDTO getFeaturedMedia() {
        return mediaRepository.findByIsFeaturedTrue().stream()
                .findFirst()
                .map(mediaMapper::toDTO)
                .orElse(null);
    }

    @Override
    public List<MediaItemDTO> getTrendingMedia() {
        return mediaRepository.findByIsTrendingTrue().stream()
                .map(mediaMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public MediaItemDTO createMedia(MediaRequestDTO requestDTO) {
        Media media = mediaMapper.toEntity(requestDTO);
        Media savedMedia = mediaRepository.save(media);
        return mediaMapper.toDTO(savedMedia);
    }

    @Override
    @Transactional
    public MediaItemDTO updateMedia(String id, MediaRequestDTO requestDTO) {
        Media existingMedia = mediaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Media dengan ID '" + id + "' tidak ditemukan."));

        Media updatedData = mediaMapper.toEntity(requestDTO);
        updatedData.setId(existingMedia.getId());

        Media savedMedia = mediaRepository.save(updatedData);
        return mediaMapper.toDTO(savedMedia);
    }

    @Override
    @Transactional
    public void deleteMedia(String id) {
        if (!mediaRepository.existsById(id)) {
            throw new ResourceNotFoundException("Media dengan ID '" + id + "' tidak ditemukan.");
        }
        mediaRepository.deleteById(id);
    }
}
