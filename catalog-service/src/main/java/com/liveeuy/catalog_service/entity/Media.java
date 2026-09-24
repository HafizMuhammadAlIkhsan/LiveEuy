package com.liveeuy.catalog_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Entity
@Table(name = "media")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Media {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String title;

    private String originalTitle;

    @Column(nullable = false)
    private String type; // "movie" atau "tv"

    private String tagline;

    @Column(columnDefinition = "TEXT")
    private String overview;

    private String posterUrl;
    private String backdropUrl;
    private String logoUrl;

    private Integer releaseYear;
    private Double rating;
    private Integer matchScore;

    private String ageRating;
    private String duration;
    private Integer totalSeasons;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "media_genres", joinColumns = @JoinColumn(name = "media_id"))
    @Column(name = "genre")
    private List<String> genres;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "media_cast", joinColumns = @JoinColumn(name = "media_id"))
    @Column(name = "actor_name")
    private List<String> castList;

    private String director;
    private String videoUrl;
    private String trailerUrl;

    private Boolean isTrending;
    private Boolean isFeatured;
    private Integer topRank;

    private String quality;
    private String audio;
}
