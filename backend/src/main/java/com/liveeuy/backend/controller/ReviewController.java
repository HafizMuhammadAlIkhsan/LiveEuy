package com.liveeuy.backend.controller;

import com.liveeuy.backend.dto.ApiResponse;
import com.liveeuy.backend.dto.ReviewRequest;
import com.liveeuy.backend.model.Review;
import com.liveeuy.backend.service.MediaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/media/{mediaId}/reviews")
@Tag(name = "Media Reviews", description = "Endpoints untuk membaca dan menulis ulasan rating penonton")
public class ReviewController {

    private final MediaService mediaService;

    public ReviewController(MediaService mediaService) {
        this.mediaService = mediaService;
    }

    @GetMapping
    @Operation(summary = "Dapatkan ulasan tayangan", description = "Mengambil seluruh ulasan penonton untuk konten media tertentu.")
    public ResponseEntity<ApiResponse<List<Review>>> getReviews(@PathVariable String mediaId) {
        return ResponseEntity.ok(ApiResponse.ok(mediaService.getReviews(mediaId)));
    }

    @PostMapping
    @Operation(summary = "Kirim ulasan baru", description = "Menambahkan ulasan rating dan komentar baru untuk konten media.")
    public ResponseEntity<ApiResponse<Review>> addReview(
            @PathVariable String mediaId,
            @Valid @RequestBody ReviewRequest request) {
        Review created = mediaService.addReview(mediaId, request);
        return ResponseEntity.ok(ApiResponse.ok("Ulasan berhasil dipublikasikan", created));
    }
}
