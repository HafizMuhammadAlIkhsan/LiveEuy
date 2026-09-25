-- ====================================================================
-- LiveEuy Streaming Platform - Initial Schema Migration
-- Migration ID: V20260924_01__init_schema.sql
-- Database: PostgreSQL 15+
-- ====================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(180) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    tier VARCHAR(32) NOT NULL DEFAULT 'VIP Standard' CHECK (tier IN ('Free Guest', 'VIP Standard', 'VIP Cinema Ultra')),
    member_since VARCHAR(32),
    watch_hours NUMERIC(6, 2) DEFAULT 0.00,
    max_devices INT DEFAULT 2,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);

-- 3. MEDIA TABLE
CREATE TABLE IF NOT EXISTS media (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    original_title VARCHAR(200),
    type VARCHAR(16) NOT NULL CHECK (type IN ('movie', 'tv')),
    tagline TEXT,
    overview TEXT NOT NULL,
    poster_url TEXT NOT NULL,
    backdrop_url TEXT NOT NULL,
    logo_url TEXT,
    release_year INT NOT NULL,
    rating NUMERIC(3, 1) NOT NULL DEFAULT 0.0,
    match_score INT NOT NULL DEFAULT 90,
    age_rating VARCHAR(8) NOT NULL DEFAULT '13+',
    duration VARCHAR(32),
    total_seasons INT DEFAULT 0,
    director VARCHAR(120),
    video_url TEXT NOT NULL,
    trailer_url TEXT,
    is_trending BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    top_rank INT,
    quality VARCHAR(32) NOT NULL DEFAULT 'HD',
    audio VARCHAR(32) NOT NULL DEFAULT 'Stereo',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_media_type_year ON media(type, release_year DESC);
CREATE INDEX idx_media_rating ON media(rating DESC);
CREATE INDEX idx_media_trending ON media(is_trending) WHERE is_trending = TRUE;
CREATE INDEX idx_media_top_rank ON media(top_rank) WHERE top_rank IS NOT NULL;

-- 4. MEDIA GENRES (Many-to-Many / Child Collection)
CREATE TABLE IF NOT EXISTS media_genres (
    media_id VARCHAR(100) NOT NULL REFERENCES media(id) ON DELETE CASCADE,
    genre VARCHAR(64) NOT NULL,
    PRIMARY KEY (media_id, genre)
);

CREATE INDEX idx_media_genres_genre ON media_genres(genre);

-- 5. MEDIA CAST
CREATE TABLE IF NOT EXISTS media_cast (
    media_id VARCHAR(100) NOT NULL REFERENCES media(id) ON DELETE CASCADE,
    actor_name VARCHAR(120) NOT NULL,
    cast_order INT DEFAULT 0,
    PRIMARY KEY (media_id, actor_name)
);

-- 6. SEASONS TABLE (For TV Series)
CREATE TABLE IF NOT EXISTS seasons (
    id VARCHAR(100) PRIMARY KEY,
    media_id VARCHAR(100) NOT NULL REFERENCES media(id) ON DELETE CASCADE,
    season_number INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    CONSTRAINT uq_media_season UNIQUE (media_id, season_number)
);

CREATE INDEX idx_seasons_media_id ON seasons(media_id);

-- 7. EPISODES TABLE
CREATE TABLE IF NOT EXISTS episodes (
    id VARCHAR(100) PRIMARY KEY,
    season_id VARCHAR(100) NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
    episode_number INT NOT NULL,
    season_number INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    overview TEXT,
    duration VARCHAR(32) NOT NULL,
    thumbnail_url TEXT NOT NULL,
    video_url TEXT NOT NULL,
    CONSTRAINT uq_season_episode UNIQUE (season_id, episode_number)
);

CREATE INDEX idx_episodes_season_id ON episodes(season_id);

-- 8. WATCHLISTS TABLE (ANTI-CONFLICT: Unique Constraint per User & Media)
CREATE TABLE IF NOT EXISTS watchlists (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    media_id VARCHAR(100) NOT NULL REFERENCES media(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_media_watchlist UNIQUE (user_id, media_id)
);

CREATE INDEX idx_watchlists_user_created ON watchlists(user_id, created_at DESC);

-- 9. WATCH_HISTORY TABLE (ANTI-CONFLICT: Unique Constraint per User, Media & Episode)
CREATE TABLE IF NOT EXISTS watch_history (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    media_id VARCHAR(100) NOT NULL REFERENCES media(id) ON DELETE CASCADE,
    episode_id VARCHAR(100) REFERENCES episodes(id) ON DELETE SET NULL,
    current_time_seconds INT NOT NULL DEFAULT 0,
    duration_seconds INT NOT NULL DEFAULT 0,
    percentage INT NOT NULL DEFAULT 0,
    last_watched_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_media_episode_history UNIQUE (user_id, media_id, episode_id)
);

CREATE INDEX idx_watch_history_user ON watch_history(user_id, last_watched_at DESC);

-- 10. REVIEWS TABLE (ANTI-CONFLICT: 1 Review per User per Media)
CREATE TABLE IF NOT EXISTS reviews (
    id VARCHAR(64) PRIMARY KEY,
    media_id VARCHAR(100) NOT NULL REFERENCES media(id) ON DELETE CASCADE,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 10),
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_media_review UNIQUE (user_id, media_id)
);

CREATE INDEX idx_reviews_media_created ON reviews(media_id, created_at DESC);
