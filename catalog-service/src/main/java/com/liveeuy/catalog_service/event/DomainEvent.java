package com.liveeuy.catalog_service.event;

import lombok.Getter;

import java.io.Serializable;
import java.time.Instant;
import java.util.UUID;

/**
 * Base abstract class for all Domain Events in LiveEuy Catalog Service.
 * Follows CloudEvents 1.0 structural specification.
 */
@Getter
public abstract class DomainEvent implements Serializable {

    private static final long serialVersionUID = 1L;

    private final String eventId;
    private final String eventType;
    private final String aggregateId;
    private final String aggregateType;
    private final Instant occurredOn;
    private final int version;

    protected DomainEvent(String eventType, String aggregateId, String aggregateType) {
        this(eventType, aggregateId, aggregateType, 1);
    }

    protected DomainEvent(String eventType, String aggregateId, String aggregateType, int version) {
        this.eventId = UUID.randomUUID().toString();
        this.eventType = eventType;
        this.aggregateId = aggregateId;
        this.aggregateType = aggregateType;
        this.occurredOn = Instant.now();
        this.version = version;
    }
}
