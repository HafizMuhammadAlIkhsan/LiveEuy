package com.liveeuy.catalog_service.event;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Unit test untuk memverifikasi struktur dan kontrak semua Domain Events
 * di catalog-service.
 */
@DisplayName("Domain Events — catalog-service")
class DomainEventTest {

    // ─────────────────────────────────────────────────────────────────────────
    // DomainEvent (base)
    // ─────────────────────────────────────────────────────────────────────────
    @Nested
    @DisplayName("DomainEvent (base class)")
    class BaseDomainEventTest {

        @Test
        @DisplayName("Setiap event memiliki eventId yang unik (UUID)")
        void setiapEventMemilikiEventIdUnik() {
            MediaCreatedEvent event1 = buatMediaCreatedEvent("id-1");
            MediaCreatedEvent event2 = buatMediaCreatedEvent("id-2");
            assertThat(event1.getEventId()).isNotBlank();
            assertThat(event2.getEventId()).isNotBlank();
            assertThat(event1.getEventId()).isNotEqualTo(event2.getEventId());
        }

        @Test
        @DisplayName("occurredOn selalu diisi dengan waktu saat event dibuat")
        void occurredOnTidakNull() {
            Instant sebelum = Instant.now();
            MediaCreatedEvent event = buatMediaCreatedEvent("media-123");
            Instant sesudah = Instant.now();
            assertThat(event.getOccurredOn())
                    .isAfterOrEqualTo(sebelum)
                    .isBeforeOrEqualTo(sesudah);
        }

        @Test
        @DisplayName("aggregateId dan aggregateType harus sesuai dengan yang dipass ke konstruktor")
        void aggregateIdDanTypeTerisi() {
            MediaCreatedEvent event = buatMediaCreatedEvent("media-abc");
            assertThat(event.getAggregateId()).isEqualTo("media-abc");
            assertThat(event.getAggregateType()).isEqualTo("Media");
        }

        @Test
        @DisplayName("version default adalah 1")
        void versionDefaultSatu() {
            MediaCreatedEvent event = buatMediaCreatedEvent("media-999");
            assertThat(event.getVersion()).isEqualTo(1);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // MediaCreatedEvent
    // ─────────────────────────────────────────────────────────────────────────
    @Nested
    @DisplayName("MediaCreatedEvent")
    class MediaCreatedEventTest {

        @Test
        @DisplayName("eventType harus 'com.liveeuy.catalog.media.created'")
        void eventTypeBenar() {
            MediaCreatedEvent event = buatMediaCreatedEvent("m-1");
            assertThat(event.getEventType()).isEqualTo("com.liveeuy.catalog.media.created");
        }

        @Test
        @DisplayName("Semua field payload harus tersimpan dengan benar")
        void fieldPayloadLengkap() {
            MediaCreatedEvent event = new MediaCreatedEvent(
                    "m-1", "Interstellar", "Movie", 2014, 8.6,
                    Set.of("Sci-Fi", "Drama"), "https://poster.jpg", "https://trailer.mp4", "PG-13"
            );
            assertThat(event.getTitle()).isEqualTo("Interstellar");
            assertThat(event.getMediaType()).isEqualTo("Movie");
            assertThat(event.getReleaseYear()).isEqualTo(2014);
            assertThat(event.getRating()).isEqualTo(8.6);
            assertThat(event.getGenres()).containsExactlyInAnyOrder("Sci-Fi", "Drama");
            assertThat(event.getPosterUrl()).isEqualTo("https://poster.jpg");
            assertThat(event.getTrailerUrl()).isEqualTo("https://trailer.mp4");
            assertThat(event.getAgeRating()).isEqualTo("PG-13");
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // MediaUpdatedEvent
    // ─────────────────────────────────────────────────────────────────────────
    @Nested
    @DisplayName("MediaUpdatedEvent")
    class MediaUpdatedEventTest {

        @Test
        @DisplayName("eventType harus 'com.liveeuy.catalog.media.updated'")
        void eventTypeBenar() {
            MediaUpdatedEvent event = new MediaUpdatedEvent("m-2", "Oppenheimer", "Movie",
                    Set.of("rating", "genres"), "admin-1");
            assertThat(event.getEventType()).isEqualTo("com.liveeuy.catalog.media.updated");
        }

        @Test
        @DisplayName("changedFields tidak boleh null ketika dipass null")
        void changedFieldsTidakNullJikaPassNull() {
            MediaUpdatedEvent event = new MediaUpdatedEvent("m-2", "Oppenheimer", "Movie",
                    null, null);
            assertThat(event.getChangedFields()).isNotNull().isEmpty();
        }

        @Test
        @DisplayName("updatedBy boleh null (sistem update)")
        void updatedByBolehNull() {
            MediaUpdatedEvent event = new MediaUpdatedEvent("m-3", "Tenet", "Movie",
                    Set.of("title"), null);
            assertThat(event.getUpdatedBy()).isNull();
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // MediaDeletedEvent
    // ─────────────────────────────────────────────────────────────────────────
    @Nested
    @DisplayName("MediaDeletedEvent")
    class MediaDeletedEventTest {

        @Test
        @DisplayName("eventType harus 'com.liveeuy.catalog.media.deleted'")
        void eventTypeBenar() {
            MediaDeletedEvent event = new MediaDeletedEvent("m-4", "Joker", "Movie", "admin-2");
            assertThat(event.getEventType()).isEqualTo("com.liveeuy.catalog.media.deleted");
        }

        @Test
        @DisplayName("aggregateId sama dengan mediaId yang dihapus")
        void aggregateIdSamaMediaId() {
            MediaDeletedEvent event = new MediaDeletedEvent("m-del-123", "Joker", "Movie", null);
            assertThat(event.getAggregateId()).isEqualTo("m-del-123");
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // EpisodeAddedEvent
    // ─────────────────────────────────────────────────────────────────────────
    @Nested
    @DisplayName("EpisodeAddedEvent")
    class EpisodeAddedEventTest {

        @Test
        @DisplayName("eventType harus 'com.liveeuy.catalog.episode.added'")
        void eventTypeBenar() {
            EpisodeAddedEvent event = new EpisodeAddedEvent(
                    "series-1", "ep-1", "season-1", 1, 1, "Pilot", 3600
            );
            assertThat(event.getEventType()).isEqualTo("com.liveeuy.catalog.episode.added");
        }

        @Test
        @DisplayName("aggregateId harus berisi seriesMediaId (bukan episodeId)")
        void aggregateIdAdalahSeriesId() {
            EpisodeAddedEvent event = new EpisodeAddedEvent(
                    "series-xyz", "ep-abc", "season-1", 2, 5, "The Battle", 2700
            );
            assertThat(event.getAggregateId()).isEqualTo("series-xyz");
            assertThat(event.getEpisodeId()).isEqualTo("ep-abc");
        }

        @Test
        @DisplayName("Semua field episode tersimpan dengan benar")
        void fieldEpisodeLengkap() {
            EpisodeAddedEvent event = new EpisodeAddedEvent(
                    "s-1", "e-5", "seas-2", 2, 5, "The Finale", 5400
            );
            assertThat(event.getSeasonId()).isEqualTo("seas-2");
            assertThat(event.getSeasonNumber()).isEqualTo(2);
            assertThat(event.getEpisodeNumber()).isEqualTo(5);
            assertThat(event.getEpisodeTitle()).isEqualTo("The Finale");
            assertThat(event.getDurationSeconds()).isEqualTo(5400);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // MediaPublishedEvent & MediaUnpublishedEvent
    // ─────────────────────────────────────────────────────────────────────────
    @Nested
    @DisplayName("MediaPublishedEvent dan MediaUnpublishedEvent")
    class PublishToggleEventTest {

        @Test
        @DisplayName("MediaPublishedEvent memiliki eventType dan publishedAt yang benar")
        void publishedEventBenar() {
            Instant sebelum = Instant.now();
            MediaPublishedEvent event = new MediaPublishedEvent("m-5", "Dune", "Movie");
            assertThat(event.getEventType()).isEqualTo("com.liveeuy.catalog.media.published");
            assertThat(event.getPublishedAt()).isAfterOrEqualTo(sebelum);
            assertThat(event.getTitle()).isEqualTo("Dune");
        }

        @Test
        @DisplayName("MediaUnpublishedEvent memiliki eventType dan reason yang benar")
        void unpublishedEventBenar() {
            MediaUnpublishedEvent event = new MediaUnpublishedEvent(
                    "m-6", "Dune Part 2", "Movie", "Hak tayang berakhir"
            );
            assertThat(event.getEventType()).isEqualTo("com.liveeuy.catalog.media.unpublished");
            assertThat(event.getReason()).isEqualTo("Hak tayang berakhir");
        }

        @Test
        @DisplayName("MediaUnpublishedEvent boleh tidak menyertakan reason (null)")
        void reasonBolehNull() {
            MediaUnpublishedEvent event = new MediaUnpublishedEvent("m-7", "Some Movie", "Movie", null);
            assertThat(event.getReason()).isNull();
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Helper
    // ─────────────────────────────────────────────────────────────────────────
    private MediaCreatedEvent buatMediaCreatedEvent(String mediaId) {
        return new MediaCreatedEvent(
                mediaId, "Test Media", "Movie", 2024, 7.5,
                Set.of("Action"), null, null, "PG"
        );
    }
}
