package com.liveeuy.catalog_service.domain.event;

import com.liveeuy.catalog_service.entity.enums.MediaType;
import java.time.Instant;

public record MediaCreatedEvent(
        String mediaId,
        String title,
        MediaType type,
        Instant occurredOn
) {
    public MediaCreatedEvent(String mediaId, String title, MediaType type) {
        this(mediaId, title, type, Instant.now());
    }
}
