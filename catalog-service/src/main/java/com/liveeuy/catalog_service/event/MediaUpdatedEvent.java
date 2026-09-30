package com.liveeuy.catalog_service.event;

import lombok.Getter;

import java.util.Set;

/**
 * Domain Event yang dipublish ketika data media (film/serial) diperbarui.
 * <p>
 * Contoh consumer: search-service (re-index), CDN (invalidate cache), notification-service.
 */
@Getter
public class MediaUpdatedEvent extends DomainEvent {

    /** Tipe event sesuai konvensi reverse-DNS CloudEvents */
    public static final String EVENT_TYPE = "com.liveeuy.catalog.media.updated";

    /** Judul media setelah update */
    private final String title;

    /** Nama field yang mengalami perubahan, misal: {"title", "rating", "genres"} */
    private final Set<String> changedFields;

    /** Sub-tipe media: MOVIE atau TV_SERIES */
    private final String mediaType;

    /** ID user (admin) yang melakukan update, bisa null jika sistem */
    private final String updatedBy;

    public MediaUpdatedEvent(String mediaId, String title, String mediaType,
                             Set<String> changedFields, String updatedBy) {
        super(EVENT_TYPE, mediaId, "Media");
        this.title = title;
        this.mediaType = mediaType;
        this.changedFields = changedFields != null ? changedFields : Set.of();
        this.updatedBy = updatedBy;
    }
}
