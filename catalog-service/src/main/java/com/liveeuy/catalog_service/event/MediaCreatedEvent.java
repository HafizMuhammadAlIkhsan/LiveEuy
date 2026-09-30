package com.liveeuy.catalog_service.event;

import lombok.Getter;
import lombok.ToString;

import java.util.Set;

/**
 * Emitted when a new media title (Movie or TV Series) is created and published in the catalog.
 */
@Getter
@ToString
public class MediaCreatedEvent extends DomainEvent {

    private final String title;
    private final String mediaType;
    private final Integer releaseYear;
    private final Double rating;
    private final Set<String> genres;
    private final String posterUrl;
    private final String trailerUrl;
    private final String ageRating;

    public MediaCreatedEvent(String mediaId, String title, String mediaType, Integer releaseYear,
                             Double rating, Set<String> genres, String posterUrl, 
                             String trailerUrl, String ageRating) {
        super("com.liveeuy.catalog.media.created", mediaId, "Media");
        this.title = title;
        this.mediaType = mediaType;
        this.releaseYear = releaseYear;
        this.rating = rating;
        this.genres = genres;
        this.posterUrl = posterUrl;
        this.trailerUrl = trailerUrl;
        this.ageRating = ageRating;
    }
}
