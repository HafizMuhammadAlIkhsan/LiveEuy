package com.liveeuy.catalog_service.controller;

import com.liveeuy.catalog_service.dto.ApiResponse;
import com.liveeuy.catalog_service.dto.request.MediaRequestDTO;
import com.liveeuy.catalog_service.dto.request.LinkTranscodeJobRequestDTO;
import com.liveeuy.catalog_service.dto.response.MediaResponseDTO;
import com.liveeuy.catalog_service.service.MediaService;
import com.liveeuy.catalog_service.config.MessageConstants;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;          
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;

import java.util.List;

@RestController
@RequestMapping("/media")
@RequiredArgsConstructor
public class MediaController {

    private final MediaService mediaService;

    @GetMapping("/featured")
    public ResponseEntity<ApiResponse<MediaResponseDTO>> getFeaturedMedia() {
        MediaResponseDTO featured = mediaService.getFeaturedMedia();
        if (featured == null) {
            return ResponseEntity.ok(ApiResponse.success(null, MessageConstants.Media.FEATURED_EMPTY));
        }
        return ResponseEntity.ok(ApiResponse.success(featured, MessageConstants.Media.FEATURED_SUCCESS));
    }

    @GetMapping("/feed")
    public ResponseEntity<ApiResponse<Page<MediaResponseDTO>>> getPersonalizedFeed(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        String tier = jwt != null ? jwt.getClaimAsString("tier") : null;
        Page<MediaResponseDTO> mediaPage = mediaService.getAllMedia(null, null, null, "rating", page, size);
        String message = (tier != null && !tier.isBlank())
                ? MessageConstants.Media.FEED_MEMBER_PREFIX + tier
                : MessageConstants.Media.FEED_DEFAULT;

        return ResponseEntity.ok(ApiResponse.success(mediaPage, message));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<MediaResponseDTO>>> getAllMedia(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String genre,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String sortBy,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Page<MediaResponseDTO> mediaPage = mediaService.getAllMedia(type, genre, search, sortBy, page, size);
        return ResponseEntity.ok(ApiResponse.success(mediaPage));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MediaResponseDTO>> getMediaById(@PathVariable String id) {
        MediaResponseDTO media = mediaService.getMediaById(id);
        return ResponseEntity.ok(ApiResponse.success(media));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<MediaResponseDTO>> createMedia(@Valid @RequestBody MediaRequestDTO requestDTO) {
        MediaResponseDTO createdMedia = mediaService.createMedia(requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(createdMedia, MessageConstants.Media.CREATED));
    }

    @PostMapping("/batch")
    public ResponseEntity<ApiResponse<List<MediaResponseDTO>>> getMediaByIds(@RequestBody List<String> ids) {
        List<MediaResponseDTO> mediaList = mediaService.getMediaByIds(ids);
        return ResponseEntity.ok(ApiResponse.success(mediaList));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<MediaResponseDTO>> updateMedia(
            @PathVariable String id,
            @Valid @RequestBody MediaRequestDTO requestDTO) {
        MediaResponseDTO updatedMedia = mediaService.updateMedia(id, requestDTO);
        return ResponseEntity.ok(ApiResponse.success(updatedMedia, MessageConstants.Media.UPDATED));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteMedia(@PathVariable String id) {
        mediaService.deleteMedia(id);
        return ResponseEntity.ok(ApiResponse.success(null, MessageConstants.Media.DELETED));
    }

    @PatchMapping("/{id}/transcode-job")
    public ResponseEntity<ApiResponse<MediaResponseDTO>> linkTranscodeJob(
            @PathVariable String id,
            @Valid @RequestBody LinkTranscodeJobRequestDTO requestDTO,
            @RequestHeader(name = "Authorization", required = false) String bearerToken) {
        MediaResponseDTO response = mediaService.linkTranscodeJob(id, requestDTO.getJobId(), bearerToken);
        return ResponseEntity.ok(ApiResponse.success(response, MessageConstants.Media.TRANSCODE_LINKED));
    }
    
    @PostMapping("/{id}/sync-transcode")
    public ResponseEntity<ApiResponse<MediaResponseDTO>> syncTranscodeStatus(
            @PathVariable String id,
            @RequestHeader(name = "Authorization", required = false) String bearerToken) {
        MediaResponseDTO response = mediaService.syncTranscodeStatus(id, bearerToken);
        return ResponseEntity.ok(ApiResponse.success(response, MessageConstants.Media.TRANSCODE_SYNCED));
    }
}
