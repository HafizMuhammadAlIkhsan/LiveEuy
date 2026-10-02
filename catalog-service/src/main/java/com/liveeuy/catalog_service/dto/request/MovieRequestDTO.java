package com.liveeuy.catalog_service.dto.request;

import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.validator.constraints.URL;

@Data
@EqualsAndHashCode(callSuper = true)
public class MovieRequestDTO extends MediaRequestDTO {

    private Integer durationSeconds;

    @URL
    private String videoUrl;
    
    private String quality;
    private String audio;
}
