package com.liveeuy.catalog_service.event;

import lombok.Getter;

/**
 * Domain Event yang dipublish ketika episode baru ditambahkan ke sebuah season serial TV.
 * <p>
 * Contoh consumer: notification-service (kirim notifikasi ke penonton setia serial tersebut),
 * search-service (index episode baru).
 */
@Getter
public class EpisodeAddedEvent extends DomainEvent {

    /** Tipe event sesuai konvensi reverse-DNS CloudEvents */
    public static final String EVENT_TYPE = "com.liveeuy.catalog.episode.added";

    /** ID episode yang baru ditambahkan */
    private final String episodeId;

    /** ID season tempat episode ini berada */
    private final String seasonId;

    /** Nomor urut episode dalam season (1-based) */
    private final int episodeNumber;

    /** Nomor season (1-based) */
    private final int seasonNumber;

    /** Judul episode */
    private final String episodeTitle;

    /** Durasi episode dalam detik */
    private final int durationSeconds;

    /**
     * @param seriesMediaId  ID media induk (TvSeries) — digunakan sebagai aggregateId
     * @param episodeId      ID episode baru
     * @param seasonId       ID season
     * @param seasonNumber   Nomor season
     * @param episodeNumber  Nomor episode dalam season
     * @param episodeTitle   Judul episode
     * @param durationSeconds Durasi dalam detik
     */
    public EpisodeAddedEvent(String seriesMediaId, String episodeId, String seasonId,
                             int seasonNumber, int episodeNumber,
                             String episodeTitle, int durationSeconds) {
        super(EVENT_TYPE, seriesMediaId, "TvSeries");
        this.episodeId = episodeId;
        this.seasonId = seasonId;
        this.seasonNumber = seasonNumber;
        this.episodeNumber = episodeNumber;
        this.episodeTitle = episodeTitle;
        this.durationSeconds = durationSeconds;
    }
}
