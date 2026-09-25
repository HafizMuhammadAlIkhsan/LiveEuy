package com.liveeuy.catalog_service.dto.response;

import com.liveeuy.catalog_service.entity.enums.VideoQuality;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class EpisodeResponseDTO {
    private String id;
    private Integer episodeNumber;
    private String title;
    private String overview;
    private Integer durationSeconds;
    private String thumbnailUrl;
    private String videoUrl;
    private VideoQuality quality;
}
