-- LiveEuy Database Schema Initialization
-- Flyway Migration: V20260924_01__init_schema.sql

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    email VARCHAR(128) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(512),
    membership_tier VARCHAR(32) DEFAULT 'VIP_4K',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Media Items Table (Movies and Series)
CREATE TABLE IF NOT EXISTS media_items (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    synopsis TEXT NOT NULL,
    poster_url VARCHAR(512) NOT NULL,
    backdrop_url VARCHAR(512) NOT NULL,
    video_url VARCHAR(512) NOT NULL,
    match_score DECIMAL(5,2) DEFAULT 95.0,
    age_rating VARCHAR(16) DEFAULT '13+',
    resolution_badges TEXT, -- Comma-separated: '4K UHD,Dolby Vision,Dolby Atmos'
    genre VARCHAR(64) NOT NULL,
    duration_or_seasons VARCHAR(64) NOT NULL,
    release_year INTEGER NOT NULL,
    director VARCHAR(128) NOT NULL,
    cast_members TEXT, -- Comma-separated cast
    is_top10 BOOLEAN DEFAULT FALSE,
    top10_rank INTEGER,
    user_rating DECIMAL(3,1) DEFAULT 4.5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Seasons Table
CREATE TABLE IF NOT EXISTS seasons (
    id VARCHAR(64) PRIMARY KEY,
    media_id VARCHAR(64) NOT NULL REFERENCES media_items(id) ON DELETE CASCADE,
    season_number INTEGER NOT NULL,
    title VARCHAR(128) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Episodes Table
CREATE TABLE IF NOT EXISTS episodes (
    id VARCHAR(64) PRIMARY KEY,
    season_id VARCHAR(64) NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
    episode_number INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    synopsis TEXT,
    thumbnail_url VARCHAR(512),
    video_url VARCHAR(512) NOT NULL,
    duration VARCHAR(32) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
    id VARCHAR(64) PRIMARY KEY,
    media_id VARCHAR(64) NOT NULL REFERENCES media_items(id) ON DELETE CASCADE,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    user_name VARCHAR(128) NOT NULL,
    user_avatar_url VARCHAR(512),
    rating DECIMAL(3,1) NOT NULL,
    comment TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Watchlist Table (User Saved Movies)
CREATE TABLE IF NOT EXISTS watchlist (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    media_id VARCHAR(64) NOT NULL REFERENCES media_items(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_media_watchlist UNIQUE (user_id, media_id)
);

-- 7. Watch Progress Table (Continue Watching)
CREATE TABLE IF NOT EXISTS watch_progress (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    media_id VARCHAR(64) NOT NULL REFERENCES media_items(id) ON DELETE CASCADE,
    progress DECIMAL(5,4) NOT NULL DEFAULT 0.0, -- Range: 0.0000 to 1.0000
    last_episode_id VARCHAR(64),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_media_progress UNIQUE (user_id, media_id)
);

-- Indexing for high-traffic queries
CREATE INDEX IF NOT EXISTS idx_media_is_top10 ON media_items(is_top10);
CREATE INDEX IF NOT EXISTS idx_media_genre ON media_items(genre);
CREATE INDEX IF NOT EXISTS idx_reviews_media_id ON reviews(media_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_user_id ON watchlist(user_id);
CREATE INDEX IF NOT EXISTS idx_watch_progress_user_id ON watch_progress(user_id);

-- Initial Seed Data
INSERT INTO users (id, name, email, password_hash, avatar_url, membership_tier)
VALUES ('user_hafiz', 'Hafiz Muhammad', 'hafiz@streamflix.id', '$2a$12$e0MYzXy8Vl..dummyHash..', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80', 'VIP_4K')
ON CONFLICT (email) DO NOTHING;

INSERT INTO media_items (id, title, synopsis, poster_url, backdrop_url, video_url, match_score, age_rating, resolution_badges, genre, duration_or_seasons, release_year, director, cast_members, is_top10, top10_rank, user_rating)
VALUES 
('m_hero', 'Gundala: Negeri Terakhir', 'Ketika peradaban berada di ambang keruntuhan akibat intrik elite bawah tanah, Sancaka harus merelakan segalanya demi menyalakan petir terakhir penentu nasib bangsa.', 'https://lh3.googleusercontent.com/aida-public/AB6AXuChxR7qJY8oJAUH9fjwwBQ0UiHMDmcnzTrPpVONtc8qEjz2zwPZZxhgKv8CCEdhKLoBjhcZlcZ325bNnL741oqm7KEI1qaQidW9ui3BggZmizl1UZYDVVVKT0x71GHZtZn5QwovgLN23ExGqe_x8OEmuC1o419OosQ4J669bteS8e9hec3Ay-VzLrGkH6o3XXAmGLToVNhKKX-YazhUTVZAZhbJ7AV3p0zexIVwcf2cItNqaW5og1NR', 'https://lh3.googleusercontent.com/aida-public/AB6AXuChxR7qJY8oJAUH9fjwwBQ0UiHMDmcnzTrPpVONtc8qEjz2zwPZZxhgKv8CCEdhKLoBjhcZlcZ325bNnL741oqm7KEI1qaQidW9ui3BggZmizl1UZYDVVVKT0x71GHZtZn5QwovgLN23ExGqe_x8OEmuC1o419OosQ4J669bteS8e9hec3Ay-VzLrGkH6o3XXAmGLToVNhKKX-YazhUTVZAZhbJ7AV3p0zexIVwcf2cItNqaW5og1NR', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 98, '18+', '4K UHD,Dolby Atmos', 'Aksi & Pahlawan Super', '2 Jam 15 Min', 2024, 'Joko Anwar', 'Abimana Aryasatya,Tara Basro,Bront Palarae,Ario Bayu', TRUE, 1, 9.3),
('m1', 'Gadis Kretek', 'Berlatar tahun 1960-an hingga awal 2000-an, perjalanan cinta dan penemuan jati diri terungkap saat seorang perajin wanita berbakat menentang tradisi industri kretek di Jawa Tengah.', 'https://lh3.googleusercontent.com/aida-public/AB6AXuD_ja_wlkaQPjYJLOoC3LoQ38WRHQcxUcT8lv6tUtnJyJval-lNEZ9JQ9MQqCyM5fm89UvInMHQzKvqNUQBvXZK1gpmt3hweQqRqjpF1ctOzKjPUERj-Mbpim0PtHSq-u7j_eHFotwP2xgGXMIsxNszo052yrYOenxf6XxrdnjslMjamv-SYmTyVwuZwfg4A-JeoIPjKuTPDMds_c6RZzgBvIxXCIQTNxVhMZKqWSXpDLNecZ7f5NdZ', 'https://lh3.googleusercontent.com/aida-public/AB6AXuCjdvdOFXeTmIT0VH1mQG_5UPj3BbwqC2N78FzmXwirV6ZTNkU05ON91XHJMlviFJLGyGoJbT894OE97CGGxqFRj7B5g8nQUTx6Y5yYDroC4xK0Nhp-apW7Jlg0sJ4J26e4nbbPf7TUTC9MtMsHSLrXV0jg0COWPY_baO6U7tpj-je1YGL6ElxfXmdAFtzeB_L5EjQOtILcV59st2TNsAe5vaLUVaztTJhkh1T8g-NCFsZREoH7TU8S', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', 99, '16+', '4K UHD,Dolby Vision,Dolby Atmos', 'Drama Periode', '1 Musim (5 Episode)', 2023, 'Kamila Andini, Ifa Isfansyah', 'Dian Sastrowardoyo,Ario Bayu,Putri Marino,Arya Saloka', TRUE, 1, 8.8),
('top_2', 'Sri Asih', 'Kisah Alana membangkitkan kekuatan dewi pelindung bumi.', 'https://lh3.googleusercontent.com/aida-public/AB6AXuCm4BOKHNPGZY0nzbH9ktD22ae4oIttpamXINmShulnPCBykrGdWiV2Rzy5EXIkB8wwon5xHaWbwlzIiYfCOBdhbaKQ64zOGPfW2-qXfCSsmx-Fh6E4NId7u54lTc3h1x6sM4XauLxoNvyv2FyUHHGjMZido5keG7Ye9tKmQFRBSJRcmz0JCYfalE7-IJpnluux7nxQoRk0E8UvZ7biBGxFMvuQl0VN1EBzb7BmO1zn6prhD_DRsi4R', 'https://lh3.googleusercontent.com/aida-public/AB6AXuCm4BOKHNPGZY0nzbH9ktD22ae4oIttpamXINmShulnPCBykrGdWiV2Rzy5EXIkB8wwon5xHaWbwlzIiYfCOBdhbaKQ64zOGPfW2-qXfCSsmx-Fh6E4NId7u54lTc3h1x6sM4XauLxoNvyv2FyUHHGjMZido5keG7Ye9tKmQFRBSJRcmz0JCYfalE7-IJpnluux7nxQoRk0E8UvZ7biBGxFMvuQl0VN1EBzb7BmO1zn6prhD_DRsi4R', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 95, '13+', '4K UHD', 'Aksi', '2 Jam 15 Min', 2022, 'Upi', 'Pevita Pearce,Reza Rahadian', TRUE, 2, 8.5),
('cyberpunk-neo-nusantara', 'Cyberpunk: Neo Nusantara', 'Di megalopolis Nusantara pada tahun 2099, seorang mantan agen siber terpaksa berhadapan dengan sindikat AI misterius yang mengendalikan aliran data dan memori seluruh warga kota.', 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1600&auto=format&fit=crop&q=80', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', 99, '18+', '4K UHD,Dolby Vision,Dolby Atmos', 'Fiksi Ilmiah, Aksi', '2 Musim', 2026, 'Timo Tjahjanto', 'Iko Uwais,Chelsea Islan,Reza Rahadian,Tara Basro', TRUE, 1, 9.4),
('m3', 'The Shadow Strays', 'Seorang pembunuh bayaran muda bernama 13 menantang organisasi pembunuh terkuat demi menyelamatkan seorang anak laki-laki yang diculik mafia.', 'https://lh3.googleusercontent.com/aida-public/AB6AXuCJLiMdFenbqVD-CublKi6On_k_ymnMERa6D-OjWW2ColGnO09RD3G9V6DGZG1-a_bFHM1dSIOso97uiuVxGM-Tpw090uM6ZpXthuKT4E6_yX1ylXRqIlN2li0RVYNifH--UwoWtfgOYPWik__ZPP5c9bvCzgzat61XkY2K4morzGQh_l0KbKX4ib2wot_6L0KBfi-UTkZ1gDJ64ov2v0gZKEDejXyCY1Ko5EtYq5Sfufr_HTUJIdfH', 'https://lh3.googleusercontent.com/aida-public/AB6AXuCZ0xbfQIFfSpAShzjeOOZskzsuS7t8k1yVubeKxbmSIeb95GaRwgxYF-jIM1WG-sVp0LNxaKp3a1PT9R4hlg6CIfEA5ZdYrzI21zKBwPNaFZNAA4FSAXeZ1d5Xnv9b58lJtFSX49jMrwkOSHBwqurp3CNEUprffoECBnhd1yN5qG_rDGtp67E0Zcth_ynC9oK_StgdqbVDLxQcqeeDd0MV5lMSwC3UCu15Hxk4_4hMJ-oaml-c48B-', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', 97, '18+', '4K UHD,Dolby Atmos', 'Aksi & Laga', '2 Jam 24 Min', 2024, 'Timo Tjahjanto', 'Aurora Ribero,Hana Malasan,Ali Fikry,Adipati Dolken', TRUE, 3, 9.1)
ON CONFLICT (id) DO NOTHING;
