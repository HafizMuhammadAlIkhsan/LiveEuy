package com.liveeuy.backend.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class WatchProgressRequest {
    @NotBlank(message = "mediaId tidak boleh kosong")
    private String mediaId;

    @NotNull(message = "progress tidak boleh kosong")
    @DecimalMin(value = "0.0", message = "Progress minimal 0.0")
    @DecimalMax(value = "1.0", message = "Progress maksimal 1.0")
    private Double progress;

    private String lastEpisodeId;

    public WatchProgressRequest() {}

    public WatchProgressRequest(String mediaId, Double progress, String lastEpisodeId) {
        this.mediaId = mediaId;
        this.progress = progress;
        this.lastEpisodeId = lastEpisodeId;
    }

    public String getMediaId() { return mediaId; }
    public void setMediaId(String mediaId) { this.mediaId = mediaId; }

    public Double getProgress() { return progress; }
    public void setProgress(Double progress) { this.progress = progress; }

    public String getLastEpisodeId() { return lastEpisodeId; }
    public void setLastEpisodeId(String lastEpisodeId) { this.lastEpisodeId = lastEpisodeId; }
}
