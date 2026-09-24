package com.liveeuy.backend.model;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Data riwayat dan progres durasi menonton")
public class WatchProgress {

    @Schema(description = "ID media film/serial", example = "cyberpunk-neo-nusantara")
    private String mediaId;

    @Schema(description = "Detik terakhir ditonton", example = "1420.5")
    private double currentTime;

    @Schema(description = "Total durasi video dalam detik", example = "3120.0")
    private double duration;

    @Schema(description = "Persentase progres (0 - 100)", example = "45")
    private int percentage;

    @Schema(description = "Timestamp waktu terakhir menonton", example = "1727150000000")
    private long lastWatched;

    @Schema(description = "ID episode khusus serial TV", example = "cp-s1-e1", nullable = true)
    private String episodeId;

    public WatchProgress() {}

    public WatchProgress(String mediaId, double currentTime, double duration, int percentage, long lastWatched, String episodeId) {
        this.mediaId = mediaId;
        this.currentTime = currentTime;
        this.duration = duration;
        this.percentage = percentage;
        this.lastWatched = lastWatched;
        this.episodeId = episodeId;
    }

    public String getMediaId() { return mediaId; }
    public void setMediaId(String mediaId) { this.mediaId = mediaId; }

    public double getCurrentTime() { return currentTime; }
    public void setCurrentTime(double currentTime) { this.currentTime = currentTime; }

    public double getDuration() { return duration; }
    public void setDuration(double duration) { this.duration = duration; }

    public int getPercentage() { return percentage; }
    public void setPercentage(int percentage) { this.percentage = percentage; }

    public long getLastWatched() { return lastWatched; }
    public void setLastWatched(long lastWatched) { this.lastWatched = lastWatched; }

    public String getEpisodeId() { return episodeId; }
    public void setEpisodeId(String episodeId) { this.episodeId = episodeId; }
}
