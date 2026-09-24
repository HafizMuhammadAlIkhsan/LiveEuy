package com.liveeuy.backend.model;

import java.time.LocalDateTime;

public class WatchProgress {
    private String id;
    private String userId;
    private String mediaId;
    private double progress; // 0.0 to 1.0
    private String lastEpisodeId;
    private LocalDateTime updatedAt;

    public WatchProgress() {}

    public WatchProgress(String id, String userId, String mediaId, double progress,
                         String lastEpisodeId, LocalDateTime updatedAt) {
        this.id = id;
        this.userId = userId;
        this.mediaId = mediaId;
        this.progress = progress;
        this.lastEpisodeId = lastEpisodeId;
        this.updatedAt = updatedAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getMediaId() { return mediaId; }
    public void setMediaId(String mediaId) { this.mediaId = mediaId; }

    public double getProgress() { return progress; }
    public void setProgress(double progress) { this.progress = progress; }

    public String getLastEpisodeId() { return lastEpisodeId; }
    public void setLastEpisodeId(String lastEpisodeId) { this.lastEpisodeId = lastEpisodeId; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
