package com.liveeuy.catalog_service.event.publisher;

import com.liveeuy.catalog_service.event.DomainEvent;

/**
 * Port (interface) untuk mempublish Domain Events dari catalog-service.
 * <p>
 * Implementasi default menggunakan Spring {@code ApplicationEventPublisher}.
 * Di masa depan, implementasi alternatif bisa diarahkan ke Kafka atau RabbitMQ
 * tanpa mengubah kode business logic (MediaServiceImpl).
 */
public interface DomainEventPublisher {

    /**
     * Publish sebuah domain event.
     *
     * @param event domain event yang akan dipublish; tidak boleh null
     */
    void publish(DomainEvent event);
}
