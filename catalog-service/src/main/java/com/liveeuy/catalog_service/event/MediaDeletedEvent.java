package com.liveeuy.catalog_service.event;

import lombok.Getter;

/**
 * Domain Event yang dipublish ketika sebuah media dihapus dari katalog.
 * <p>
 * Contoh consumer: search-service (hapus index), watchlist-service (bersihkan daftar user),
 * trending-service (hapus dari cache Redis).
 */
@Getter
public class MediaDeletedEvent extends DomainEvent {

    /** Tipe event sesuai konvensi reverse-DNS CloudEvents */
    public static final String EVENT_TYPE = "com.liveeuy.catalog.media.deleted";

    /** Judul media yang dihapus (untuk keperluan audit log) */
    private final String title;

    /** Sub-tipe media: MOVIE atau TV_SERIES */
    private final String mediaType;

    /** ID user (admin) yang menghapus media, bisa null jika sistem */
    private final String deletedBy;

    public MediaDeletedEvent(String mediaId, String title, String mediaType, String deletedBy) {
        super(EVENT_TYPE, mediaId, "Media");
        this.title = title;
        this.mediaType = mediaType;
        this.deletedBy = deletedBy;
    }
}
