-- LiveEuy Database Schema Migration
-- Flyway Migration: V20260925_02__create_user_settings_table.sql
-- Purpose: User preferences, streaming quality, spatial audio, and playback settings

CREATE TABLE IF NOT EXISTS user_settings (
    user_id VARCHAR(64) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    streaming_quality VARCHAR(32) NOT NULL DEFAULT 'AUTO', -- 'AUTO', 'DATA_SAVER', 'HD_720P', 'FHD_1080P', 'UHD_4K'
    spatial_audio BOOLEAN NOT NULL DEFAULT TRUE,
    auto_skip_intro BOOLEAN NOT NULL DEFAULT TRUE,
    wifi_only_download BOOLEAN NOT NULL DEFAULT TRUE,
    download_quality VARCHAR(32) NOT NULL DEFAULT 'HIGH', -- 'HIGH', 'STANDARD', 'DATA_SAVER'
    notifications BOOLEAN NOT NULL DEFAULT TRUE,
    cache_size_bytes BIGINT NOT NULL DEFAULT 356515840, -- Default ~340 MB
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for quick lookup
CREATE INDEX IF NOT EXISTS idx_user_settings_quality ON user_settings(streaming_quality);

-- Seed default settings for initial user
INSERT INTO user_settings (user_id, streaming_quality, spatial_audio, auto_skip_intro, wifi_only_download, download_quality, notifications, cache_size_bytes)
VALUES ('user_hafiz', 'AUTO', TRUE, TRUE, TRUE, 'HIGH', TRUE, 356515840)
ON CONFLICT (user_id) DO NOTHING;
