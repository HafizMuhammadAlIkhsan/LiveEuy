package com.liveeuy.catalog_service.controller;

import com.liveeuy.catalog_service.dto.ApiResponse;
import com.liveeuy.catalog_service.dto.request.EpisodeRequestDTO;
import com.liveeuy.catalog_service.dto.request.SeasonRequestDTO;
import com.liveeuy.catalog_service.dto.response.EpisodeResponseDTO;
import com.liveeuy.catalog_service.dto.response.SeasonResponseDTO;
import com.liveeuy.catalog_service.service.TvHierarchyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class TvHierarchyController {

    private final TvHierarchyService tvHierarchyService;

    @PostMapping("/media/{tvId}/seasons")
    public ResponseEntity<ApiResponse<SeasonResponseDTO>> addSeason(
            @PathVariable String tvId,
            @Valid @RequestBody SeasonRequestDTO requestDTO) {
        
        SeasonResponseDTO createdSeason = tvHierarchyService.addSeasonToTvSeries(tvId, requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(createdSeason, "Season berhasil ditambahkan ke TV Series"));
    }

    @PostMapping("/seasons/{seasonId}/episodes")
    public ResponseEntity<ApiResponse<EpisodeResponseDTO>> addEpisode(
            @PathVariable String seasonId,
            @Valid @RequestBody EpisodeRequestDTO requestDTO) {
        
        EpisodeResponseDTO createdEpisode = tvHierarchyService.addEpisodeToSeason(seasonId, requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(createdEpisode, "Episode berhasil ditambahkan ke Season"));
    }
}