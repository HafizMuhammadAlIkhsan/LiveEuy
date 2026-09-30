package com.liveeuy.catalog_service.event.publisher;

import com.liveeuy.catalog_service.event.DomainEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

/**
 * Implementasi {@link DomainEventPublisher} menggunakan Spring {@link ApplicationEventPublisher}.
 * <p>
 * Spring akan mendistribusikan event ke semua {@code @EventListener} yang terdaftar
 * secara synchronous dalam transaction yang sama (default).
 * Untuk async, annotate listener dengan {@code @Async} dan aktifkan {@code @EnableAsync}.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class SpringDomainEventPublisher implements DomainEventPublisher {

    private final ApplicationEventPublisher springPublisher;

    @Override
    public void publish(DomainEvent event) {
        log.debug("Publishing domain event: type={}, aggregateId={}, eventId={}",
                event.getEventType(), event.getAggregateId(), event.getEventId());
        springPublisher.publishEvent(event);
        log.info("Domain event published: [{}] aggregateId={}", event.getEventType(), event.getAggregateId());
    }
}
