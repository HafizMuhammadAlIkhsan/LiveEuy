package com.liveeuy.catalog_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MediaItemDTO {
    private String id;
    private String title;
    private String originalTitle;
    private String type;
    private String tagline;
    private String overview;
    private String posterUrl;
    private String backdropUrl;
    private String logoUrl;
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
