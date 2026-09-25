package com.liveeuy.catalog_service.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.hibernate.validator.constraints.URL;

@Data
public class SeasonRequestDTO {

    @NotNull(message = "Nomor season tidak boleh kosong")
    private Integer seasonNumber;

    @NotBlank(message = "Judul season tidak boleh kosong")
    private String title;

    @URL(message = "Format URL Poster tidak valid")
    private String posterUrl;
}
