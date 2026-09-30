# Domain Events — LiveEuy Backend

> Dokumen ini adalah katalog resmi semua Domain Events yang dipublish di platform LiveEuy.
> Setiap event mengikuti konvensi **CloudEvents 1.0** dengan tipe event berformat reverse-DNS.

---

## Daftar Isi

1. [Prinsip Domain Events](#1-prinsip-domain-events)
2. [Catalog Service (Java/Spring Boot)](#2-catalog-service-javaspring-boot)
3. [Auth Service (Go/Fiber)](#3-auth-service-gofiber)
4. [Trending Service (Go/Fiber)](#4-trending-service-gofiber)
5. [Infrastruktur dan Transport](#5-infrastruktur-dan-transport)
6. [Pedoman Penambahan Event Baru](#6-pedoman-penambahan-event-baru)

---

## 1. Prinsip Domain Events

### Apa itu Domain Event?
Domain Event merepresentasikan **sesuatu yang telah terjadi** di domain bisnis — bukan sesuatu yang akan terjadi. Nama event selalu dalam bentuk lampau (*past tense*).

### Konvensi Penamaan
```
com.liveeuy.<service>.<aggregate>.<action>

Contoh:
  com.liveeuy.catalog.media.created
  com.liveeuy.auth.user.registered
  com.liveeuy.trending.score.updated
```

### Struktur Base Event (semua service)

| Field         | Tipe    | Keterangan                                          |
|---------------|---------|-----------------------------------------------------|
| `eventId`     | UUID    | ID unik setiap event (immutable)                    |
| `eventType`   | string  | Nama event reverse-DNS                              |
| `aggregateId` | string  | ID entitas yang memicu event                        |
| `aggregateType` | string | Nama kelas/tipe agregat (`Media`, `User`, dll.)     |
| `occurredOn`  | Instant | Waktu UTC saat event terjadi                        |
| `version`     | int     | Versi skema event (default: 1)                      |

---

## 2. Catalog Service (Java/Spring Boot)

**Package:** `com.liveeuy.catalog_service.event`  
**Transport:** Spring `ApplicationEventPublisher` (synchronous, in-process)  
**Publisher:** [`SpringDomainEventPublisher`](../catalog-service/src/main/java/com/liveeuy/catalog_service/event/publisher/SpringDomainEventPublisher.java)

### 2.1 `com.liveeuy.catalog.media.created`

**Dipublish saat:** Media baru (Film atau Serial TV) berhasil disimpan ke database.  
**Producer:** `MediaServiceImpl.createMedia()`  
**File:** [`MediaCreatedEvent.java`](../catalog-service/src/main/java/com/liveeuy/catalog_service/event/MediaCreatedEvent.java)

| Field         | Tipe          | Contoh                          |
|---------------|---------------|---------------------------------|
| `title`       | String        | `"Oppenheimer"`                 |
| `mediaType`   | String        | `"Movie"` / `"TvSeries"`        |
| `releaseYear` | Integer       | `2023`                          |
| `rating`      | Double        | `8.3`                           |
| `genres`      | Set\<String\> | `["Drama", "History"]`          |
| `posterUrl`   | String        | `"https://cdn.liveeuy.com/..."` |
| `trailerUrl`  | String        | `"https://cdn.liveeuy.com/..."` |
| `ageRating`   | String        | `"R"` / `"PG-13"`              |

**Consumer yang direkomendasikan:**
- `search-service` → index media baru
- `notification-service` → notifikasi "konten baru tersedia"

---

### 2.2 `com.liveeuy.catalog.media.updated`

**Dipublish saat:** Data media diperbarui (metadata, rating, cast, dll.).  
**Producer:** `MediaServiceImpl.updateMedia()`  
**File:** [`MediaUpdatedEvent.java`](../catalog-service/src/main/java/com/liveeuy/catalog_service/event/MediaUpdatedEvent.java)

| Field           | Tipe          | Keterangan                                  |
|-----------------|---------------|---------------------------------------------|
| `title`         | String        | Judul media setelah update                  |
| `mediaType`     | String        | `"Movie"` / `"TvSeries"`                    |
| `changedFields` | Set\<String\> | Field-field yang berubah, misal `{"rating"}` |
| `updatedBy`     | String        | ID admin yang melakukan update (nullable)    |

**Consumer yang direkomendasikan:**
- `search-service` → re-index dokumen
- CDN → invalidate cache poster/trailer

---

### 2.3 `com.liveeuy.catalog.media.deleted`

**Dipublish saat:** Media dihapus dari katalog.  
**Producer:** `MediaServiceImpl.deleteMedia()`  
**File:** [`MediaDeletedEvent.java`](../catalog-service/src/main/java/com/liveeuy/catalog_service/event/MediaDeletedEvent.java)

| Field       | Tipe   | Keterangan                               |
|-------------|--------|------------------------------------------|
| `title`     | String | Judul media yang dihapus (untuk audit)   |
| `mediaType` | String | `"Movie"` / `"TvSeries"`                 |
| `deletedBy` | String | ID admin yang menghapus (nullable)        |

**Consumer yang direkomendasikan:**
- `search-service` → hapus dari index
- `watchlist-service` → tandai item sebagai tidak tersedia
- `trending-service` → hapus dari Redis cache

---

### 2.4 `com.liveeuy.catalog.episode.added`

**Dipublish saat:** Episode baru ditambahkan ke sebuah season Serial TV.  
**File:** [`EpisodeAddedEvent.java`](../catalog-service/src/main/java/com/liveeuy/catalog_service/event/EpisodeAddedEvent.java)

| Field             | Tipe   | Keterangan                           |
|-------------------|--------|--------------------------------------|
| `episodeId`       | String | ID episode baru                      |
| `seasonId`        | String | ID season                            |
| `seasonNumber`    | int    | Nomor season (1-based)               |
| `episodeNumber`   | int    | Nomor episode dalam season (1-based) |
| `episodeTitle`    | String | Judul episode                        |
| `durationSeconds` | int    | Durasi dalam detik                   |

> **Note:** `aggregateId` adalah ID serial TV induk, bukan ID episode.

---

### 2.5 `com.liveeuy.catalog.media.published`

**Dipublish saat:** Visibilitas media diubah ke PUBLIC.  
**File:** [`MediaPublishedEvent.java`](../catalog-service/src/main/java/com/liveeuy/catalog_service/event/MediaPublishedEvent.java)

| Field         | Tipe    | Keterangan                          |
|---------------|---------|-------------------------------------|
| `title`       | String  | Judul media                         |
| `mediaType`   | String  | Tipe media                          |
| `publishedAt` | Instant | Waktu resmi dipublikasikan          |

---

### 2.6 `com.liveeuy.catalog.media.unpublished`

**Dipublish saat:** Visibilitas media diubah ke PRIVATE/HIDDEN.  
**File:** [`MediaUnpublishedEvent.java`](../catalog-service/src/main/java/com/liveeuy/catalog_service/event/MediaUnpublishedEvent.java)

| Field       | Tipe   | Keterangan                                          |
|-------------|--------|-----------------------------------------------------|
| `title`     | String | Judul media                                         |
| `mediaType` | String | Tipe media                                          |
| `reason`    | String | Alasan unpublish, misal `"Hak tayang berakhir"` (nullable) |

---

## 3. Auth Service (Go/Fiber)

**Package:** `internal/domain`  
**Transport:** Interface + struct pattern (siap di-wire ke event bus pilihan)  
**File:** [`events.go`](../auth-service/internal/domain/events.go)

### 3.1 `com.liveeuy.auth.user.registered`

**Dipublish saat:** Pengguna baru berhasil mendaftar.  
**Target producer:** `auth_service.go → Register()`

| Field           | Tipe   | Keterangan                                       |
|-----------------|--------|--------------------------------------------------|
| `Email`         | string | Email pengguna baru                              |
| `Username`      | string | Username yang dipilih                            |
| `OAuthProvider` | string | `"google"`, `"github"`, atau `""` (manual)       |

**Constructor:** `NewUserRegisteredEvent(userID, email, username, oauthProvider)`

---

### 3.2 `com.liveeuy.auth.user.logged_in`

**Dipublish saat:** Pengguna berhasil login.  
**Target producer:** `auth_service.go → Login()`

| Field           | Tipe   | Keterangan                           |
|-----------------|--------|--------------------------------------|
| `Email`         | string | Email pengguna                       |
| `IPAddress`     | string | IP asal request                      |
| `UserAgent`     | string | Browser/app user-agent               |
| `OAuthProvider` | string | Provider OAuth (kosong jika manual)  |

**Constructor:** `NewUserLoggedInEvent(userID, email, ipAddress, userAgent, oauthProvider)`

---

### 3.3 `com.liveeuy.auth.user.session_revoked`

**Dipublish saat:** Sesi/device pengguna dicabut.

| Field       | Tipe   | Keterangan                                                          |
|-------------|--------|---------------------------------------------------------------------|
| `SessionID` | string | ID sesi yang dicabut                                                |
| `Reason`    | string | `"logout"`, `"device_revoked"`, `"admin_force_logout"`, dll.       |

**Constructor:** `NewUserSessionRevokedEvent(userID, sessionID, reason)`

---

## 4. Trending Service (Go/Fiber)

**Package:** `models`  
**Transport:** Interface + struct pattern  
**File:** [`events.go`](../trending-service/models/events.go)

### 4.1 `com.liveeuy.trending.media.interaction`

**Dipublish saat:** Pengguna berinteraksi dengan media (view, like, play).  
**Target producer:** `handlers/trending_handler.go → HandleInteract()`

| Field        | Tipe    | Keterangan                             |
|--------------|---------|----------------------------------------|
| `MediaID`    | string  | ID media yang diinteraksikan           |
| `Action`     | string  | `"view"`, `"like"`, atau `"play"`      |
| `UserID`     | string  | ID pengguna (kosong jika anonim)       |
| `ScoreDelta` | float64 | Penambahan score dari interaksi ini    |

**Constructor:** `NewMediaInteractionEvent(mediaID, action, userID, scoreDelta)`

---

### 4.2 `com.liveeuy.trending.score.updated`

**Dipublish saat:** Trending score media berhasil diperbarui di Redis.  
**Target producer:** `services/trending_worker.go` (setelah batch processing)

| Field           | Tipe    | Keterangan                                      |
|-----------------|---------|-------------------------------------------------|
| `MediaID`       | string  | ID media yang score-nya berubah                 |
| `NewScore`      | float64 | Score baru                                      |
| `PreviousScore` | float64 | Score sebelumnya (untuk delta di consumer)      |
| `Rank`          | int     | Posisi di leaderboard trending (1-based, 0=N/A) |

**Constructor:** `NewTrendingScoreUpdatedEvent(mediaID, newScore, previousScore, rank)`

---

## 5. Infrastruktur dan Transport

### Saat Ini (v1)
```
catalog-service  ──Spring ApplicationEvent──►  Listener dalam satu JVM
auth-service     ──struct (in-memory)────────►  (siap di-wire ke event bus)
trending-service ──struct (in-memory)────────►  (siap di-wire ke event bus)
```

### Rencana Migrasi ke Kafka (v2)
```
Semua service  ──Kafka Producer──►  Topic: liveeuy.domain.events
               Skema: Avro / JSON Schema Registry
               
Topic naming convention:
  liveeuy.catalog.media.events
  liveeuy.auth.user.events
  liveeuy.trending.events
```

> **Catatan:** Untuk beralih ke Kafka di catalog-service, cukup buat implementasi baru dari
> `DomainEventPublisher` tanpa mengubah `MediaServiceImpl` sama sekali (Dependency Inversion).

---

## 6. Pedoman Penambahan Event Baru

1. **Identifikasi aggregate** — event milik aggregate apa? (Media, User, Episode, dll.)
2. **Nama dalam past tense** — `MediaCreated`, bukan `CreateMedia`
3. **Tipe event reverse-DNS** — `com.liveeuy.<service>.<aggregate>.<action>`
4. **Extend `DomainEvent`** (Java) atau embed `baseEvent` (Go)
5. **Hanya berisi data yang immutable** — jangan simpan reference ke entity JPA
6. **Tulis unit test** di `DomainEventTest.java` untuk setiap event baru
7. **Update dokumen ini** — tambahkan baris ke tabel katalog di section yang sesuai

---

*Dokumen ini diperbarui terakhir: September 2026*  
*Maintainer: Tim Backend LiveEuy*
