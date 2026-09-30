package com.liveeuy.catalog_service.event;

import lombok.Getter;

/**
 * Domain Event yang dipublish ketika media di-unpublish (disembunyikan dari publik).
 * <p>
 * Contoh consumer: search-service (hapus dari index publik), CDN (invalidate cache),
 * watchlist-service (tandai item sebagai "tidak tersedia").
 */
@Getter
public class MediaUnpublishedEvent extends DomainEvent {

    /** Tipe event sesuai konvensi reverse-DNS CloudEvents */
    public static final String EVENT_TYPE = "com.liveeuy.catalog.media.unpublished";

    /** Judul media yang di-unpublish */
    private final String title;

    /** Sub-tipe media: MOVIE atau TV_SERIES */
    private final String mediaType;

    /**
     * Alasan unpublish, misal: "Hak tayang berakhir", "Permintaan studio", "Konten melanggar TOS".
     * Bisa null jika tidak ada alasan spesifik.
     */
    private final String reason;

    public MediaUnpublishedEvent(String mediaId, String title, String mediaType, String reason) {
        super(EVENT_TYPE, mediaId, "Media");
        this.title = title;
        this.mediaType = mediaType;
        this.reason = reason;
    }
}
