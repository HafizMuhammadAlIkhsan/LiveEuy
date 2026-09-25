package com.liveeuy.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;

@Schema(description = "Payload sinkronisasi durasi dan progres menonton")
public class WatchProgressRequest {

    @NotBlank(message = "mediaId tidak boleh kosong")
    @Schema(description = "ID media film/serial", example = "cyberpunk-neo-nusantara")
    private String mediaId;

    @PositiveOrZero(message = "currentTime harus >= 0")
    @Schema(description = "Detik pemutaran saat ini", example = "1420.5")
    private double currentTime;

    @PositiveOrZero(message = "duration harus >= 0")
    @Schema(description = "Total durasi video dalam detik", example = "3120.0")
    private double duration;

    @Schema(description = "ID episode jika sedang memutar serial TV", example = "cp-s1-e1", nullable = true)
    private String episodeId;

    public WatchProgressRequest() {}

    public WatchProgressRequest(String mediaId, double currentTime, double duration, String episodeId) {
        this.mediaId = mediaId;
        this.currentTime = currentTime;
        this.duration = duration;
        this.episodeId = episodeId;
    }

    public String getMediaId() { return mediaId; }
    public void setMediaId(String mediaId) { this.mediaId = mediaId; }

    public double getCurrentTime() { return currentTime; }
    public void setCurrentTime(double currentTime) { this.currentTime = currentTime; }

    public double getDuration() { return duration; }
    public void setDuration(double duration) { this.duration = duration; }

    public String getEpisodeId() { return episodeId; }
    public void setEpisodeId(String episodeId) { this.episodeId = episodeId; }
}
