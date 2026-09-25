package com.liveeuy.catalog_service.dto.response;

import com.liveeuy.catalog_service.entity.enums.MediaType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.util.List;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public abstract class MediaResponseDTO {
    private String id;
    private String title;
    private String originalTitle;
    private MediaType type;
    private String tagline;
    private String overview;
    private String posterUrl;
    private String backdropUrl;
    private String logoUrl;
    private String trailerUrl;
    private Integer releaseYear;
    private String ageRating;
    private List<String> genres;
    private List<PersonResponseDTO> castAndCrew;
}
