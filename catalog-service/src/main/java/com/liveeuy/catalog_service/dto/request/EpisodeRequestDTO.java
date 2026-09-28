package com.liveeuy.catalog_service.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.hibernate.validator.constraints.URL;

@Data
public class EpisodeRequestDTO {

    @NotNull(message = "Nomor episode tidak boleh kosong")
    private Integer episodeNumber;

    @NotBlank(message = "Judul episode tidak boleh kosong")
    private String title;

    private String overview;

    @NotNull(message = "Durasi episode tidak boleh kosong")
    private Integer durationSeconds;

    @URL
    private String thumbnailUrl;

    @NotBlank(message = "URL Video tidak boleh kosong")
    @URL
    private String videoUrl;

    private String quality;
}
