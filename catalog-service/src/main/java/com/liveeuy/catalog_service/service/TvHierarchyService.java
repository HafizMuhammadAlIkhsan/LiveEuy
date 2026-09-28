package com.liveeuy.catalog_service.service;

import com.liveeuy.catalog_service.dto.request.EpisodeRequestDTO;
import com.liveeuy.catalog_service.dto.request.SeasonRequestDTO;
import com.liveeuy.catalog_service.dto.response.EpisodeResponseDTO;
import com.liveeuy.catalog_service.dto.response.SeasonResponseDTO;

public interface TvHierarchyService {
    SeasonResponseDTO addSeasonToTvSeries(String tvId, SeasonRequestDTO requestDTO);
    EpisodeResponseDTO addEpisodeToSeason(String seasonId, EpisodeRequestDTO requestDTO);
}