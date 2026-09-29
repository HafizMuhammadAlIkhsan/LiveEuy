# LiveEuy — Platform Streaming Video & Sinema Online Modern

![LiveEuy Banner](https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1200&auto=format&fit=crop&q=80)

**LiveEuy** adalah platform streaming video on demand (VOD) dan sinema modern yang mencakup ekosistem lengkap:
* 🌐 **Web Frontend**: React 18 + TypeScript + Tailwind CSS (Cinematic Aesthetic, Dark Theme `#08090d`, Ambient Glow)
* 📱 **Mobile Client**: Flutter (Android & iOS) dengan Riverpod state management & Clean Architecture
* ⚙️ **Backend Microservices**:
  * **Auth Service**: Golang + Gin + GORM + JWT + Google OAuth
  * **Catalog Service**: Spring Boot 3.4 + PostgreSQL/Neon DB + Swagger OpenAPI
  * **Trending Service**: Golang + Redis Aggregation Worker
  * **Nginx Reverse Proxy**: Gateway API terpadu (Port 80)

---

## 🌟 Fitur Utama (Web & Mobile)

### 1. 🎬 Pemutar Video Sinematik (Advanced Cinema Video Player)
* **Real Streams & Adaptive Playback**: Terintegrasi stream video MP4 berkualitas tinggi.
* **Dynamic Ambient Glow**: Efek pendaran cahaya dinamis di sekitar layar pemutar video ala bioskop.
* **Scrubbing & Timeline Interaktif**: Hover preview timestamp, buffer health indicator, dan scrubbing akurat.
* **Kontrol Lengkap**:
  * Putar / Jeda, Lompat Maju & Mundur 10 Detik
  * Tombol pintar **"Lewati Intro" (Skip Intro)** otomatis pada detik-detik awal tayangan
  * Pengatur Kecepatan Putar (0.75x, 1x, 1.25x, 1.5x, 2x)
  * Pemilih Resolusi Kualitas (4K UHD, 1080p, 720p, Otomatis)
  * Pemilih Audio dan Takarir: Trek audio multi-bahasa (*Indonesia [Asli]*, *English*) serta takarir teks tertutup (CC)
  * Dukungan **Picture-in-Picture (PiP)** dan **Layar Penuh (Fullscreen)**
  * Panel **Statistik Diagnostik Pemutaran (Stats for Nerds)**: Bitrate, FPS, buffer health, codec
  * Auto-Play **Episode Selanjutnya** untuk serial TV

### 2. 🍿 Hero Billboard Showcase & Rotasi Carousel
* Banner sorotan film/serial terpopuler dengan rotasi otomatis dan Ken Burns effect.
* Background video teaser interaktif dengan toggle mute/unmute audio.
* Match score rating, badge batas usia (SU, 13+, 16+, 18+), dan badge teknologi (4K UHD / Dolby Vision / Atmos).
* Tombol aksi cepat: *Putar Sekarang*, *Tambah ke Koleksi*, dan *Detail Info*.

### 3. 📈 Baris Kategori & Top 10 Indonesia
* **Top 10 Hari Ini di Indonesia**: Tipografi angka peringkat besar ala Netflix.
* **Lanjutkan Menonton (Continue Watching)**: Progress bar tersimpan persisten secara otomatis.
* **Koleksi Tematik**: *Aksi & Pahlawan Super*, *Drama Periode*, *Fiksi Ilmiah (Sci-Fi)*, dll.

### 4. 🔍 Pencarian Instan & Filter Multikriteria
* Pencarian cepat dengan debouncing cerdas.
* Filter multi-kategori: Format (Semua/Film/Serial), chip Genre, dan Pengurutan (Popular, Rating, Newest).

### 5. 📋 Modal Detail Tayangan Komprehensif (4 Tab Interaktif)
* **Tab Ringkasan**: Sinopsis lengkap, sutradara, aktor, rating usia, dan detail teknis.
* **Tab Episode & Musim**: Season selector interaktif dengan durasi dan thumbnail per episode.
* **Tab Mirip Ini**: Rekomendasi tayangan terkait dengan genre serupa.
* **Tab Ulasan Penonton**: Rating bintang 1-10 dan form pengiriman review real-time.

### 6. 👤 Personalisasi Akun: Pengguna Terdaftar (VIP Premium) vs Pengguna Tamu (Guest)
- **Pengguna Terdaftar (VIP Premium)**:
  - Lencana akun premium *LiveEuy VIP*.
  - Akses stream 4K UHD & Dolby Vision/Atmos bebas gangguan iklan.
  - Sinkronisasi daftar koleksi tontonan (*Watchlist*) dan kelanjutan durasi tontonan (*Continue Watching*) antar-perangkat.
  - Akses penuh untuk menulis dan mempublikasikan ulasan film.
- **Pengguna Tamu (Guest Mode)**:
  - Mode penjelajahan katalog terbuka untuk menelusuri film dan serial.
  - Akses fitur dibatasi: pengguna tamu tidak dapat menyimpan ke server atau mengirim ulasan sebelum masuk ke akun.
  - Demo login 1-klik untuk upgrade ke VIP Ultra.
- **Pengaturan Preferensi Streaming Mobile & Web**:
  - Pilihan kualitas tayangan fleksibel dan hemat kuota (*Unduh Hanya via Wi-Fi*).
  - Pengaktifan fitur *Auto Skip Intro* dan pembersihan cache aplikasi.
  - Manajemen sesi login aman dan logout dari semua perangkat.

### 7. 🛡️ Admin Studio CMS & Pusat Kontrol Keamanan (RBAC, Bulk Operations & Stream Inspector)
* **Role-Based Access Control (RBAC)**: Proteksi rute `/admin` via `<AdminRouteGuard />` yang memblokir akses tamu dan member biasa dengan tampilan 403 Forbidden sinematik.
* **User Security Management Suite**: Kontrol akun pengguna lengkap — penangguhan akun (*suspend/activate*), pemutusan sesi jarak jauh (*force remote logout*), pencarian, dan audit log otomatis.
* **Stream URL Health Inspector**: Uji kelayakan tautan video real-time (`.m3u8` HLS / `.mp4`) langsung dari modal CMS lengkap dengan *in-modal mini player tester*.
* **Media Bulk Actions Suite**: Multi-select tayangan dengan aksi massal (*batch delete*, *batch set trending*, ekspor parsial).
* **Catalog Backup & Restore (JSON)**: Cadangkan seluruh database katalog ke file JSON satu klik dan pulihkan dengan opsi *Merge* atau *Overwrite*.
* 📖 **Panduan Integrasi Tim Backend & Mobile**: Tersedia di [`ADMIN_INTEGRATION_GUIDE.md`](./ADMIN_INTEGRATION_GUIDE.md).

---

## Arsitektur Teknologi

### 1. Web Frontend
* **Library**: React 18, TypeScript, Tailwind CSS 3.4
* **Build Tool**: Vite 5
* **Layer API**: `src/services/api.ts` (Auto-detect backend status dengan fallback mulus ke local mock data)
* **Icons**: Lucide React

### 2. Klien Mobile (Flutter)
- **Framework**: Flutter 3.x, Dart 3 (Sound Null Safety)
- **State Management**: Flutter Riverpod 2.5 (`StateNotifierProvider` dan `ProviderScope`)
- **Pemutar Video**: Pustaka `video_player` dengan custom ambient shader
- **Manajemen Cache Gambar**: `cached_network_image` dengan cache multi-tier (RAM dan disk)
- **Tipografi & Ikon**: Google Fonts (Outfit untuk judul, Inter untuk teks konten), Material & Cupertino Icons
- **Penyimpanan Kredensial**: `flutter_secure_storage` (Android Keystore / iOS Keychain) dan `shared_preferences`
- **Tema Tampilan**: Dark mode (`#08090D` / `#0F0E17`) dengan aksen cinematic glassmorphic

### 3. Layanan Backend (Microservices)
Arsitektur backend LiveEuy mengadopsi pola microservices modern:
1. **`auth-service` (Port 8080)**: Go 1.22 + Gin + PostgreSQL 16 + Redis 7 (Login, Register, Demo Personas, Refresh Token Rotation, JWKS, Device Management).
2. **`catalog-service` (Port 8081)**: Spring Boot 3.4.3 (Java 21) + PostgreSQL (SpringDoc OpenAPI, Pageable Catalog, Top 10, Batch Media, TV Hierarchy).
3. **`trending-service` (Port 8082)**: Golang + Redis Aggregation Worker (Real-time trending analytics).
4. **`nginx` (Port 80)**: Reverse proxy & unified API gateway.
* **Kontrak API OpenAPI**: [`API_CONTRACT.md`](./API_CONTRACT.md)
* **Pedoman Database Anti-Konflik**: [`backend/DATABASE_GUIDELINES.md`](./backend/DATABASE_GUIDELINES.md)

### Lapisan Jaringan dan Penanganan Error (Dio)
- Arsitektur jaringan mengimplementasikan spesifikasi Dio 5.x dengan hirarki `DioException`.
- Klasifikasi status jaringan:
  - `badResponse`: menangani status HTTP 4xx dan 5xx dengan ekstraksi pesan JSON backend (`BadRequestException`, `UnauthorizedException`, `ForbiddenException`, `NotFoundException`, `ConflictException`, `ServerException`).
  - `connectionTimeout`, `sendTimeout`, `receiveTimeout`: batas waktu request terlampaui (`ApiTimeoutException`).
  - `connectionError`: koneksi terputus atau host tidak dapat dijangkau (`NetworkException`).
  - `badCertificate`: sertifikat SSL/TLS tidak valid.
  - `cancel`: pembatalan request aktif saat pengguna berpindah rute.
  - `unknown`: kegagalan tak terduga lainnya.
- Pipeline Interceptor:
  - `LoggingInterceptor`: mencatat siklus HTTP request, response status, dan error.
  - `AuthInterceptor`: menyematkan header `Authorization: Bearer <token>` pada request terproteksi.
  - `ErrorInterceptor`: menangkap exception untuk standarisasi format error pada layer presentasi.

---

## Deep Linking

Aplikasi mendukung navigasi langsung melalui custom URI scheme (`liveeuy://`) dan universal app links (`https://liveeuy.id`).

### Rute yang Didukung
| Rute Deep Link | Format URL | Target Navigasi |
| :--- | :--- | :--- |
| Detail Konten | `liveeuy://media/{id}` atau `https://liveeuy.id/media/{id}` | Membuka `ContentDetailScreen` untuk film atau serial target |
| Pemutar Video | `liveeuy://watch/{id}` atau `liveeuy://player/{id}` | Langsung membuka `VideoPlayerScreen` |
| Pencarian | `liveeuy://search?q={keyword}` | Beralih ke tab Pencarian dengan query terisi |
| Koleksi / Watchlist | `liveeuy://collection` atau `liveeuy://watchlist` | Membuka tab Koleksi pengguna |
| Profil dan Pengaturan | `liveeuy://account` atau `liveeuy://profile` | Membuka tab Akun pengguna |
| Halaman Masuk | `liveeuy://login` | Membuka layar autentikasi |

### Konfigurasi Native Platform
- Android (`android/app/src/main/AndroidManifest.xml`): intent-filter untuk `liveeuy` scheme dan host `liveeuy.id`.
- iOS (`ios/Runner/Info.plist`): registrasi `CFBundleURLTypes` dengan skema URL `liveeuy`.

### Pengujian via ADB (Android)
```bash
# Buka detail tayangan ID 'm1'
adb shell am start -a android.intent.action.VIEW -d "liveeuy://media/m1"

# Buka pemutar video langsung untuk ID 'm_hero'
adb shell am start -a android.intent.action.VIEW -d "liveeuy://watch/m_hero"

# Buka tab pencarian dengan kata kunci 'cyberpunk'
adb shell am start -a android.intent.action.VIEW -d "liveeuy://search?q=cyberpunk"

# Buka melalui tautan universal
adb shell am start -a android.intent.action.VIEW -d "https://liveeuy.id/media/m2"
```

---

## Sistem Notifikasi

LiveEuy Mobile mengintegrasikan dispatcher notifikasi lokal yang terhubung dengan siklus tayangan dan navigasi deep link:
- Episode Baru Rilis (`createNewEpisodeNotification`): memicu tautan ke `liveeuy://media/{mediaId}`.
- Pengingat Lanjutkan Menonton (`createContinueWatchingReminder`): memicu tautan langsung ke pemutar di `liveeuy://watch/{mediaId}`.
- Rekomendasi Katalog (`createRecommendationNotification`): rujukan ke tayangan Top 10 atau info langganan VIP.

Komponen antarmuka:
- In-App Toast Banner: menampilkan pemberitahuan melayang dengan tombol aksi langsung.
- Lembar Riwayat Notifikasi: modal bottom sheet dengan penanda status belum dibaca (unread dot). Riwayat tersimpan di penyimpanan lokal sehingga tidak hilang saat aplikasi ditutup.

---

## Penyimpanan Lokal (Offline-First)

Aplikasi memisahkan penyimpanan data berdasarkan klasifikasi keamanan (`LocalStorageService`):

| Tingkat Keamanan | Pustaka | Data yang Disimpan |
| :--- | :--- | :--- |
| Tier 1: Secure Storage | `flutter_secure_storage` | Access token JWT, refresh token, sesi login pengguna |
| Tier 2: Preferences Cache | `shared_preferences` | Pengaturan preferensi streaming, set ID koleksi offline, watch progress, riwayat notifikasi |

Data preferensi dan watch progress dimuat lebih awal dari cache lokal sebelum request jaringan selesai. Apabila opsi Ingat Saya aktif, sesi login akan dipulihkan secara otomatis pada saat aplikasi dibuka.

---
## 🛡️ Manajemen Keamanan Perangkat & Pembedaan Sesi Login (Mobile vs Web)

LiveEuy mengimplementasikan arsitektur pembedaan sesi login perangkat yang terpadu dengan klien web (`dev-frontend`), mobile (`dev-mobile`), dan backend (`auth-service`):

### 1. Identifikasi Klien via HTTP Header

Setiap request dari klien mobile ke backend secara otomatis menginjeksi header identitas perangkat melalui `ApiConfig`:
- **`User-Agent`**: `LiveEuy-Mobile/2.4.0 (Android; Mobile)` atau `LiveEuy-Mobile/2.4.0 (iOS; Mobile)`.
- **`X-Device-Type`**: `'Mobile'` (membedakan klien mobile dari web yang bernilai `'Desktop'` atau `'Web'`).
- **`X-Client-Platform`**: `'Android'` atau `'iOS'`.

### 2. Pembedaan Sesi Login (Mobile vs Web)

| Parameter Sesi | Klien Mobile (`liveeuy_mob`) | Klien Web (`dev-frontend`) |
| :--- | :--- | :--- |
| **Tipe Perangkat (`deviceType`)** | `'Mobile'` | `'Desktop'` / `'Tablet'` |
| **Penyimpanan Kredensial** | `FlutterSecureStorage` (Android Keystore / iOS Keychain) | `HttpOnly` Cookie (`SameSite=Lax`) |
| **Identitas User-Agent** | `LiveEuy-Mobile/2.4.0` | `Mozilla/5.0... (Browser Web)` |
| **Antarmuka Manajemen Sesi** | `DeviceSecuritySheet` (Tab Akun) | `DeviceSecurityModal` (Navbar / Profile) |
| **Status Perangkat Ini** | Ditandai badge hijau `[MOBILE • INI]` | Ditandai badge `[PERANGKAT INI]` |

### 3. Fungsionalitas Lembar Keamanan Perangkat (`DeviceSecuritySheet`)

Pengguna dapat membuka menu **"Perangkat Terhubung & Sesi"** pada tab Akun untuk:
- Memeriksa sesi perangkat smartphone yang sedang digunakan (IP, OS, lokasi, dan status keaktifan).
- Melihat daftar sesi aktif dari browser Web (misalnya Google Chrome di Windows, Safari di macOS).
- **Pencabutan Sesi Tunggal**: Mengeluarkan sesi browser web tertentu dari jarak jauh via `DELETE /api/v1/auth/devices/{deviceId}`.
- **Pencabutan Sesi Massal**: Menutup seluruh sesi web lain sekaligus via `POST /api/v1/auth/logout-all` (`{"includeCurrent": false}`) tanpa mempengaruhi sesi login mobile saat ini.

---

## 🚀 Panduan Menjalankan Aplikasi

### 1. Web Frontend (React + Vite)
```bash
npm install
npm run dev
```
Buka browser pada URL yang ditampilkan di terminal (default: `http://localhost:3000`).

### 2. Backend Services

#### a. Catalog Service (Spring Boot)
```bash
cd catalog-service
./mvnw spring-boot:run
```
Swagger UI: [http://localhost:8081/api/v1/swagger-ui.html](http://localhost:8081/api/v1/swagger-ui.html)

#### b. Auth Service (Golang)
```bash
cd auth-service
go run cmd/server/main.go
```

#### c. Starter Backend (Spring Boot + Docker Compose)
```bash
cd backend
docker compose up -d postgres
./mvnw spring-boot:run
```
Swagger UI: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)

### 3. Mobile Client (Flutter)
```bash
# 1. Unduh dependensi proyek
flutter pub get

# 2. Periksa perangkat atau emulator yang terhubung
flutter devices

# 3. Jalankan aplikasi pada perangkat target
flutter run

# 4. Pembuatan Berkas Rilis APK (Android)
flutter build apk --release
```
Berkas biner Android APK hasil build tersimpan di `build/app/outputs/flutter-apk/app-release.apk`.

Konfigurasi alamat endpoint backend (`lib/core/network/api_config.dart`):
- **Android Emulator**:
  - Auth Service: `http://10.0.2.2:8080/api/v1`
  - Catalog Service: `http://10.0.2.2:8081/api/v1`
- **iOS Simulator / Desktop**:
  - Auth Service: `http://localhost:8080/api/v1`
  - Catalog Service: `http://localhost:8081/api/v1`
- **Perangkat Fisik (Wi-Fi)**:
  - Auth Service: `http://<IP-LOKAL-KOMPUTER>:8080/api/v1`
  - Catalog Service: `http://<IP-LOKAL-KOMPUTER>:8081/api/v1`

---

## 📁 Struktur Direktori Proyek

```
LiveEuy/
├── index.html
├── package.json
├── vite.config.ts
├── docker-compose.yml                 # Orkestrasi microservices (Nginx, Auth, Catalog, Trending, Redis)
├── API_CONTRACT.md                    # Dokumentasi & Kontrak Endpoint OpenAPI
├── ADMIN_INTEGRATION_GUIDE.md         # Panduan Integrasi Admin CMS
│
├── auth-service/                      # Microservice Autentikasi (Golang + Gin + Redis)
├── catalog-service/                   # Microservice Katalog Media (Spring Boot 3.4 + Java 21)
├── trending-service/                  # Microservice Trending Analytics (Golang + Redis)
├── nginx/                             # Reverse Proxy & Unified API Gateway
├── backend/                           # Skema Database & Migrasi SQL Flyway
│   ├── DATABASE_GUIDELINES.md
│   └── migrations/
│
├── lib/                               # Mobile App Flutter Client
│   ├── main.dart                      # Titik masuk aplikasi
│   ├── core/                          # Network (Dio), DeepLink, Storage, Notification, Theme
│   ├── features/                      # Auth, Home, Detail, Player, Search, Collection Screens
│   ├── models/                        # Movie, Episode, Review, Notification Models
│   ├── providers/                     # Riverpod State Notifiers
│   └── shared/                        # Widgets (LiveEuy Logo, Ambient Glow, Glassmorphic Cards)
│
├── src/                               # Web Frontend (React + TypeScript)
│   ├── main.tsx
│   ├── App.tsx
│   ├── context/WatchContext.tsx
│   ├── data/mockData.ts
│   ├── pages/                         # Clean Page Architecture
│   ├── components/                    # Navbar, Player, Hero, Modals, Footer
│   └── services/api.ts                # Full-Stack API Integration Layer
└── test/                              # Suite Pengujian Mobile & Backend
```

---

## 👥 Kontributor & Lisensi
Platform LiveEuy dikembangkan bersama oleh Tim Frontend, Mobile, dan Backend.
