package com.liveeuy.catalog_service.entity;

import com.liveeuy.catalog_service.entity.enums.MediaType;
import com.liveeuy.catalog_service.domain.event.MediaCreatedEvent;
import com.liveeuy.catalog_service.entity.enums.ProcessingStatus;
import java.util.UUID;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

import org.springframework.data.domain.AbstractAggregateRoot;
import org.springframework.data.domain.Persistable;

@Entity
@Table(name = "media")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "media_type", discriminatorType = DiscriminatorType.STRING)
@Getter
@Setter
public abstract class Media extends AbstractAggregateRoot<Media> implements Persistable<String> {

    @Id
    private String id;

    @PrePersist
    public void ensureId() {
        if (this.id == null) {
            this.id = UUID.randomUUID().toString();
        }
    }

    @Transient
    private boolean isNew = true;

    @Override
    public boolean isNew() {
        return this.isNew || this.id == null;
    }

    @PostPersist
    @PostLoad
    void markNotNew() {
        this.isNew = false;
    }

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

    @Enumerated(EnumType.STRING)
    @Column(name = "processing_status", columnDefinition = "varchar(32) default 'READY'")
    private ProcessingStatus processingStatus = ProcessingStatus.READY;

    @Column(name = "transcoded_job_id")
    private String transcodedJobId;

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

    public void markAsProcessing(String jobId) {
        if (jobId == null || jobId.isBlank()) {
            throw new IllegalArgumentException("Job ID cannot be null or blank");
        }
        this.transcodedJobId = jobId;
        this.processingStatus = ProcessingStatus.PROCESSING;
    }

    public void markAsReady() {
        this.processingStatus = ProcessingStatus.READY;
    }

    public void markAsFailed() {
        this.processingStatus = ProcessingStatus.FAILED;
    }
}
