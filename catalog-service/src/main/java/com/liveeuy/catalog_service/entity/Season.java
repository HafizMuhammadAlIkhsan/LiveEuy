package com.liveeuy.catalog_service.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "seasons")
@Getter
@Setter
public class Season {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tv_series_id", nullable = false)
    private TvSeries tvSeries;

    private Integer seasonNumber;
    private String title;
    private String posterUrl;

    @OneToMany(mappedBy = "season", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Episode> episodes = new ArrayList<>();

    public Episode addEpisode(String title, String overview, Integer durationSeconds, String videoUrl) {
        int nextEpisodeNumber = this.episodes.size() + 1;
        
        Episode episode = new Episode();
        episode.setSeason(this);
        episode.setEpisodeNumber(nextEpisodeNumber);
        episode.setTitle(title);
        episode.setOverview(overview);
        episode.setDurationSeconds(durationSeconds);
        episode.setVideoUrl(videoUrl);

        this.episodes.add(episode);
        return episode;
    }
}
