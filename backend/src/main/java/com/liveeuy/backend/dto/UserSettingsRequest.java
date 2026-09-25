package com.liveeuy.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "DTO untuk memperbarui preferensi dan pengaturan streaming pengguna")
public class UserSettingsRequest {

    @Schema(description = "Kualitas streaming: AUTO, DATA_SAVER, HD_720P, FHD_1080P, UHD_4K", example = "AUTO")
    private String streamingQuality;

    @Schema(description = "Status audio spasial Dolby Atmos", example = "true")
    private Boolean spatialAudio;

    @Schema(description = "Lewati intro & rekap secara otomatis", example = "true")
    private Boolean autoSkipIntro;

    @Schema(description = "Unduh video hanya saat terhubung ke Wi-Fi", example = "true")
    private Boolean wifiOnlyDownload;

    @Schema(description = "Kualitas unduhan offline: HIGH, STANDARD, DATA_SAVER", example = "HIGH")
    private String downloadQuality;

    @Schema(description = "Menerima pemberitahuan rilis dan rekomendasi baru", example = "true")
    private Boolean notifications;

    @Schema(description = "Ukuran cache aplikasi dalam byte (0 jika dibersihkan)", example = "0")
    private Long cacheSizeBytes;

    public UserSettingsRequest() {
    }

    public String getStreamingQuality() {
        return streamingQuality;
    }

    public void setStreamingQuality(String streamingQuality) {
        this.streamingQuality = streamingQuality;
    }

    public Boolean getSpatialAudio() {
        return spatialAudio;
    }

    public void setSpatialAudio(Boolean spatialAudio) {
        this.spatialAudio = spatialAudio;
    }

    public Boolean getAutoSkipIntro() {
        return autoSkipIntro;
    }

    public void setAutoSkipIntro(Boolean autoSkipIntro) {
        this.autoSkipIntro = autoSkipIntro;
    }

    public Boolean getWifiOnlyDownload() {
        return wifiOnlyDownload;
    }

    public void setWifiOnlyDownload(Boolean wifiOnlyDownload) {
        this.wifiOnlyDownload = wifiOnlyDownload;
    }

    public String getDownloadQuality() {
        return downloadQuality;
    }

    public void setDownloadQuality(String downloadQuality) {
        this.downloadQuality = downloadQuality;
    }

    public Boolean getNotifications() {
        return notifications;
    }

    public void setNotifications(Boolean notifications) {
        this.notifications = notifications;
    }

    public Long getCacheSizeBytes() {
        return cacheSizeBytes;
    }

    public void setCacheSizeBytes(Long cacheSizeBytes) {
        this.cacheSizeBytes = cacheSizeBytes;
    }
}
