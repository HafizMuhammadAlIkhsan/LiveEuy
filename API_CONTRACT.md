# LiveEuy API Contract & Swagger OpenAPI Documentation

Dokumen ini adalah spesifikasi resmi RESTful API untuk platform **LiveEuy**, dibangun dengan **Spring Boot 3.3.4** dan **SpringDoc OpenAPI (Swagger UI)**. Dokumen ini menjadi acuan utama bagi tim **Backend**, **Frontend (React)**, dan **Mobile (Android / iOS / Flutter)**.

---

## 🌐 Akses Swagger UI & OpenAPI Spec
Saat backend Spring Boot berjalan:
* **Interactive Swagger UI**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
* **Raw OpenAPI JSON**: [http://localhost:8080/api-docs](http://localhost:8080/api-docs)

---

## 📦 Standar Response Wrapper (JSON)

Semua endpoint mengembalikan struktur envelope standar berikut:

```json
{
  "success": true,
  "message": "Operasi berhasil",
  "data": { ... }
}
```

---

## 📌 Daftar Endpoints RESTful

### 1. 🎬 Katalog Media & Konten (`/api/v1/media`)

#### a. `GET /api/v1/media`
Mengambil daftar katalog film & serial dengan filter dan pengurutan.
* **Query Parameters**:
  * `type` *(opsional)*: `'all'` | `'movie'` | `'tv'` (default: `'all'`)
  * `genre` *(opsional)*: Nama genre, e.g. `'Aksi'`, `'Fiksi Ilmiah'` (default: `'Semua Genre'`)
  * `search` *(opsional)*: Kata kunci pencarian judul, aktor, atau genre
  * `sortBy` *(opsional)*: `'popular'` | `'rating'` | `'newest'` (default: `'popular'`)
* **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": "cyberpunk-neo-nusantara",
      "title": "Cyberpunk: Neo Nusantara",
      "originalTitle": "Neo Nusantara 2099",
      "type": "tv",
      "tagline": "Masa depan terbentang di antara cahaya neon dan bayang-bayang masa lalu.",
      "overview": "Di megalopolis Nusantara pada tahun 2099...",
      "posterUrl": "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600",
      "backdropUrl": "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1600",
      "releaseYear": 2026,
      "rating": 9.4,
      "matchScore": 99,
      "ageRating": "18+",
      "totalSeasons": 2,
      "genres": ["Fiksi Ilmiah", "Aksi", "Thriller"],
      "cast": ["Iko Uwais", "Chelsea Islan"],
      "director": "Timo Tjahjanto",
      "videoUrl": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
      "trailerUrl": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      "isTrending": true,
      "isFeatured": true,
      "topRank": 1,
      "quality": "4K UHD",
      "audio": "Dolby Atmos"
    }
  ]
}
```

#### b. `GET /api/v1/media/{id}`
Mengambil detail satu judul tayangan lengkap beserta episode & ulasan penonton.
* **Path Variable**: `id` (e.g. `cyberpunk-neo-nusantara`)
* **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "id": "cyberpunk-neo-nusantara",
    "title": "Cyberpunk: Neo Nusantara",
    "seasons": [
      {
        "seasonNumber": 1,
        "title": "Musim 1: Kode Pembuka",
        "episodes": [
          {
            "id": "cp-s1-e1",
            "episodeNumber": 1,
            "seasonNumber": 1,
            "title": "Sinyal Hitam dari Batavia Hilir",
            "overview": "Arga menerima pesan terenkripsi...",
            "duration": "52m",
            "thumbnail": "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500",
            "videoUrl": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4"
          }
        ]
      }
    ],
    "reviews": [
      {
        "id": "r1",
        "author": "Rian Pratama",
        "avatar": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120",
        "rating": 10.0,
        "date": "2 hari lalu",
        "comment": "Visual cyberpunk lokal terbaik yang pernah ada!"
      }
    ]
  }
}
```

#### c. `GET /api/v1/media/featured`
Mengambil deretan film/serial sorotan utama (*Hero Banner Carousel*).

#### d. `GET /api/v1/media/top-10`
Mengambil 10 tayangan berperingkat teratas di Indonesia (diurutkan berdasarkan `topRank` 1 sampai 10).

---

### 2. 🔖 Koleksi Tontonan Pengguna (`/api/v1/user/watchlist`)

#### a. `GET /api/v1/user/watchlist`
Mengembalikan kumpulan ID media yang telah disimpan pengguna ke dalam daftar tontonan.
* **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Daftar koleksi berhasil diambil",
  "data": ["cyberpunk-neo-nusantara", "chronicles-of-elysium"]
}
```

#### b. `POST /api/v1/user/watchlist/{mediaId}/toggle`
Menambah atau menghapus media dari daftar tontonan (Watchlist).
* **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Media ditambahkan ke Koleksi Saya",
  "data": {
    "mediaId": "cyberpunk-neo-nusantara",
    "inWatchlist": true
  }
}
```

---

### 3. ⏱️ Riwayat & Progres Menonton (`/api/v1/user/progress`)

#### a. `GET /api/v1/user/progress`
Mengambil seluruh riwayat tontonan untuk menampilkan baris **"Lanjutkan Menonton" (Continue Watching)**.
* **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Riwayat progres menonton berhasil dimuat",
  "data": {
    "cyberpunk-neo-nusantara": {
      "mediaId": "cyberpunk-neo-nusantara",
      "currentTime": 1420.0,
      "duration": 3120.0,
      "percentage": 45,
      "lastWatched": 1727150000000,
      "episodeId": "cp-s1-e1"
    }
  }
}
```

#### b. `PUT /api/v1/user/progress`
Sinkronisasi progres detik pemutaran video secara real-time.
* **Request Body**:
```json
{
  "mediaId": "cyberpunk-neo-nusantara",
  "currentTime": 1420.5,
  "duration": 3120.0,
  "episodeId": "cp-s1-e1"
}
```

---

### 4. 💬 Ulasan & Rating Penonton (`/api/v1/media/{mediaId}/reviews`)

#### a. `POST /api/v1/media/{mediaId}/reviews`
Mengirimkan ulasan dan penilaian bintang baru dari penonton.
* **Request Body**:
```json
{
  "author": "Rian Pratama",
  "rating": 9.5,
  "comment": "Sinematografi dan tata suaranya luar biasa memukau!"
}
```
* **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Ulasan berhasil dikirimkan",
  "data": {
    "id": "rev-a1b2c3d4",
    "author": "Rian Pratama",
    "avatar": "https://images.unsplash.com/...",
    "rating": 9.5,
    "date": "Baru saja",
    "comment": "Sinematografi dan tata suaranya luar biasa memukau!"
  }
}
```

---

## 📱 Panduan Implementasi untuk Tim Mobile

### 1. Kotlin / Jetpack Compose (Android)
```kotlin
@Serializable
data class MediaItem(
    val id: String,
    val title: String,
    val type: String,
    val posterUrl: String,
    val backdropUrl: String,
    val releaseYear: Int,
    val rating: Double,
    val matchScore: Int,
    val ageRating: String,
    val duration: String? = null,
    val totalSeasons: Int? = null,
    val genres: List<String>,
    val videoUrl: String
)
```

### 2. Swift / SwiftUI (iOS)
```swift
struct MediaItem: Codable, Identifiable {
    let id: String
    let title: String
    let type: String
    let posterUrl: String
    let backdropUrl: String
    let releaseYear: Int
    let rating: Double
    let matchScore: Int
    let ageRating: String
    let duration: String?
    let totalSeasons: Int?
    let genres: [String]
    let videoUrl: String
}
```

### 3. Flutter / Dart
```dart
class MediaItem {
  final String id;
  final String title;
  final String type;
  final String posterUrl;
  final String backdropUrl;
  final int releaseYear;
  final double rating;
  final int matchScore;
  final String ageRating;
  final String videoUrl;

  MediaItem.fromJson(Map<String, dynamic> json)
      : id = json['id'],
        title = json['title'],
        type = json['type'],
        posterUrl = json['posterUrl'],
        backdropUrl = json['backdropUrl'],
        releaseYear = json['releaseYear'],
        rating = (json['rating'] as num).toDouble(),
        matchScore = json['matchScore'],
        ageRating = json['ageRating'],
        videoUrl = json['videoUrl'];
}
```
