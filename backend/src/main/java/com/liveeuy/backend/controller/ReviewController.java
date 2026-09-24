package com.liveeuy.backend.controller;

import com.liveeuy.backend.dto.ApiResponse;
import com.liveeuy.backend.dto.ReviewRequest;
import com.liveeuy.backend.model.Review;
import com.liveeuy.backend.service.MediaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/media/{mediaId}/reviews")
@Tag(name = "Ulasan & Rating Penonton", description = "Endpoints untuk mengirimkan ulasan baru dan rating bintang untuk judul film/serial")
public class ReviewController {

    private final MediaService mediaService;

    public ReviewController(MediaService mediaService) {
        this.mediaService = mediaService;
    }

    @PostMapping
    @Operation(summary = "Kirim ulasan dan rating baru", description = "Menambahkan ulasan penonton baru pada judul media yang ditentukan.")
    public ResponseEntity<ApiResponse<Review>> addReview(
            @Parameter(description = "ID media yang diulas", example = "cyberpunk-neo-nusantara")
            @PathVariable String mediaId,
            @Valid @RequestBody ReviewRequest request
    ) {
        try {
            Review created = mediaService.addReview(mediaId, request);
            return ResponseEntity.ok(ApiResponse.success("Ulasan berhasil dikirimkan", created));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(ApiResponse.error(e.getMessage()));
        }
    }
}
