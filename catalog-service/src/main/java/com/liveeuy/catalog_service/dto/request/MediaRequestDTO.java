package com.liveeuy.catalog_service.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MediaRequestDTO {

    @NotBlank(message = "Judul tidak boleh kosong")
    private String title;

    private String originalTitle;

    @NotBlank(message = "Tipe tidak boleh kosong (movie / tv)")
    private String type;

    private String tagline;
    private String overview;
    private String posterUrl;
    private String backdropUrl;
    private String logoUrl;

    @NotNull(message = "Tahun rilis tidak boleh kosong")
    private Integer releaseYear;

    private Double rating;
    private Integer matchScore;
    private String ageRating;
    private String duration;
    private Integer totalSeasons;
    private List<String> genres;
    private List<String> cast;
    private String director;
    private String videoUrl;
    private String trailerUrl;
    private Boolean isTrending;
    private Boolean isFeatured;
    private Integer topRank;
    private String quality;
    private String audio;
}
