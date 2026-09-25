# LiveEuy Mobile — Platform Streaming Video & Sinema Online Modern

![LiveEuy Banner](https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80)

**LiveEuy Mobile** adalah aplikasi pemutar dan penjelajah film & serial televisi modern berbasis **Flutter** (Android & iOS). Aplikasi ini menghadirkan antarmuka bertema *Cinematic Dark Mode* yang responsif, berkinerja tinggi pada 60 FPS konsisten tanpa *jank*, pemutar video berteknologi *Dynamic Ambient Glow*, serta arsitektur berbasis *Async-First* dengan **Flutter Riverpod**.

---

## 🌟 Fitur Utama (Key Features)

### 1. 🎬 Pemutar Video Interaktif Tingkat Lanjut (Advanced Video Player)
- **Playback Nyata (Real Streams)**: Terintegrasi langsung dengan streaming berkas MP4 beresolusi tinggi tanpa jeda *buffering* yang mengganggu.
- **Efek Pendaran Cahaya Sinematik (Ambient Glow)**: Memancarkan proyeksi pendaran warna dinamis di sekeliling pemutar video untuk menghadirkan atmosfer ruang bioskop premium di layar genggam.
- **Bilah Progres & Scrubbing Interaktif**: Slider garis waktu presisi yang dilengkapi dengan penanda durasi terkini, total durasi, serta indikator kesehatan *buffer*.
- **Kontrol Lengkap Layar**:
  - Tombol Putar / Jeda utama dengan efek visual *glow halo*.
  - Tombol lompat mundur dan maju cepat **10 detik**.
  - Tombol pintar **"Lewati Intro" (Skip Intro)** otomatis pada detik-detik awal tayangan.
  - Pengatur Kecepatan Putar fleksibel: `0.75x`, `1.0x`, `1.25x`, `1.5x`, dan `2.0x`.
   - Pemilih Audio dan Takarir: Trek audio multi-bahasa (*Indonesia [Asli]*, *English*) serta takarir teks tertutup (CC).
   - Rotasi Layar Otomatis & Toggle Mode Layar Penuh (*Fullscreen Landscape / Portrait*).
   - **Panel Diagnostik Pemutaran (Stats for Nerds)**: Menampilkan overlay teknis mencakup resolusi aktif, FPS render, perkiraan bitrate, dan kondisi buffer jaringan.

### 2. 📱 Gestur Layar Sentuh & Navigasi Mobile (Touch Gestures & Mobile Navigation)
- **Ketuk Sekali (Single Tap)**: Membuka dan menutup panel instrumen kontrol pemutar (dengan fitur otomatis sembunyi dalam 4 detik).
- **Ketuk Ganda Sisi Kiri / Kanan (Double Tap)**: Melakukan *seek* instan mundur atau maju 10 detik.
- **Bilah Navigasi Kaca Bawah (Glassmorphic Bottom Navigation)**: Panel navigasi melayang 4 menu (*Beranda*, *Cari*, *Koleksi*, *Akun*) dengan efek keburaman latar (*backdrop blur*).
- **Fisika Gulir Halus (Bouncing Scroll Physics)**: Pengalaman penelusuran katalog yang elastis dan natural khas ekosistem mobile.

### 3. 🍿 Hero Showcase & Billboard Unggulan
- Banner sorotan utama bergaya sinematik dengan visual poster resolusi tinggi dan *backdrop* adaptif.
- Informasi lengkap meliputi persentase kecocokan (*Match Score*), label batas usia penonton (SU, 13+, 16+, 18+), serta lencana kualitas tayangan (Full HD, HDR).
- Tombol aksi cepat: Mulai Tonton (*Play*), Simpan ke Koleksi (*Watchlist*), dan Lihat Rincian (*Detail*).

### 4. 📈 Baris Kategori & Top 10 Indonesia
- **Top 10 Hari Ini di Indonesia**: Jajaran konten paling diminati dengan tipografi angka urutan berukuran besar yang artistik.
- **Lanjutkan Menonton (Continue Watching)**: Bar progres tontonan terakhir yang diperbarui secara otomatis dan tersimpan secara persisten.
- **Baris Kategori Tematik**: Pengelompokan tontonan mulai dari *Film Populer*, *Aksi & Pahlawan Super*, *Drama Periode*, hingga *Fiksi Ilmiah (Sci-Fi)*.

### 5. 🔍 Pencarian Instan & Filter Multikriteria
- Bilah pencarian cepat dengan mekanisme *debouncing* agar pencarian tetap responsif tanpa membebani thread antarmuka.
- Penyaringan dinamis berdasarkan format tontonan (*Semua*, *Film*, *Serial*) serta pilihan *chip* genre.
- Grid hasil penelusuran interaktif yang langsung mengarahkan ke halaman detail atau pemutar video.

### 6. 📋 Lembar Detail Tayangan Komprehensif (4 Tab Interaktif)
- **Tab Ringkasan**: Sinopsis cerita mendalam, jajaran pemeran utama, sutradara, genre, tahun rilis, dan durasi.
- **Tab Episode & Musim**: Pemilih musim (*season selector*) untuk serial TV dengan daftar episode, durasi tayang, dan kartu ringkasan cerita tiap episode.
- **Tab Mirip Ini**: Rekomendasi tayangan terkait yang dikurasi berdasarkan kemiripan tema dan genre.
- **Tab Ulasan Penonton**: Ruang diskusi ulasan pengguna dengan rating bintang (1–10) serta formulir pengiriman testimoni langsung.

### 7. 👤 Personalisasi Akun: Pengguna Terdaftar (VIP Premium) vs Pengguna Tamu (Guest)
- **Pengguna Terdaftar (VIP Premium)**:
  - Lencana akun premium *LiveEuy VIP*.
  - Sinkronisasi daftar koleksi tontonan (*Watchlist*) dan kelanjutan durasi tontonan.
  - Akses penuh untuk menulis dan mempublikasikan ulasan film.
  - Streaming kualitas maksimal bebas gangguan iklan.
- **Pengguna Tamu (Guest Mode)**:
  - Mode penjelajahan katalog terbuka untuk menelusuri film dan serial.
  - Akses fitur dibatasi: pengguna tamu tidak dapat melakukan peningkatan akun VIP, menyimpan koleksi tontonan, atau mengirim ulasan sebelum masuk ke akun.
- **Pengaturan Preferensi Streaming Mobile**:
  - Pilihan kualitas tayangan fleksibel dan hemat kuota (*Unduh Hanya via Wi-Fi*).
  - Pengaktifan fitur *Auto Skip Intro* dan pembersihan cache aplikasi.
  - Manajemen sesi login aman dengan dukungan fitur *Ingat Saya*.

---

## 🛠️ Arsitektur Teknologi

### Mobile (Client-side)
- **Framework**: Flutter 3.x
- **Bahasa**: Dart 3 (Strict Sound Null Safety)
- **Manajemen State**: Flutter Riverpod 2.5 (`StateNotifierProvider` & `ProviderScope`, arsitektur Async-First)
- **Pemutar Media**: `video_player` dengan custom hardware accelerated pipeline & ambient diffuse shader
- **Pengelolaan Gambar**: `cached_network_image` dengan caching multi-tier (RAM & Disk)
- **Tipografi & Ikonografi**: Google Fonts (`Outfit` untuk tajuk, `Inter` untuk teks bacaan) & Cupertino/Material Icons
- **Penyimpanan Lokal & Kredensial**: `flutter_secure_storage` (Keystore Android / Keychain iOS) & `shared_preferences`
- **Gaya Desain**: Glassmorphism, Material 3, Dark Cinema Theme (`#0F0E17`)

### Backend & Dokumentasi API (Terintegrasi)
- **Framework**: Spring Boot 3.3.4 (Java 17+)
- **Dokumentasi API**: SpringDoc OpenAPI & Swagger UI
- **Spesifikasi Endpoint**:
  - `GET /api/v1/media` — Daftar katalog & Top 10
  - `GET /api/v1/media/{id}` — Detail konten dan daftar episode
  - `GET /api/v1/media/{id}/reviews` & `POST` — Manajemen ulasan tayangan
  - `GET /api/v1/user/watchlist` & `POST` — Sinkronisasi koleksi pengguna
  - `POST /api/v1/user/progress` — Pembaruan durasi Lanjutkan Menonton
- **Interactive Swagger UI**: `http://localhost:8080/swagger-ui.html`
- **OpenAPI Schema**: `http://localhost:8080/api-docs`

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

## 🚀 Panduan Memulai (Getting Started)

### 1. Menjalankan Aplikasi Mobile (Flutter)

Pastikan Flutter SDK (`>= 3.22.0`) telah terpasang di perangkat Anda.

```bash
# 1. Unduh seluruh dependensi paket
flutter pub get

# 2. Periksa kesiapan perangkat atau emulator
flutter devices

# 3. Jalankan aplikasi pada target perangkat
flutter run
```

> **Tips Konfigurasi Endpoint Backend di Mobile**:
> - **Android Emulator**: Gunakan `http://10.0.2.2:8080/api/v1` (karena `localhost` merujuk ke mesin emulator itu sendiri).
> - **Perangkat Fisik (HP)**: Gunakan `http://<IP-LOKAL-KOMPUTER>:8080/api/v1` (pastikan komputer dan HP berada di jaringan Wi-Fi yang sama).
> - **iOS Simulator**: Gunakan `http://localhost:8080/api/v1`.

---

### 2. Menjalankan Backend (Spring Boot + Swagger)

Jika ingin menjalankan layanan backend Spring Boot secara lokal:

```bash
# Menjalankan via Maven
cd backend
mvn clean spring-boot:run

# Atau menjalankan via Docker
docker build -t liveeuy-backend .
docker run -p 8080:8080 liveeuy-backend
```

Buka dokumentasi endpoint interaktif pada peramban web: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html).

---

### 3. Build untuk Produksi (Release Build)

```bash
# Android APK (Siap pasang langsung di perangkat)
flutter build apk --release

# Android App Bundle (Siap rilis ke Google Play Console)
flutter build appbundle --release

# iOS Bundle (Khusus macOS & Xcode)
flutter build ipa --release
```

Hasil berkas biner Android APK akan berada pada folder `build/app/outputs/flutter-apk/app-release.apk`.

---

## 📁 Struktur Direktori Bersih & Modular (Clean Mobile Architecture)

```
liveeuy_mob/
├── pubspec.yaml                       # Konfigurasi dependensi & aset Flutter
├── analysis_options.yaml              # Aturan linter & standarisasi kode Dart
├── android/                           # Proyek native Android
├── ios/                               # Proyek native iOS
├── lib/
│   ├── main.dart                      # Titik masuk aplikasi (Theme, ProviderScope, Bottom Nav)
│   ├── core/                          # Fondasi global aplikasi
│   │   ├── data/
│   │   │   └── mock_data.dart         # Seeded media catalogue, episode, & offline fallback
│   │   ├── network/                   # Arsitektur Jaringan Dio & DioException (Dio 5.x spec)
│   │   │   ├── api_client.dart        # Klien HTTP terpadu dengan pipeline Interceptor
│   │   │   ├── api_config.dart        # Konfigurasi Base URL, timeout, & headers
│   │   │   ├── api_exception.dart     # Typed exceptions (BadRequest, Unauthorized, NotFound, dll)
│   │   │   ├── api_response.dart      # Generic wrapper JSON ApiResponse backend
│   │   │   ├── api_service.dart       # Sinkronisasi katalog, watchlist, progress, & settings
│   │   │   ├── dio_exception.dart     # Model DioException, RequestOptions, Response, & DioExceptionType
│   │   │   └── dio_interceptor.dart   # Interceptor Logging, Bearer Token, & Error Handling
│   │   └── theme/
│   │       └── app_theme.dart         # Design System: Palet warna, Typography, Glassmorphism
│   ├── features/                      # Modul fitur berbasis domain
│   │   ├── auth/                      # Otentikasi (Halaman Login & Pendaftaran Akun)
│   │   │   ├── login_screen.dart
│   │   │   └── register_screen.dart
│   │   ├── home/                      # Beranda (Hero Billboard, Top 10, Continue Watching)
│   │   │   └── home_screen.dart
│   │   ├── detail/                    # Lembar Detail Konten (4 Tab Interaktif)
│   │   │   └── content_detail_screen.dart
│   │   ├── player/                    # Pemutar Video (Ambient Glow, Gestur, Stats for Nerds)
│   │   │   └── video_player_screen.dart
│   │   └── search/                    # Pencarian Cepat & Filter Chip
│   │       └── search_screen.dart
│   ├── models/                        # Entitas Data Model (Immutable DTOs)
│   │   ├── episode_model.dart
│   │   ├── movie_model.dart
│   │   └── review_model.dart
│   ├── providers/                     # State Management (Riverpod Notifiers)
│   │   ├── auth_provider.dart         # State sesi pengguna & status VIP
│   │   ├── media_provider.dart        # State koleksi tontonan, rating, & continue watching
│   │   ├── player_provider.dart       # State player HUD, audio/subtitel, & diagnostik
│   │   └── search_provider.dart       # State penelusuran & filter hasil
│   └── shared/                        # Komponen UI yang dapat digunakan kembali
│       └── widgets/
│           ├── ambient_glow.dart      # Shader difusi pencahayaan belakang pemutar
│           ├── glass_container.dart   # Wadah kartu glassmorphism semi-transparan
│           ├── liveeuy_logo.dart      # Lencana logo brand LiveEuy
│           ├── resolution_badge.dart  # Chip label kualitas (Full HD, HD, HDR)
│           └── streamflix_logo.dart   # Tipografi brand StreamFlix
└── test/
    └── widget_test.dart               # Pengujian logika provider & unit testing
```

---

## 👥 Kontributor
