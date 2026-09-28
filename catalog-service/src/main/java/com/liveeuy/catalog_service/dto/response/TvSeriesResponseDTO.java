package com.liveeuy.catalog_service.dto.response;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
@SuperBuilder
@NoArgsConstructor
public class TvSeriesResponseDTO extends MediaResponseDTO {
    private List<SeasonResponseDTO> seasons;
}
