# LiveEuy — Platform Streaming Video & Sinema Online Modern

![LiveEuy Banner](https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1200&auto=format&fit=crop&q=80)

**LiveEuy** adalah platform streaming video on demand (VOD) dan sinema modern yang mencakup ekosistem lengkap:
* 🌐 **Web Frontend**: React 18 + TypeScript + Tailwind CSS (Cinematic Aesthetic, Dark Theme `#08090d`, Ambient Glow)
* 📱 **Mobile Client**: Flutter (Android & iOS) dengan Riverpod state management & Clean Architecture
* ⚙️ **Backend Microservices**:
  * **Auth Service**: Golang + Gin + GORM + JWT + Google OAuth
  * **Catalog Service**: Spring Boot 3.3 + PostgreSQL/Neon DB + Swagger OpenAPI
  * **Starter Backend**: Spring Boot 3 + Flyway Schema Migrations + Docker Compose

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

---

## 🛠️ Arsitektur Teknologi

### 1. Web Frontend
* **Library**: React 18, TypeScript, Tailwind CSS 3.4
* **Build Tool**: Vite 5
* **Layer API**: `src/services/api.ts` (Auto-detect backend status dengan fallback mulus ke local mock data)
* **Icons**: Lucide React

### 2. Mobile Client (Flutter)
* **Framework**: Flutter 3.22+, Dart 3.4+
* **State Management**: Flutter Riverpod
* **Target OS**: Android (API 21+) & iOS (12.0+)

### 3. Backend Microservices & API
* **Auth Service**: Golang (Gin, GORM, PostgreSQL, JWT, OAuth2) — Port `8080`
* **Catalog Service**: Spring Boot 3.3.4 (Java 17, JPA, PostgreSQL/Neon, OpenAPI Swagger) — Port `8081`
* **Monolith / Starter API**: Spring Boot 3.3.4 — Port `8080`
* **Kontrak API OpenAPI**: [`API_CONTRACT.md`](./API_CONTRACT.md)
* **Pedoman Database Anti-Konflik**: [`backend/DATABASE_GUIDELINES.md`](./backend/DATABASE_GUIDELINES.md)

### Lapisan Jaringan & Error Handling (Dio & DioException Architecture)
- **Standar Protokol**: Mengikuti arsitektur **Dio 5.x** dengan penanganan exception menggunakan `DioException` dan `DioExceptionType`.
- **Klasifikasi Error Jaringan**:
  - `DioExceptionType.badResponse`: Menangani error 4xx dan 5xx dengan parsing otomatis pesan error JSON dari backend Spring Boot (`e.backendMessage`). Mendukung `BadRequestException` (400, 422), `UnauthorizedException` (401), `ForbiddenException` (403), `NotFoundException` (404), `ConflictException` (409), dan `ServerException` (5xx).
  - `DioExceptionType.connectionTimeout`, `sendTimeout`, `receiveTimeout`: Menangani kegagalan batas waktu request (`ApiTimeoutException`).
  - `DioExceptionType.connectionError`: Menangani putusnya sambungan internet / backend offline (`NetworkException`).
  - `DioExceptionType.badCertificate`: Menangani sertifikat SSL/TLS yang tidak valid.
  - `DioExceptionType.cancel`: Mendukung pembatalan request oleh navigasi/pengguna.
  - `DioExceptionType.unknown`: Menangani error tidak terduga lainnya.
- **Pipeline Interceptor 3-Arah**:
  - `LoggingInterceptor`: Pelacakan request, status code respon, dan kegagalan jaringan secara real-time.
  - `AuthInterceptor`: Otomatisasi penyematan `Authorization: Bearer <token>` pada request terproteksi.
  - `ErrorInterceptor`: Menangkap kegagalan jaringan untuk penanganan dan logging terpusat.
- **Interoperabilitas Penuh**: Typed exceptions (`BadRequestException`, `UnauthorizedException`, `ForbiddenException`, `NotFoundException`, `ConflictException`, `ServerException`, `NetworkException`, `ApiTimeoutException`) merupakan turunan dari `ApiException` sekaligus mengimplementasikan `DioException` dengan helper boolean ekspresif (`isNotFound`, `isUnauthorized`, `isConflict`, `isServerError`, `isNetworkError`, dll).

---

## 🔗 Deep Linking (Arsitektur Tautan Dalam & App Links)

Aplikasi LiveEuy Mobile mendukung navigasi langsung melalui Deep Linking baik dengan **Custom URI Scheme** (`liveeuy://`) maupun **Universal App Links** (`https://liveeuy.id`).

### 1. Format URL & Rute yang Didukung
| Rute Deep Link | Format Tautan | Target Halaman & Aksi |
| :--- | :--- | :--- |
| **Detail Konten** | `liveeuy://media/{id}` atau `https://liveeuy.id/media/{id}` | Membuka `ContentDetailScreen` untuk film / serial TV terkait |
| **Pemutar Video** | `liveeuy://watch/{id}` atau `liveeuy://player/{id}` | Langsung memulai pemutaran di `VideoPlayerScreen` |
| **Pencarian Cepat** | `liveeuy://search?q={keyword}` | Beralih ke tab Pencarian dengan query otomatis terisi |
| **Koleksi / Watchlist** | `liveeuy://collection` atau `liveeuy://watchlist` | Beralih ke tab Koleksi tontonan pengguna |
| **Profil & Pengaturan** | `liveeuy://account` atau `liveeuy://profile` | Beralih ke tab Akun pengguna |
| **Halaman Masuk** | `liveeuy://login` | Membuka layar login |

### 2. Konfigurasi Native Platform
- **Android (`android/app/src/main/AndroidManifest.xml`)**:
  - Didaftarkan `<intent-filter>` untuk `android:scheme="liveeuy"` dan `android:host="liveeuy.id"` dengan `android:autoVerify="true"`.
- **iOS (`ios/Runner/Info.plist`)**:
  - Didaftarkan `CFBundleURLTypes` dengan `CFBundleURLSchemes` bernilai `liveeuy`.

### 3. Pengujian Deep Link via Terminal (ADB Android)
```bash
# Buka detail konten film dengan ID 'm1'
adb shell am start -a android.intent.action.VIEW -d "liveeuy://media/m1"

# Buka pemutar video langsung untuk tayangan 'm_hero'
adb shell am start -a android.intent.action.VIEW -d "liveeuy://watch/m_hero"

# Buka tab pencarian dengan kata kunci 'cyberpunk'
adb shell am start -a android.intent.action.VIEW -d "liveeuy://search?q=cyberpunk"

# Buka via Universal Link
adb shell am start -a android.intent.action.VIEW -d "https://liveeuy.id/media/m2"
```

---

## 🔔 Sistem Notifikasi & In-App Dispatcher

LiveEuy Mobile mengintegrasikan sistem notifikasi bertingkat yang terhubung langsung dengan siklus hidup tayangan streaming dan terintegrasi mulus dengan Deep Linking.

### 1. Kasus Tontonan (Streaming Notification Triggers)
- **Episode Baru Rilis (`createNewEpisodeNotification`)**:
  - Dipicu saat ada serial yang merilis episode baru.
  - Tautan otomatis: `liveeuy://media/{mediaId}`.
- **Pengingat Lanjutkan Menonton (`createContinueWatchingReminder`)**:
  - Mengingatkan pengguna jika ada film/serial yang belum tuntas ditonton.
  - Tautan otomatis: `liveeuy://watch/{mediaId}` (langsung lompat ke pemutar).
- **Rekomendasi Trending & Promo VIP (`createRecommendationNotification`)**:
  - Mengabarkan film masuk daftar Top 10 Indonesia atau promo benefit akun VIP.

### 2. Fitur & Komponen Notifikasi
- **Floating In-App Banner**: Menampilkan toast melayang interaktif di dalam aplikasi dengan tombol aksi "Lihat" yang mengeksekusi deep link secara instan.
- **Persistensi Riwayat & Status Baca**: Status `isRead` dan histori notifikasi disimpan persisten di penyimpanan lokal, tidak hilang saat aplikasi dimatikan/di-restart.
- **Notification Sheet**: Dialog modal bottom-sheet dengan indikator badge titik merah jika terdapat notifikasi yang belum dibaca.

---

## 💾 Flutter Local Storage (Arsitektur Penyimpanan Ganda Offline-First)

Aplikasi memisahkan penyimpanan data lokal ke dalam 2 tier keamanan (`LocalStorageService`):

```
┌─────────────────────────────────────────────────────────────────┐
│                     LocalStorageService                         │
├────────────────────────────────┬────────────────────────────────┤
│ 🔒 Tier 1: Secure Storage       │ 📦 Tier 2: SharedPreferences   │
│ (flutter_secure_storage)       │ (shared_preferences)           │
├────────────────────────────────┼────────────────────────────────┤
│ • Auth Access Token (JWT)      │ • User Streaming Settings      │
│ • Auth Refresh Token           │ • Offline Watchlist IDs (Set)  │
│ • Sesi Login Pengguna (JSON)   │ • Watch Progress List (JSON)   │
│ • Kredensial Keystore/Keychain │ • Riwayat Notifikasi & Read    │
└────────────────────────────────┴────────────────────────────────┘
```

### Karakteristik & Alur Offline-First:
1. **Boot Cepat & Responsif**: Pengaturan dan koleksi dimuat instan dari cache lokal tanpa menunggu jaringan backend.
2. **Auto-Restore Sesi**: Jika opsi *Ingat Saya* aktif, token dan profil dipulihkan otomatis saat aplikasi dibuka kembali.
3. **Penyimpanan Fallback**: Memiliki mekanisme fallback in-memory yang aman sehingga pengujian unit test dan lingkungan headless tetap berjalan tanpa kendala.

---

## 🔄 Pemetaan & Sinkronisasi API Backend (`origin/dev-backend`)

Berdasarkan pengecekan cabang `origin/dev-backend`, backend LiveEuy terbagi ke dalam arsitektur microservices:

### 1. `auth-service` (Golang + Gin + JWT + Redis)
- `POST /register`: Pendaftaran pengguna baru (`username`, `email`, `password`)
- `POST /login`: Autentikasi pengguna (mengembalikan `access_token`, `refresh_token`, dan objek `user`)
- `POST /refresh-token`: Rotasi token akses yang kadaluwarsa
- `GET /api/me`: Mengambil profil pengguna aktif (memerlukan header `Authorization: Bearer <token>`)
- `PUT /api/me/name` & `PUT /api/me/password`: Pembaruan profil pengguna

### 2. `catalog-service` (Java Spring Boot 3.3.4 + PostgreSQL)
- **Base Context Path**: `/api/v1` (Port default: `8081`)
- `GET /api/v1/media`: Katalog tayangan (mendukung pagination `Page<MediaResponseDTO>` dengan field `content: [...]`, filter `type`, `genre`, `search`, `sortBy`)
- `GET /api/v1/media/{id}`: Detail film / serial TV
- `POST /api/v1/media/batch`: Mengambil data media secara kolektif
- `POST /api/v1/media/{tvId}/seasons`: Menambahkan season baru
- `POST /api/v1/seasons/{seasonId}/episodes`: Menambahkan episode baru

### 3. Analisis Kesiapan API (Gap Analysis) & Penanganan Klien Mobile:
| Fitur Mobile | Status di Backend (`dev-backend`) | Solusi & Penanganan di Mobile |
| :--- | :--- | :--- |
| **Katalog & Detail Media** | ✅ Tersedia (`catalog-service`) | Klien mobile memetakan schema Spring Page `data: {"content": [...]}` & `durationSeconds`. |
| **Login & Register** | ✅ Tersedia (`auth-service`) | Klien mobile menyimpan token JWT di `FlutterSecureStorage` dan mendukung rotasi token. |
| **User Watchlist** | ⏳ Belum diimplementasikan | Dikelola secara **Offline-First** melalui `LocalStorageService`, siap disinkronkan ke API saat backend siap. |
| **Continue Watching** | ⏳ Belum diimplementasikan | Progres tontonan disimpan persisten di `SharedPreferences` dan disinkronkan saat online. |
| **User Settings** | ⏳ Belum diimplementasikan | Preferensi kualitas streaming, auto skip intro, dan unduh Wi-Fi disimpan persisten di lokal. |
| **Notification API** | ⏳ Belum ada notification-service | Dikelola mandiri oleh mobile `NotificationService` dengan persistensi lokal dan deep link triggers. |


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
flutter pub get
flutter run
```

---

## 📁 Struktur Direktori Proyek

```
LiveEuy/
├── index.html
├── package.json
├── vite.config.ts
├── API_CONTRACT.md                    # Dokumentasi & Kontrak Endpoint OpenAPI
├── AUTH_API_CONTRACT.md               # Kontrak Autentikasi & Security Spec
│
├── auth-service/                      # Microservice Autentikasi (Golang)
│   ├── cmd/server/main.go
│   ├── internal/                      # Config, Domain, Handlers, Migrations, Repositories
│   └── Dockerfile
│
├── catalog-service/                   # Microservice Katalog Media (Spring Boot)
│   ├── src/main/java/com/liveeuy/catalog_service/
│   │   ├── controller/MediaController.java
│   │   ├── entity/Media.java
│   │   ├── repository/MediaRepository.java
│   │   └── service/MediaService.java
│   └── pom.xml
│
├── backend/                           # Backend Starter & Database Guidelines
│   ├── DATABASE_GUIDELINES.md
│   ├── docker-compose.yml
│   └── src/main/resources/db/migration/
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
