package com.liveeuy.catalog_service.entity;

import com.liveeuy.catalog_service.entity.enums.ProcessingStatus;
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

    @Enumerated(EnumType.STRING)
    @Column(name = "processing_status")
    private ProcessingStatus processingStatus = ProcessingStatus.READY;

    @Column(name = "transcoded_job_id")
    private String transcodeJobId;

    public void markAsProcessing(String jobId) {
        this.transcodeJobId = jobId;
        this.processingStatus = ProcessingStatus.PROCESSING;
    }

    public void completeTranscode(String masterPlaylistUrl, Integer durationSeconds) {
        this.videoUrl = masterPlaylistUrl;
        if (durationSeconds != null && durationSeconds > 0) {
            this.durationSeconds = durationSeconds;
        }
        this.processingStatus = ProcessingStatus.READY;
    }
}
