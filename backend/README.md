# LiveEuy — Spring Boot 3 & Swagger RESTful Backend

Aplikasi backend terpadu (*Unified Backend API Service*) untuk platform streaming video **LiveEuy**, dibangun dengan **Spring Boot 3.3.4**, **Java 17**, **PostgreSQL**, **Flyway**, dan **SpringDoc OpenAPI (Swagger UI)**.

Backend ini dirancang khusus untuk melayani dua klien utama tanpa duplikasi logika:
1. **Frontend Web**: React 18, TypeScript, Tailwind CSS, Vite.
2. **Mobile Client**: Flutter 3.x (Android & iOS), Riverpod State Management.

---

## 🚀 Cara Menjalankan Backend

### Prasyarat
- **Java 17** atau lebih baru (`openjdk@17` / Eclipse Temurin)
- **Apache Maven 3.8+** (opsional jika menggunakan Docker)
- **Docker & Docker Compose** (opsional untuk lingkungan kontainer)

### Opsi 1: Menjalankan Langsung dengan Maven
```bash
cd backend
mvn clean spring-boot:run
```
Aplikasi akan aktif di port default `8080` (`http://localhost:8080`).

### Opsi 2: Menjalankan dengan Docker Compose (Backend + PostgreSQL)
Menjalankan PostgreSQL dan backend dalam lingkungan terisolasi:
```bash
cd backend
docker compose up -d
```

### Opsi 3: Membangun & Menjalankan Kontainer Docker Mandiri
```bash
cd backend
docker build -t liveeuy-backend .
docker run -p 8080:8080 liveeuy-backend
```

---

## 📖 Akses Dokumentasi Swagger UI & OpenAPI

Saat backend berjalan, tim pengembang dapat mencoba seluruh endpoint secara langsung melalui GUI interaktif:
* **Swagger UI Interaktif**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
* **OpenAPI 3.0 JSON Spec**: [http://localhost:8080/api-docs](http://localhost:8080/api-docs)

---

## 🏛️ Arsitektur Paket (Package Architecture)

```
com.liveeuy.backend/
├── LiveEuyBackendApplication.java    # Main Entry Point Spring Boot
├── config/
│   ├── OpenApiConfig.java            # Konfigurasi Swagger UI, JWT Bearer Scheme, & Info API
│   └── CorsConfig.java               # Konfigurasi CORS (allowCredentials=true untuk Cookie HttpOnly)
├── model/
│   ├── User.java                     # Entitas Profil Pengguna & Membership Tier
│   ├── UserSettings.java             # Entitas Preferensi Pengguna, Kualitas Streaming, & Cache
│   ├── MediaItem.java                # Entitas Film & Serial TV
│   ├── Season.java                   # Entitas Musim Serial
│   ├── Episode.java                  # Entitas Episode
│   ├── Review.java                   # Entitas Ulasan Penonton & Rating
│   └── WatchProgress.java            # Entitas Durasi Tontonan & Episode Terakhir
├── dto/
│   ├── ApiResponse.java              # Standard Envelope Wrapper JSON {success, message, data, timestamp}
│   ├── LoginRequest.java             # DTO Login {email, password, rememberMe}
│   ├── RegisterRequest.java          # DTO Registrasi {name, email, password}
│   ├── RefreshTokenRequest.java      # DTO Mobile Refresh Token {refreshToken}
│   ├── AuthResponse.java             # DTO Respons Sesi {accessToken, refreshToken, expiresIn, user}
│   ├── UserSettingsRequest.java      # DTO Pembaruan Pengaturan {streamingQuality, spatialAudio, dll}
│   ├── ReviewRequest.java            # DTO Kirim Ulasan {rating, comment, userName}
│   └── WatchProgressRequest.java     # DTO Sinkronisasi Progres {mediaId, progress, lastEpisodeId}
├── security/
│   ├── JwtTokenProvider.java         # Generator & Validator HMAC-SHA256 JWT (Access & Refresh Tokens)
│   └── CookieUtil.java               # Utility Pembuatan & Penghapusan Cookie HttpOnly SameSite=Lax
├── service/
│   ├── AuthService.java              # Logika Autentikasi, Refresh Token Rotation, & Replay Attack Defense
│   └── MediaService.java             # Logika Katalog Media, Top 10, Watchlist, Progres, & Pengaturan
└── controller/
    ├── AuthController.java           # Endpoints Autentikasi /api/v1/auth/*
    ├── UserSettingsController.java   # Endpoints Preferensi & Streaming /api/v1/user/settings
    ├── MediaController.java          # Endpoints Katalog /api/v1/media/*
    ├── WatchlistController.java      # Endpoints Koleksi Pengguna /api/v1/user/watchlist/*
    ├── WatchProgressController.java  # Endpoints Lanjutkan Menonton /api/v1/user/progress/*
    └── ReviewController.java         # Endpoints Ulasan /api/v1/media/{mediaId}/reviews/*
```

---

## 📋 Matriks Ringkasan API Endpoints Terpadu

Semua endpoint diawali dengan prefix `/api/v1`:

| Kategori | Method | Endpoint Path | Autentikasi | Pengguna Klien | Deskripsi |
|---|---|---|---|---|---|
| **Auth** | `POST` | `/api/v1/auth/login` | Publik | Web & Mobile | Login pengguna, menerbitkan AT + RT |
| **Auth** | `POST` | `/api/v1/auth/register` | Publik | Web & Mobile | Pendaftaran akun baru |
| **Auth** | `POST` | `/api/v1/auth/refresh` | Cookie / Body | Web & Mobile | Silent refresh token rotation |
| **Auth** | `POST` | `/api/v1/auth/logout` | Publik | Web & Mobile | Menghapus refresh token & cookie |
| **Auth** | `GET` | `/api/v1/auth/me` | Bearer Token | Web & Mobile | Mengambil profil user aktif |
| **Settings** | `GET` | `/api/v1/user/settings` | Publik / User | Web & Mobile | Mengambil preferensi & kualitas streaming |
| **Settings** | `PUT` | `/api/v1/user/settings` | Publik / User | Web & Mobile | Memperbarui kualitas, audio, & cache |
| **Media** | `GET` | `/api/v1/media` | Publik | Web & Mobile | Mengambil seluruh katalog film & serial |
| **Media** | `GET` | `/api/v1/media/{id}` | Publik | Web & Mobile | Mengambil detail tayangan lengkap |
| **Media** | `GET` | `/api/v1/media/top10` | Publik | Web & Mobile | Mengambil daftar Top 10 Indonesia |
| **Watchlist** | `GET` | `/api/v1/user/watchlist` | Publik / User | Web & Mobile | Mengambil daftar film tersimpan |
| **Watchlist** | `GET` | `/api/v1/user/watchlist/ids`| Publik / User | Web & Mobile | Mengambil daftar ID tersimpan |
| **Watchlist** | `POST` | `/api/v1/user/watchlist/{id}` | Publik / User | Web & Mobile | Toggle simpan/hapus tayangan |
| **Progress** | `GET` | `/api/v1/user/progress` | Publik / User | Web & Mobile | Riwayat tontonan (Continue Watching) |
| **Progress** | `POST` | `/api/v1/user/progress` | Publik / User | Web & Mobile | Sinkronisasi durasi tontonan (UPSERT)|
| **Review** | `GET` | `/api/v1/media/{id}/reviews`| Publik | Web & Mobile | Mengambil daftar ulasan tayangan |
| **Review** | `POST`| `/api/v1/media/{id}/reviews`| Publik / User | Web & Mobile | Mengirim ulasan & rating baru |

---

## 🔐 Arsitektur Keamanan & Refresh Token

Sistem autentikasi mengadopsi standar **Zero Trust Dual-Channel**:
1. **Short-lived Access Token (15 Menit)**:
   * Menjaga keamanan data jika token terekspos; masa hidup token sangat singkat.
2. **Long-lived Refresh Token (7 Hari)**:
   * Menggunakan **Refresh Token Rotation (RTR)**: token lama otomatis dicabut saat token baru diterbitkan.
   * **Deteksi Replay Attack**: jika token yang sudah dicabut dikirim ulang, seluruh sesi pengguna langsung dihanguskan.
3. **Dual-Mode Client Strategy**:
   * **Web Browser (React)**: Refresh Token dikirim via **HttpOnly Cookie** (`SameSite=Lax`, `Path=/api/v1/auth`). JavaScript tidak dapat membacanya, sehingga **kebal dari serangan XSS**.
   * **Mobile (Flutter)**: Flutter adalah aplikasi native tanpa sandbox browser. Token **WAJIB** disimpan menggunakan **`flutter_secure_storage`** (Android Keystore AES-256 GCM & iOS Apple Keychain) dan dilarang disimpan di plain `shared_preferences` (OWASP Mobile M1).

---

## 📚 Panduan Lengkap & Tautan Terkait

Untuk pemahaman mendalam mengenai arsitektur backend, silakan baca dokumentasi berikut:
* 📘 [AUTHENTICATION_AND_SECURITY.md](AUTHENTICATION_AND_SECURITY.md): Panduan lengkap autentikasi, refresh token, cookie HttpOnly, deteksi replay attack, dan implementasi interceptor untuk React & Flutter.
* 📋 [API_CONTRACT.md](API_CONTRACT.md): Kontrak payload request/response JSON terpadu, spesifikasi kualitas streaming, normalisasi model antara Web & Mobile, serta contoh cURL.
* 📖 [DATABASE_GUIDELINES.md](DATABASE_GUIDELINES.md): Pedoman arsitektur skema PostgreSQL, diagram ERD Mermaid, UPSERT anti race-condition, dan aturan migrasi Flyway.
* 📜 [V20260924_01__init_schema.sql](src/main/resources/db/migration/V20260924_01__init_schema.sql): Migrasi Flyway DDL awal untuk tabel pengguna, tayangan, musim, episode, ulasan, dan progres.
* 📜 [V20260925_01__create_refresh_tokens_table.sql](src/main/resources/db/migration/V20260925_01__create_refresh_tokens_table.sql): Migrasi Flyway DDL untuk tabel `refresh_tokens`.
* 📜 [V20260925_02__create_user_settings_table.sql](src/main/resources/db/migration/V20260925_02__create_user_settings_table.sql): Migrasi Flyway DDL untuk tabel `user_settings` preferensi pemutar & kualitas streaming.
