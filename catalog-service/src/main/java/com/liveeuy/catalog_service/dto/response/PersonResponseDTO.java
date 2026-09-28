package com.liveeuy.catalog_service.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PersonResponseDTO {
    private String id;
    private String name;
    private String profileImageUrl;
    private String role;
    private String characterName;
    private Integer castOrder;
}
