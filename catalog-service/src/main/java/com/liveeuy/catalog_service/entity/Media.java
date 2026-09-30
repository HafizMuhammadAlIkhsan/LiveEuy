package com.liveeuy.catalog_service.entity;

import com.liveeuy.catalog_service.entity.enums.MediaType;
import com.liveeuy.catalog_service.domain.event.MediaCreatedEvent;
import java.util.UUID;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

import org.springframework.data.domain.AbstractAggregateRoot;

@Entity
@Table(name = "media")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "media_type", discriminatorType = DiscriminatorType.STRING)
@Getter
@Setter
public abstract class Media extends AbstractAggregateRoot<Media> {

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

    public void addCastMember(Person person, String role, String characterName, Integer castOrder) {
        if (person == null) {
            throw new IllegalArgumentException("Person cannot be null");
        }
        
        MediaCast cast = new MediaCast();
        cast.setMedia(this);
        cast.setPerson(person);
        cast.setRole(role);
        cast.setCharacterName(characterName);
        cast.setCastOrder(castOrder != null ? castOrder : this.castAndCrew.size());
        this.castAndCrew.add(cast);
    }

    public void updateDetails() {
        if (title == null || title.isBlank()) {
            throw new IllegalArgumentException("Title cannot be null or blank");
        }
        this.title = title.trim();
        this.overview = overview;
        this.releaseYear = releaseYear;
        this.ageRating = ageRating;
    }

    public void markAsCreated() {
        if (this.id == null) {
            this.id = UUID.randomUUID().toString();
        }

        registerEvent(new MediaCreatedEvent(this.id, this.title, this.getType()));
    }
}
