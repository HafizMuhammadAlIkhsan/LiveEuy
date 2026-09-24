package com.liveeuy.backend.model;

public class Episode {
    private String id;
    private int episodeNumber;
    private String title;
    private String synopsis;
    private String thumbnailUrl;
    private String videoUrl;
    private String duration;

    public Episode() {}

    public Episode(String id, int episodeNumber, String title, String synopsis,
                   String thumbnailUrl, String videoUrl, String duration) {
        this.id = id;
        this.episodeNumber = episodeNumber;
        this.title = title;
        this.synopsis = synopsis;
        this.thumbnailUrl = thumbnailUrl;
        this.videoUrl = videoUrl;
        this.duration = duration;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public int getEpisodeNumber() { return episodeNumber; }
    public void setEpisodeNumber(int episodeNumber) { this.episodeNumber = episodeNumber; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getSynopsis() { return synopsis; }
    public void setSynopsis(String synopsis) { this.synopsis = synopsis; }

    public String getThumbnailUrl() { return thumbnailUrl; }
    public void setThumbnailUrl(String thumbnailUrl) { this.thumbnailUrl = thumbnailUrl; }

    public String getVideoUrl() { return videoUrl; }
    public void setVideoUrl(String videoUrl) { this.videoUrl = videoUrl; }

    public String getDuration() { return duration; }
    public void setDuration(String duration) { this.duration = duration; }
}
