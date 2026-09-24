# LiveEuy — Database Architecture & Anti-Conflict Guidelines

Panduan ini ditujukan bagi tim backend dan full-stack untuk menjaga konsistensi skema database, mencegah konflik migrasi, dan memastikan integritas data saat bekerja bersama dalam repository ini.

---

## 🏛️ Prinsip Utama (Core Principles)

1. **Database-as-Code**: Semua perubahan skema DDL wajib tercatat dalam berkas migrasi Flyway di `src/main/resources/db/migration/`. Tidak ada perubahan langsung via GUI tool (DBeaver/pgAdmin) di lingkungan bersama.
2. **Immutability of Migrations**: Berkas migrasi yang sudah pernah di-*merge* ke branch utama tidak boleh diedit atau dihapus. Buat berkas migrasi baru untuk perbaikan atau perubahan.
3. **Idempotensi & Anti Race-Condition**: Gunakan pola `ON CONFLICT` (UPSERT) untuk operasi seperti *Watch Progress* dan *Watchlist* agar aman dari konkurensi multi-device.

---

## 📐 Konvensi Penamaan Berkas Migrasi Flyway

Format nama berkas:
```text
V<YYYYMMDD>_<Sequence>__<deskripsi_singkat>.sql
```

Contoh:
- `V20260924_01__init_schema.sql`
- `V20260925_01__add_user_biometric_key.sql`
- `V20260925_02__index_media_title_trgm.sql`

Aturan:
- Gunakan tanggal hari ini (`YYYYMMDD`).
- Sequence `01`, `02`, dst.
- Dua garis bawah (`__`) memisahkan versi dan deskripsi.
- Deskripsi menggunakan huruf kecil dipisah garis bawah (`snake_case`).

---

## 📊 Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    USERS ||--o{ WATCHLIST : owns
    USERS ||--o{ WATCH_PROGRESS : tracks
    USERS ||--o{ REVIEWS : writes
    
    MEDIA_ITEMS ||--o{ SEASONS : has
    MEDIA_ITEMS ||--o{ REVIEWS : receives
    MEDIA_ITEMS ||--o{ WATCHLIST : contained_in
    MEDIA_ITEMS ||--o{ WATCH_PROGRESS : tracked_in
    
    SEASONS ||--o{ EPISODES : contains
    
    USERS {
        VARCHAR(64) id PK
        VARCHAR(128) name
        VARCHAR(128) email UK
        VARCHAR(255) password_hash
        VARCHAR(255) avatar_url
        VARCHAR(32) membership_tier
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    MEDIA_ITEMS {
        VARCHAR(64) id PK
        VARCHAR(255) title
        TEXT synopsis
        VARCHAR(512) poster_url
        VARCHAR(512) backdrop_url
        VARCHAR(512) video_url
        DECIMAL match_score
        VARCHAR(16) age_rating
        TEXT resolution_badges
        VARCHAR(64) genre
        VARCHAR(64) duration_or_seasons
        INTEGER release_year
        VARCHAR(128) director
        TEXT cast_members
        BOOLEAN is_top10
        INTEGER top10_rank
        DECIMAL user_rating
        TIMESTAMP created_at
    }

    SEASONS {
        VARCHAR(64) id PK
        VARCHAR(64) media_id FK
        INTEGER season_number
        VARCHAR(128) title
        TIMESTAMP created_at
    }

    EPISODES {
        VARCHAR(64) id PK
        VARCHAR(64) season_id FK
        INTEGER episode_number
        VARCHAR(255) title
        TEXT synopsis
        VARCHAR(512) thumbnail_url
        VARCHAR(512) video_url
        VARCHAR(32) duration
        TIMESTAMP created_at
    }

    REVIEWS {
        VARCHAR(64) id PK
        VARCHAR(64) media_id FK
        VARCHAR(64) user_id FK
        DECIMAL rating
        TEXT comment
        INTEGER likes_count
        TIMESTAMP created_at
    }

    WATCHLIST {
        VARCHAR(64) id PK
        VARCHAR(64) user_id FK
        VARCHAR(64) media_id FK
        TIMESTAMP created_at
    }

    WATCH_PROGRESS {
        VARCHAR(64) id PK
        VARCHAR(64) user_id FK
        VARCHAR(64) media_id FK
        DECIMAL progress
        VARCHAR(64) last_episode_id
        TIMESTAMP updated_at
    }
```

---

## 🛡️ Pola Anti-Konflik & Race Condition

### 1. UPSERT untuk Watch Progress
Untuk menghindari race condition saat aplikasi mobile mengirim *progress sync* berkala:

```sql
INSERT INTO watch_progress (id, user_id, media_id, progress, updated_at)
VALUES (?, ?, ?, ?, NOW())
ON CONFLICT (user_id, media_id)
DO UPDATE SET
    progress = EXCLUDED.progress,
    updated_at = NOW();
```

### 2. Idempotent Watchlist Toggle
Untuk mencegah duplikasi item dalam koleksi:

```sql
-- Tambah ke watchlist (abaikan jika sudah ada)
INSERT INTO watchlist (id, user_id, media_id, created_at)
VALUES (?, ?, ?, NOW())
ON CONFLICT (user_id, media_id) DO NOTHING;
```

---

## 🐳 Menjalankan Database PostgreSQL Lokal Terisolasi

```bash
# Menjalankan PostgreSQL lokal via Docker Compose
docker compose up -d postgres

# Memeriksa log database
docker compose logs -f postgres

# Masuk ke psql CLI
docker compose exec postgres psql -U postgres -d liveeuy
```

---

## ✅ Checklist Sebelum Mengajukan Pull Request (PR)

- [ ] Skema baru memiliki tipe data yang efisien (`VARCHAR` dengan panjang wajar, `TEXT` untuk deskripsi panjang).
- [ ] Foreign Key dilengkapi indeks untuk relasi yang sering di-*join*.
- [ ] Constraint unik (`UNIQUE (user_id, media_id)`) diterapkan pada tabel relasi `watchlist` dan `watch_progress`.
- [ ] Script migrasi telah diuji jalankan dari kondisi database bersih (`docker compose down -v && docker compose up -d postgres`).
- [ ] Tidak ada berkas migrasi lama yang dimodifikasi.
