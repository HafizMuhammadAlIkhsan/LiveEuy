package com.liveeuy.catalog_service.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.validator.constraints.URL;

@Data
@EqualsAndHashCode(callSuper = true)
public class MovieRequestDTO extends MediaRequestDTO {

    @NotNull(message = "Durasi film harus diisi")
    private Integer durationSeconds;

    @URL
    private String videoUrl;
    
    private String quality;
    private String audio;
}
