package com.liveeuy.catalog_service.dto.response;

import com.liveeuy.catalog_service.entity.enums.VideoQuality;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@EqualsAndHashCode(callSuper = true)
@SuperBuilder
@NoArgsConstructor
public class MovieResponseDTO extends MediaResponseDTO {
    private Integer durationSeconds;
    private String videoUrl;
    private VideoQuality quality;
    private String audio;
}
