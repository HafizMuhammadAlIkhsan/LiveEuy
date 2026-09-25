package com.liveeuy.backend.model;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Informasi detail episode serial TV")
public class Episode {

    @Schema(description = "ID unik episode", example = "cp-s1-e1")
    private String id;

    @Schema(description = "Nomor episode", example = "1")
    private int episodeNumber;

    @Schema(description = "Nomor musim", example = "1")
    private int seasonNumber;

    @Schema(description = "Judul episode", example = "Sinyal Hitam dari Batavia Hilir")
    private String title;

    @Schema(description = "Sinopsis singkat episode")
    private String overview;

    @Schema(description = "Durasi pemutaran", example = "52m")
    private String duration;

    @Schema(description = "URL gambar thumbnail episode")
    private String thumbnail;

    @Schema(description = "URL aliran video MP4/HLS")
    private String videoUrl;

    public Episode() {}

    public Episode(String id, int episodeNumber, int seasonNumber, String title, String overview, String duration, String thumbnail, String videoUrl) {
        this.id = id;
        this.episodeNumber = episodeNumber;
        this.seasonNumber = seasonNumber;
        this.title = title;
        this.overview = overview;
        this.duration = duration;
        this.thumbnail = thumbnail;
        this.videoUrl = videoUrl;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public int getEpisodeNumber() { return episodeNumber; }
    public void setEpisodeNumber(int episodeNumber) { this.episodeNumber = episodeNumber; }

    public int getSeasonNumber() { return seasonNumber; }
    public void setSeasonNumber(int seasonNumber) { this.seasonNumber = seasonNumber; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getOverview() { return overview; }
    public void setOverview(String overview) { this.overview = overview; }

    public String getDuration() { return duration; }
    public void setDuration(String duration) { this.duration = duration; }

    public String getThumbnail() { return thumbnail; }
    public void setThumbnail(String thumbnail) { this.thumbnail = thumbnail; }

    public String getVideoUrl() { return videoUrl; }
    public void setVideoUrl(String videoUrl) { this.videoUrl = videoUrl; }
}
