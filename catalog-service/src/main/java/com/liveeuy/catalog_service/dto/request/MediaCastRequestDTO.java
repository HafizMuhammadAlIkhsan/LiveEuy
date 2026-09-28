package com.liveeuy.catalog_service.dto.request;

import lombok.Data;

@Data
public class MediaCastRequestDTO {
    private String personName;
    private String characterName;
    private String role;
    private Integer castOrder;
}
