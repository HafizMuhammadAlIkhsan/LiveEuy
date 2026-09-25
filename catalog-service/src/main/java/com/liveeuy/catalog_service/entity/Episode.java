package com.liveeuy.catalog_service.entity;

import com.liveeuy.catalog_service.entity.enums.VideoQuality;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "episodes")
@Getter
@Setter
public class Episode {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "season_id", nullable = false)
    private Season season;

    private Integer episodeNumber;
    private String title;

    @Column(columnDefinition = "TEXT")
    private String overview;

    private Integer durationSeconds;
    private String thumbnailUrl;
    private String videoUrl;

    @Enumerated(EnumType.STRING)
    private VideoQuality quality;
}
