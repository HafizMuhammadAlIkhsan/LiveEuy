package com.liveeuy.backend.model;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Entitas preferensi pengguna dan pemutar streaming")
public class UserSettings {

    @Schema(description = "ID unik pengguna", example = "user_hafiz")
    private String userId;

    @Schema(description = "Kualitas streaming: AUTO, DATA_SAVER, HD_720P, FHD_1080P, UHD_4K", example = "AUTO")
    private String streamingQuality;

    @Schema(description = "Status audio spasial Dolby Atmos", example = "true")
    private boolean spatialAudio;

    @Schema(description = "Lewati intro & rekap secara otomatis", example = "true")
    private boolean autoSkipIntro;

    @Schema(description = "Unduh video hanya saat terhubung ke Wi-Fi", example = "true")
    private boolean wifiOnlyDownload;

    @Schema(description = "Kualitas unduhan offline: HIGH, STANDARD, DATA_SAVER", example = "HIGH")
    private String downloadQuality;

    @Schema(description = "Menerima pemberitahuan rilis dan rekomendasi baru", example = "true")
    private boolean notifications;

    @Schema(description = "Ukuran cache aplikasi dalam satuan byte", example = "356515840")
    private long cacheSizeBytes;

    public UserSettings() {
    }

    public UserSettings(String userId, String streamingQuality, boolean spatialAudio, boolean autoSkipIntro,
                        boolean wifiOnlyDownload, String downloadQuality, boolean notifications, long cacheSizeBytes) {
        this.userId = userId;
        this.streamingQuality = streamingQuality;
        this.spatialAudio = spatialAudio;
        this.autoSkipIntro = autoSkipIntro;
        this.wifiOnlyDownload = wifiOnlyDownload;
        this.downloadQuality = downloadQuality;
        this.notifications = notifications;
        this.cacheSizeBytes = cacheSizeBytes;
    }

    public static UserSettings defaultSettings(String userId) {
        return new UserSettings(
                userId,
                "AUTO",
                true,
                true,
                true,
                "HIGH",
                true,
                356515840L // 340 MB
        );
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getStreamingQuality() {
        return streamingQuality;
    }

    public void setStreamingQuality(String streamingQuality) {
        this.streamingQuality = streamingQuality;
    }

    public boolean isSpatialAudio() {
        return spatialAudio;
    }

    public void setSpatialAudio(boolean spatialAudio) {
        this.spatialAudio = spatialAudio;
    }

    public boolean isAutoSkipIntro() {
        return autoSkipIntro;
    }

    public void setAutoSkipIntro(boolean autoSkipIntro) {
        this.autoSkipIntro = autoSkipIntro;
    }

    public boolean isWifiOnlyDownload() {
        return wifiOnlyDownload;
    }

    public void setWifiOnlyDownload(boolean wifiOnlyDownload) {
        this.wifiOnlyDownload = wifiOnlyDownload;
    }

    public String getDownloadQuality() {
        return downloadQuality;
    }

    public void setDownloadQuality(String downloadQuality) {
        this.downloadQuality = downloadQuality;
    }

    public boolean isNotifications() {
        return notifications;
    }

    public void setNotifications(boolean notifications) {
        this.notifications = notifications;
    }

    public long getCacheSizeBytes() {
        return cacheSizeBytes;
    }

    public void setCacheSizeBytes(long cacheSizeBytes) {
        this.cacheSizeBytes = cacheSizeBytes;
    }
}
