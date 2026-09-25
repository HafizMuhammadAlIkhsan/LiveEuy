package com.liveeuy.catalog_service.dto.request;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import org.hibernate.validator.constraints.URL;

import java.util.List;

@Data
@JsonTypeInfo(
        use = JsonTypeInfo.Id.NAME,
        include = JsonTypeInfo.As.EXISTING_PROPERTY,
        property = "type",
        visible = true
)
@JsonSubTypes({
        @JsonSubTypes.Type(value = MovieRequestDTO.class, name = "MOVIE"),
        @JsonSubTypes.Type(value = TvSeriesRequestDTO.class, name = "TV_SERIES")
})
public abstract class MediaRequestDTO {

    @NotBlank(message = "Judul tidak boleh kosong")
    @Size(max = 255)
    private String title;

    private String originalTitle;

    @NotBlank(message = "Type harus diisi (MOVIE / TV_SERIES)")
    private String type;

    private String tagline;
    private String overview;

    @URL(message = "Format URL Poster tidak valid")
    private String posterUrl;
    
    @URL(message = "Format URL Backdrop tidak valid")
    private String backdropUrl;

    @NotNull(message = "Tahun rilis tidak boleh kosong")
    private Integer releaseYear;

    private String ageRating;
    private List<String> genres;

    private List<MediaCastRequestDTO> castAndCrew;
}
