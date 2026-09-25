package com.liveeuy.catalog_service.entity;

import com.liveeuy.catalog_service.entity.enums.MediaType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "media")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "media_type", discriminatorType = DiscriminatorType.STRING)
@Getter
@Setter
public abstract class Media {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String title;
    private String originalTitle;
    private String tagline;

    @Column(columnDefinition = "TEXT")
    private String overview;

    private String posterUrl;
    private String backdropUrl;
    private String logoUrl;
    private String trailerUrl;

    private Integer releaseYear;
    private String ageRating;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "media_genres", joinColumns = @JoinColumn(name = "media_id"))
    @Column(name = "genre")
    private Set<String> genres = new HashSet<>();

    @OneToMany(mappedBy = "media", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<MediaCast> castAndCrew = new HashSet<>();
    
    @Column(name = "media_type", insertable = false, updatable = false)
    @Enumerated(EnumType.STRING)
    private MediaType type;
}
