# LiveEuy — Spesifikasi Kontrak API (API Contract)

Dokumen ini adalah **kontrak resmi (Single Source of Truth)** antara tim **Backend (Spring Boot)**, **Frontend (React)**, dan **Mobile (Flutter)**.  
Semua klien (Web & Mobile) mengonsumsi endpoint yang **sama persis** tanpa duplikasi di sisi backend.

---

## 🌐 Base URL
- **Local Dev (Web React / iOS Sim)**: `http://localhost:8080/api/v1`
- **Android Emulator**: `http://10.0.2.2:8080/api/v1`
- **Physical Device (LAN/Wi-Fi)**: `http://<IP_LAN_HOST>:8080/api/v1`
- **Swagger UI**: `http://localhost:8080/swagger-ui.html`

---

## 📦 Standar Format Respon JSON (ApiResponse Wrapper)

Semua endpoint mengembalikan struktur pembungkus JSON standar:

```json
{
  "success": true,
  "message": "Deskripsi status operasi",
  "data": { ... },
  "timestamp": "2026-09-24T20:00:00"
}
```

---

## 📋 Daftar Endpoint Terpadu (Unified Endpoints)

### 1. Katalog Media & Konten (`/api/v1/media`)

#### a. Ambil Semua Media
- **Method**: `GET`
- **Path**: `/api/v1/media`
- **Digunakan oleh**:
  - Web: Halaman Beranda, MoviesPage, SeriesPage
  - Mobile: `HomeScreen` & `SearchScreen`
- **Respon Data**: Array `MediaItem`

#### b. Detail Media Berdasarkan ID
- **Method**: `GET`
- **Path**: `/api/v1/media/{id}`
- **Digunakan oleh**:
  - Web: `DetailModal`
  - Mobile: `ContentDetailScreen`
- **Respon Data**: Objek `MediaItem` lengkap dengan `seasons` & `episodes`.

#### c. Tayangan Top 10 Indonesia
- **Method**: `GET`
- **Path**: `/api/v1/media/top10`
- **Digunakan oleh**:
  - Web: Baris `TopTenRow` di HomePage
  - Mobile: Carousel Top 10 di `HomeScreen`

---

### 2. Koleksi Tontonan Pengguna (`/api/v1/user/watchlist`)

#### a. Dapatkan Daftar Media Tersimpan
- **Method**: `GET`
- **Path**: `/api/v1/user/watchlist`
- **Query Params**: `userId` (string, default: ID pengguna aktif)
- **Digunakan oleh**:
  - Web: `WatchlistPage`
  - Mobile: Tab `Koleksi` (`_KoleksiTab` di `main.dart`)

#### b. Dapatkan Kumpulan ID Watchlist
- **Method**: `GET`
- **Path**: `/api/v1/user/watchlist/ids`
- **Query Params**: `userId` (string)
- **Respon Data**: `["m1", "m_hero", ...]` (Set of string IDs)

#### c. Toggle Simpan / Hapus Watchlist (Idempotent)
- **Method**: `POST`
- **Path**: `/api/v1/user/watchlist/{mediaId}`
- **Query Params**: `userId` (string)
- **Respon Data**:
  ```json
  {
    "mediaId": "m1",
    "inWatchlist": true
  }
  ```

---

### 3. Riwayat Tontonan & Lanjutkan Menonton (`/api/v1/user/progress`)

#### a. Dapatkan Riwayat Progres Tontonan
- **Method**: `GET`
- **Path**: `/api/v1/user/progress`
- **Query Params**: `userId` (string)
- **Respon Data**: Array `WatchProgress`

#### b. Sinkronisasi Durasi Tontonan (UPSERT)
- **Method**: `POST`
- **Path**: `/api/v1/user/progress`
- **Query Params**: `userId` (string)
- **Payload Request**:
  ```json
  {
    "mediaId": "m1",
    "progress": 0.65,
    "lastEpisodeId": "gk_ep1"
  }
  ```
- **Catatan**: Dipanggil secara berkala / saat pause dari `video_player` di mobile dan web player.

---

### 4. Ulasan Penonton (`/api/v1/media/{mediaId}/reviews`)

#### a. Dapatkan Ulasan Tayangan
- **Method**: `GET`
- **Path**: `/api/v1/media/{mediaId}/reviews`
- **Respon Data**: Array `Review` diurutkan dari yang terbaru.

#### b. Kirim Ulasan Baru
- **Method**: `POST`
- **Path**: `/api/v1/media/{mediaId}/reviews`
- **Payload Request**:
  ```json
  {
    "rating": 9.5,
    "comment": "Akting dan visualnya sangat luar biasa!",
    "userName": "Hafiz Muhammad"
  }
  ```

---

## 🏷️ Skema Model Data Utama (Data Contract)

### `MediaItem`
| Field | Tipe | Keterangan |
|---|---|---|
| `id` | `String` | ID unik (contoh: `"m1"`, `"m_hero"`) |
| `title` | `String` | Judul tayangan |
| `synopsis` | `String` | Deskripsi cerita |
| `posterUrl` | `String` | URL poster vertikal (2:3) |
| `backdropUrl` | `String` | URL banner horizontal (16:9) |
| `videoUrl` | `String` | URL stream berkas video MP4 |
| `matchScore` | `Double` | Persentase kecocokan (e.g. `98.0`) |
| `ageRating` | `String` | Rating usia (`"SU"`, `"13+"`, `"16+"`, `"18+"`) |
| `resolutionBadges` | `List<String>` | `["4K UHD", "Dolby Vision", "Dolby Atmos"]` |
| `genre` | `String` | Kategori utama |
| `durationOrSeasons`| `String` | e.g. `"2 Jam 15 Min"` atau `"1 Musim"` |
| `releaseYear` | `Integer` | Tahun rilis (e.g. `2024`) |
| `director` | `String` | Sutradara |
| `cast` | `List<String>` | Daftar aktor/aktris |
| `isTop10` | `Boolean` | Apakah masuk Top 10 |
| `top10Rank` | `Integer` | Urutan 1-10 (nullable) |
| `userRating` | `Double` | Rata-rata rating bintang 1.0-10.0 |
| `continueWatchingProgress` | `Double` | Progres tontonan pengguna (0.0-1.0) |
| `seasons` | `List<Season>` | Daftar musim & episode (khusus serial) |

---

### 🔄 Interoperabilitas & Keselarasan Frontend Web (Universal Compatibility)
Untuk menjamin kompatibilitas tanpa *breaking changes* antara **Web (React)** dan **Mobile (Flutter)**:

| Field Standar Backend / Mobile | Alias Kompatibel Web (`src/types.ts`) | Keterangan / Normalisasi |
|---|---|---|
| `synopsis` | `overview` | Kedua field disediakan oleh backend |
| `genre` | `genres: List<String>` | `genres` berupa array token, `genre` string utama |
| `userRating` | `rating` | Skala rating numerik yang sama (0 - 10) |
| `top10Rank` | `topRank` | Urutan peringkat Top 10 (1 - 10) |
| `resolutionBadges` | `quality`, `audio` | Berisi badge resolusi & audio terpadu |
| `userName` (Review) | `author` | Nama penulis ulasan |
| `userAvatarUrl` (Review) | `avatar` | URL avatar penulis ulasan |
| `thumbnailUrl` (Episode) | `thumbnail` | URL gambar cuplikan episode |

