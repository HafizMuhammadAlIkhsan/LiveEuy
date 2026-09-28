# LiveEuy: Backend RESTful API (Spring Boot 3)

Layanan backend RESTful untuk platform streaming video LiveEuy, dibangun menggunakan Spring Boot 3.3.4, Java 17, PostgreSQL, Flyway, dan SpringDoc OpenAPI (Swagger UI).

Backend ini menyediakan endpoint API bersama untuk dua klien:
1. Frontend Web: React 18, TypeScript, Tailwind CSS, Vite.
2. Mobile Client: Flutter 3.x (Android dan iOS), Riverpod State Management.

---

## Cara Menjalankan Backend

### Prasyarat
- Java 17 atau lebih baru (`openjdk@17` atau Eclipse Temurin)
- Apache Maven 3.8+ (opsional jika menggunakan Docker)
- Docker dan Docker Compose (opsional untuk lingkungan kontainer)

### Opsi 1: Menjalankan Langsung dengan Maven
```bash
cd backend
mvn clean spring-boot:run
```
Aplikasi berjalan pada port default `8080` (`http://localhost:8080`).

### Opsi 2: Menjalankan dengan Docker Compose (Backend dan PostgreSQL)
Menjalankan PostgreSQL dan backend dalam jaringan kontainer lokal:
```bash
cd backend
docker compose up -d
```

### Opsi 3: Membangun Kontainer Docker Mandiri
```bash
cd backend
docker build -t liveeuy-backend .
docker run -p 8080:8080 liveeuy-backend
```

---

## Dokumentasi Swagger UI dan OpenAPI

Saat service berjalan, dokumentasi interaktif dapat diakses pada rute berikut:
- Swagger UI: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
- Spesifikasi OpenAPI 3.0 (JSON): [http://localhost:8080/api-docs](http://localhost:8080/api-docs)

---

## Struktur Paket

```
com.liveeuy.backend/
├── LiveEuyBackendApplication.java    # Entry point aplikasi Spring Boot
├── config/
│   ├── OpenApiConfig.java            # Konfigurasi Swagger UI, skema JWT Bearer, dan metadata API
│   └── CorsConfig.java               # Konfigurasi CORS (allowCredentials=true untuk Cookie HttpOnly)
├── model/
│   ├── User.java                     # Entitas pengguna dan tier membership
│   ├── UserSettings.java             # Entitas preferensi pengguna, kualitas streaming, dan cache
│   ├── MediaItem.java                # Entitas film dan serial TV
│   ├── Season.java                   # Entitas musim serial
│   ├── Episode.java                  # Entitas episode
│   ├── Review.java                   # Entitas ulasan penonton dan rating
│   └── WatchProgress.java            # Entitas durasi tontonan dan episode terakhir
├── dto/
│   ├── ApiResponse.java              # Envelope wrapper JSON {success, message, data, timestamp}
│   ├── LoginRequest.java             # Payload login {email, password, rememberMe}
│   ├── RegisterRequest.java          # Payload registrasi {name, email, password}
│   ├── RefreshTokenRequest.java      # Payload refresh token klien mobile {refreshToken}
│   ├── AuthResponse.java             # Payload respons sesi {accessToken, refreshToken, expiresIn, user}
│   ├── UserSettingsRequest.java      # Payload pembaruan pengaturan {streamingQuality, spatialAudio, dll}
│   ├── ReviewRequest.java            # Payload kirim ulasan {rating, comment, userName}
│   └── WatchProgressRequest.java     # Payload sinkronisasi progres {mediaId, progress, lastEpisodeId}
├── security/
│   ├── JwtTokenProvider.java         # Generator dan validasi HMAC-SHA256 JWT (Access dan Refresh Token)
│   └── CookieUtil.java               # Utilitas pembentukan cookie HttpOnly SameSite=Lax
├── service/
│   ├── AuthService.java              # Logika autentikasi dan rotasi refresh token
│   └── MediaService.java             # Logika katalog media, Top 10, watchlist, progres, dan pengaturan
└── controller/
    ├── AuthController.java           # Endpoint autentikasi /api/v1/auth/*
    ├── UserSettingsController.java   # Endpoint pengaturan pengguna /api/v1/user/settings
    ├── MediaController.java          # Endpoint katalog tayangan /api/v1/media/*
    ├── WatchlistController.java      # Endpoint koleksi tontonan /api/v1/user/watchlist/*
    ├── WatchProgressController.java  # Endpoint progres tontonan /api/v1/user/progress/*
    └── ReviewController.java         # Endpoint ulasan /api/v1/media/{mediaId}/reviews/*
```

---

## Ringkasan Endpoint API

Seluruh endpoint menggunakan prefix `/api/v1`:

| Kategori | Method | Path Endpoint | Autentikasi | Klien | Keterangan |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Auth | `POST` | `/api/v1/auth/login` | Publik | Web dan Mobile | Login pengguna, menghasilkan access token dan refresh token |
| Auth | `POST` | `/api/v1/auth/register` | Publik | Web dan Mobile | Pendaftaran akun baru |
| Auth | `POST` | `/api/v1/auth/refresh` | Cookie / Body | Web dan Mobile | Rotasi token sesi aktif |
| Auth | `POST` | `/api/v1/auth/logout` | Publik | Web dan Mobile | Pencabutan refresh token dan pembersihan cookie |
| Auth | `GET` | `/api/v1/auth/me` | Bearer Token | Web dan Mobile | Mengambil profil pengguna aktif |
| Settings | `GET` | `/api/v1/user/settings` | Publik / User | Web dan Mobile | Mengambil preferensi kualitas streaming |
| Settings | `PUT` | `/api/v1/user/settings` | Publik / User | Web dan Mobile | Memperbarui konfigurasi streaming dan cache |
| Media | `GET` | `/api/v1/media` | Publik | Web dan Mobile | Mengambil katalog film dan serial |
| Media | `GET` | `/api/v1/media/{id}` | Publik | Web dan Mobile | Mengambil detail tayangan dan daftar episode |
| Media | `GET` | `/api/v1/media/top10` | Publik | Web dan Mobile | Mengambil daftar Top 10 tayangan |
| Watchlist | `GET` | `/api/v1/user/watchlist` | Publik / User | Web dan Mobile | Mengambil daftar film tersimpan |
| Watchlist | `GET` | `/api/v1/user/watchlist/ids` | Publik / User | Web dan Mobile | Mengambil daftar ID film tersimpan |
| Watchlist | `POST` | `/api/v1/user/watchlist/{id}` | Publik / User | Web dan Mobile | Menambah atau menghapus tayangan dari koleksi |
| Progress | `GET` | `/api/v1/user/progress` | Publik / User | Web dan Mobile | Riwayat durasi menonton |
| Progress | `POST` | `/api/v1/user/progress` | Publik / User | Web dan Mobile | Sinkronisasi durasi menonton (UPSERT) |
| Review | `GET` | `/api/v1/media/{id}/reviews` | Publik | Web dan Mobile | Mengambil daftar ulasan tayangan |
| Review | `POST` | `/api/v1/media/{id}/reviews` | Publik / User | Web dan Mobile | Mengirim ulasan dan rating baru |

---

## Arsitektur Keamanan dan Refresh Token

Sistem autentikasi menerapkan model token ganda (Dual-Token):
1. Access Token (Masa Berlaku 15 Menit):
   - Digunakan untuk otorisasi request endpoint privat melalui header `Authorization: Bearer <token>`.
   - Disimpan di memori runtime klien.
2. Refresh Token (Masa Berlaku 7 Hari):
   - Digunakan untuk menerbitkan access token baru tanpa meminta pengguna login ulang.
   - Refresh Token Rotation (RTR): setiap rotasi token, token lama dicabut dan diganti dengan pasangan token baru.
   - Deteksi Replay Attack: jika token yang telah dicabut dikirimkan kembali, seluruh token aktif milik pengguna tersebut dinonaktifkan.
3. Strategi Penyimpanan Klien:
   - Web (React): Refresh token dikirimkan melalui cookie HttpOnly (`SameSite=Lax`, `Path=/api/v1/auth`) untuk memitigasi risiko pembacaan token via script XSS di browser.
   - Mobile (Flutter): Token disimpan terenkripsi menggunakan `flutter_secure_storage` (Android Keystore dan Apple Keychain), menghindari penyimpanan plain-text di `shared_preferences`.

---

## Referensi Dokumentasi

Dokumentasi pelengkap untuk pengembangan modul backend:
- [AUTHENTICATION_AND_SECURITY.md](AUTHENTICATION_AND_SECURITY.md): Panduan teknis autentikasi, refresh token, penanganan cookie HttpOnly, dan interceptor klien.
- [API_CONTRACT.md](API_CONTRACT.md): Kontrak payload JSON request dan response, enum kualitas streaming, dan contoh request cURL.
- [DATABASE_GUIDELINES.md](DATABASE_GUIDELINES.md): Pedoman skema database PostgreSQL, diagram ERD, pola UPSERT anti race-condition, dan aturan migrasi Flyway.
- [V20260924_01__init_schema.sql](src/main/resources/db/migration/V20260924_01__init_schema.sql): Migrasi Flyway skema awal tabel pengguna, tayangan, musim, episode, ulasan, dan progres.
- [V20260925_01__create_refresh_tokens_table.sql](src/main/resources/db/migration/V20260925_01__create_refresh_tokens_table.sql): Migrasi Flyway tabel `refresh_tokens`.
- [V20260925_02__create_user_settings_table.sql](src/main/resources/db/migration/V20260925_02__create_user_settings_table.sql): Migrasi Flyway tabel `user_settings`.
