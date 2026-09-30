package com.liveeuy.catalog_service.event;

import lombok.Getter;

import java.time.Instant;

/**
 * Domain Event yang dipublish ketika media dipublikasikan (visibility = PUBLIC).
 * <p>
 * Contoh consumer: notification-service (push notifikasi "tersedia sekarang"),
 * search-service (tambahkan ke index publik), CDN (pre-warm cache poster).
 */
@Getter
public class MediaPublishedEvent extends DomainEvent {

    /** Tipe event sesuai konvensi reverse-DNS CloudEvents */
    public static final String EVENT_TYPE = "com.liveeuy.catalog.media.published";

    /** Judul media yang dipublikasikan */
    private final String title;

    /** Sub-tipe media: MOVIE atau TV_SERIES */
    private final String mediaType;

    /** Waktu media secara resmi dipublikasikan */
    private final Instant publishedAt;

    public MediaPublishedEvent(String mediaId, String title, String mediaType) {
        super(EVENT_TYPE, mediaId, "Media");
        this.title = title;
        this.mediaType = mediaType;
        this.publishedAt = Instant.now();
    }
}
