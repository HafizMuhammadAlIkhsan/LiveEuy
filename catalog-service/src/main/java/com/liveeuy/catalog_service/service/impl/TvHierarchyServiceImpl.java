package com.liveeuy.catalog_service.service.impl;

import com.liveeuy.catalog_service.dto.request.EpisodeRequestDTO;
import com.liveeuy.catalog_service.dto.request.SeasonRequestDTO;
import com.liveeuy.catalog_service.dto.response.EpisodeResponseDTO;
import com.liveeuy.catalog_service.dto.response.SeasonResponseDTO;
import com.liveeuy.catalog_service.entity.Episode;
import com.liveeuy.catalog_service.entity.Media;
import com.liveeuy.catalog_service.entity.Season;
import com.liveeuy.catalog_service.entity.TvSeries;
import com.liveeuy.catalog_service.exception.ResourceNotFoundException;
import com.liveeuy.catalog_service.mapper.MediaMapper;
import com.liveeuy.catalog_service.repository.EpisodeRepository;
import com.liveeuy.catalog_service.repository.MediaRepository;
import com.liveeuy.catalog_service.repository.SeasonRepository;
import com.liveeuy.catalog_service.service.TvHierarchyService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TvHierarchyServiceImpl implements TvHierarchyService {

    private final MediaRepository mediaRepository;
    private final SeasonRepository seasonRepository;
    private final EpisodeRepository episodeRepository;
    private final MediaMapper mediaMapper;

    @Override
    @Transactional
    public SeasonResponseDTO addSeasonToTvSeries(String tvId, SeasonRequestDTO requestDTO) {
        Media media = mediaRepository.findById(tvId)
                .orElseThrow(() -> new ResourceNotFoundException("Media dengan ID '" + tvId + "' tidak ditemukan."));

        if (!(media instanceof TvSeries tvSeries)) {
            throw new IllegalArgumentException("Gagal menambahkan season: Media ini adalah Movie, bukan TV Series.");
        }

        Season season = mediaMapper.toSeasonEntity(requestDTO);
        season.setTvSeries(tvSeries);

        Season savedSeason = seasonRepository.save(season);

        return mediaMapper.toSeasonDTO(savedSeason); 
    }

    @Override
    @Transactional
    public EpisodeResponseDTO addEpisodeToSeason(String seasonId, EpisodeRequestDTO requestDTO) {
        Season season = seasonRepository.findById(seasonId)
                .orElseThrow(() -> new ResourceNotFoundException("Season dengan ID '" + seasonId + "' tidak ditemukan."));

        Episode episode = mediaMapper.toEpisodeEntity(requestDTO);
        episode.setSeason(season);

        Episode savedEpisode = episodeRepository.save(episode);

        return mediaMapper.toEpisodeDTO(savedEpisode);
    }
}