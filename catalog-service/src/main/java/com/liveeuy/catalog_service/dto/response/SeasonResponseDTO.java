package com.liveeuy.catalog_service.dto.response;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class SeasonResponseDTO {
    private String id;
    private Integer seasonNumber;
    private String title;
    private String posterUrl;
    private List<EpisodeResponseDTO> episodes;
}
