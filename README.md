# LiveEuy Mobile: Aplikasi Streaming Film dan Serial TV

Klien mobile streaming film dan serial televisi berbasis Flutter (Android dan iOS). Repositori ini mencakup aplikasi Flutter serta dokumentasi kontrak RESTful API dan spesifikasi integrasi backend LiveEuy.

---

## Fitur Utama

### 1. Pemutar Video
- Integrasi pemutaran berkas MP4 menggunakan `video_player`.
- Estetika Sinematik Anti-Slop: kontrol sirkular frosted transparan dengan kontras tinggi tanpa ornamen radial glow orbs yang mendistorsi visual tayangan.
- Slider garis waktu (scrubbing) dengan indikator durasi berjalan, total durasi, dan status buffer.
- Pemilih resolusi adaptif seluler: `Otomatis`, `1080p FHD`, `720p HD`, dan `480p SD` (mengeliminasi 4K UHD yang tidak realistis untuk ukuran layar seluler).
- Kontrol layar:
  - Tombol putar dan jeda.
  - Lompat mundur dan maju cepat 10 detik.
  - Tombol lewati intro pada bagian awal tayangan.
  - Pengatur kecepatan putar: `0.75x`, `1.0x`, `1.25x`, `1.5x`, dan `2.0x`.
  - Pemilih trek audio (Indonesia, English) dan takarir tertutup (CC).
  - Rotasi orientasi layar otomatis dan tombol toggle layar penuh (landscape / portrait).
  - Panel diagnostik pemutaran (Stats for Nerds): menampilkan resolusi aktif, FPS render, perkiraan bitrate, dan kondisi buffer jaringan.

### 2. Sistem Iklan Hybrid & Pengecualian VIP
- Selaras 1:1 dengan arsitektur periklanan multi-layer klien web (`dev-frontend`):
  - **Video Pre-Roll Sponsor Ad (`video_preroll`)**: Tayang sebelum video utama diputar dengan timer hitung mundur 5 detik, tombol lewati iklan, navigasi keluar aman (back button), serta pencatatan impresi dan klik sponsor secara aman pasca-render.
  - **In-Feed Sponsor Billboard (`billboard_feed`)**: Kartu promosi sponsor native di antara baris Top 10 dan Sedang Populer pada Beranda dengan proteksi layout anti-overflow pada resolusi layar sempit (320px–360px).
  - **Pengecualian VIP Penuh (Ad-Free Exemption)**: Seluruh pengguna dengan status VIP (`isVip: true`) otomatis dilepaskan dari seluruh layer iklan; tayangan video langsung diputar seketika dan billboard beranda dikembalikan sebagai `SizedBox.shrink()`.

### 3. Gestur dan Navigasi
- Ketuk sekali (single tap): membuka atau menutup instrumen kontrol pemutar (otomatis sembunyi setelah 4 detik tanpa interaksi).
- Ketuk ganda (double tap): melompat 10 detik ke belakang pada sisi kiri atau 10 detik ke depan pada sisi kanan.
- Navigasi bawah melayang 4 tab: Beranda, Cari, Koleksi, dan Akun dengan efek backdrop blur.
- Bouncing scroll physics pada katalog konten.

### 4. Sorotan Utama (Billboard)
- Banner sorotan film utama pada halaman Beranda dengan informasi batas usia (SU, 13+, 16+, 18+) dan lencana resolusi (Full HD, HDR).
- Tombol aksi cepat: Mulai Nonton, Simpan ke Koleksi, dan Buka Detail.

### 5. Kurasi Konten dan Riwayat
- Top 10 Indonesia: daftar tayangan paling banyak ditonton dengan tipografi penomoran besar.
- Lanjutkan Menonton (Continue Watching): menampilkan kartu riwayat tontonan terakhir beserta persentase durasi yang tersimpan.
- Pengelompokan baris konten tematik: Film Populer, Aksi, Drama, dan Fiksi Ilmiah.

### 6. Pencarian dan Filter
- Bilah pencarian teks dengan mekanisme debouncing untuk membatasi frekuensi query saat pengguna mengetik.
- Filter berdasarkan kategori format (Semua, Film, Serial) dan pilihan chip genre.
- Grid hasil pencarian yang langsung terhubung ke halaman detail atau pemutar.

### 7. Detail Konten
- Tab Ringkasan: sinopsis lengkap, sutradara, pemeran utama, genre, tahun rilis, dan durasi.
- Tab Episode dan Musim: pemilih musim serial TV dengan daftar episode, durasi tayang, dan kartu ringkasan cerita tiap episode.
- Tab Konten Serupa: rekomendasi tayangan berdasarkan kesamaan genre.
- Tab Ulasan: daftar ulasan pengguna beserta formulir pengiriman rating bintang (1-10) dan komentar.

### 8. Autentikasi dan Akun Pengguna
- Pengguna Terdaftar (VIP):
  - Lencana status akun VIP.
  - Sinkronisasi daftar tontonan (Watchlist) dan progres durasi menonton.
  - Hak akses pengiriman ulasan dan rating.
- Mode Tamu (Guest):
  - Akses penjelajahan katalog film dan serial.
  - Pembatasan fitur interaktif (watchlist, ulasan, dan peningkatan VIP memerlukan login akun).
- Pengaturan Preferensi Streaming:
  - Opsi kualitas video dan pembatasan unduh hanya melalui jaringan Wi-Fi.
  - Toggle lewati intro otomatis dan pembersihan cache lokal.
  - Manajemen sesi login dengan opsi Ingat Saya.

---

## Arsitektur Teknologi

### Klien Mobile (Flutter)
- Framework: Flutter 3.x
- Bahasa: Dart 3 (Sound Null Safety)
- State Management: Flutter Riverpod 2.5 (`StateNotifierProvider` dan `ProviderScope`)
- Pemutar Video: pustaka `video_player` dengan custom ambient shader
- Manajemen Cache Gambar: `cached_network_image` dengan cache multi-tier (RAM dan disk)
- Tipografi dan Ikon: Google Fonts (Outfit untuk judul, Inter untuk teks konten), Material Icons, dan Cupertino Icons
- Penyimpanan Kredensial dan Data: `flutter_secure_storage` (Android Keystore / iOS Keychain) dan `shared_preferences`
- Tema Tampilan: Dark mode (`#0F0E17`) dengan aksen glassmorphic

### Layanan Backend (Microservices)
Arsitektur backend LiveEuy (`dev-backend`) mengadopsi pola microservices terpisah:
1. **`auth-service` (Port 8080)**:
   - Framework: Go 1.22 + Gin Web Framework
   - Basis Data & Cache: PostgreSQL 16 & Redis 7
   - Endpoint: `/api/v1/auth/*` (Login, Register, Demo Persona Login, Refresh Token Rotation, Profil, Ubah Sandi, Perangkat Terhubung)
2. **`catalog-service` (Port 8081)**:
   - Framework: Spring Boot 3.4.3 (Java 21)
   - Basis Data: PostgreSQL (JPA / Hibernate)
   - Dokumentasi API: SpringDoc OpenAPI & Swagger UI (`http://localhost:8081/swagger-ui.html`)
   - Endpoint: `/api/v1/media/*` (Katalog Pageable, Pencarian, Top 10, Batch Media, Serial TV & Episodes)

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

## Manajemen Keamanan Perangkat & Pembedaan Sesi Login (Mobile vs Web)

LiveEuy Mobile mengimplementasikan arsitektur pembedaan sesi login perangkat yang terpadu dengan klien web (`dev-frontend`) dan backend (`auth-service` / Spring Boot):

### 1. Identifikasi Klien via HTTP Header

Setiap request dari klien mobile ke backend secara otomatis menginjeksi header identitas perangkat melalui `ApiConfig`:
- **`User-Agent`**: `LiveEuy-Mobile/2.4.0 (Android; Mobile)` atau `LiveEuy-Mobile/2.4.0 (iOS; Mobile)` (dibaca oleh Go `auth-service` untuk pencatatan sesi perangkat).
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

## Integrasi API Backend (Microservices Alignment)

Pemetaan endpoint backend (`origin/dev-backend`) dengan klien mobile:

| Fitur Mobile | Status Backend (`dev-backend`) | Penanganan di Klien Mobile |
| :--- | :--- | :--- |
| **Katalog Media & Pencarian** | Tersedia (`catalog-service` :8081) | Klien memetakan skema Spring Page `data: {"content": [...]}` dan `durationSeconds` dengan query parameter `type`, `search`, `size`. |
| **Detail & Episode** | Tersedia (`catalog-service` :8081) | Memetakan Season & Episode DTO lengkap beserta durasi tayang. |
| **Batch Fetch Media** | Tersedia (`catalog-service` :8081) | Mengambil daftar tayangan sekaligus via `POST /api/v1/media/batch`. |
| **Login, Register & Refresh** | Tersedia (`auth-service` :8080) | Klien menyimpan token JWT di `FlutterSecureStorage` dan mendukung refresh token otomatis. |
| **Persona Demo Login** | Tersedia (`auth-service` :8080) | Tombol cepat persona di `LoginScreen` (`Tamu 1 Dev`, `VIP 2 Dev`, `Ultra 4 Dev`). |
| **Profil & Ganti Sandi** | Tersedia (`auth-service` :8080) | Sinkronisasi metrik `devices`, `watchHours`, `memberSince`, dan update kata sandi. |
| **Sesi & Keamanan Perangkat**| Tersedia (`auth-service` :8080) | Mengirimkan header `X-Device-Type: Mobile` dan mengelola multi-sesi via `DeviceSecuritySheet`. |
| **User Watchlist** | Fallback offline-first | Disimpan lokal di `LocalStorageService`; disinkronkan saat endpoint user service aktif. |
| **Continue Watching** | Fallback offline-first | Disimpan di `SharedPreferences` dan disinkronkan otomatis saat online. |
| **Pengaturan Pengguna** | Fallback offline-first | Preferensi kualitas streaming, auto skip intro, dan unduh Wi-Fi disimpan di lokal. |
| **Notifikasi** | Layanan lokal | Dikelola oleh `NotificationService` lokal dengan persistensi data dan deep link dispatcher. |

---

## Panduan Memulai

### 1. Menjalankan Layanan Backend Lokal (Docker)

Backend LiveEuy membutuhkan PostgreSQL dan Redis. Anda dapat menjalankannya dengan mudah menggunakan Docker.

#### Instalasi Docker di CachyOS (Arch Linux)
Bagi pengguna **CachyOS**, gunakan skrip otomatis yang telah disediakan di repositori:
```bash
# Jalankan skrip instalasi (memerlukan hak akses sudo)
sudo ./scripts/install_docker_cachyos.sh

# Aktifkan grup docker di terminal saat ini:
newgrp docker
```

#### Menjalankan Kontainer PostgreSQL & Redis
```bash
# Jalankan container di latar belakang
docker compose -f backend/docker-compose.yml up -d

# Cek container yang berjalan
docker compose -f backend/docker-compose.yml ps
```

### 2. Menjalankan Klien Mobile (Flutter)

Prasyarat: Flutter SDK versi 3.22.0 atau lebih baru.

```bash
# 1. Unduh dependensi proyek
flutter pub get

# 2. Periksa perangkat atau emulator yang terhubung
flutter devices

# 3. Jalankan aplikasi pada perangkat target
flutter run
```

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

### 3. Integrasi Backend & Dokumentasi Kontrak

Aplikasi mobile terhubung ke backend services LiveEuy (`auth-service` dan `catalog-service`). Kontrak API, spesifikasi otentikasi token, dan referensi skema database dapat dilihat pada:
- [`backend/README.md`](backend/README.md): Panduan umum backend microservices & docker compose.
- [`backend/API_CONTRACT.md`](backend/API_CONTRACT.md): Definisi endpoint, format JSON request/response, dan skema Dio exception.
- [`backend/AUTHENTICATION_AND_SECURITY.md`](backend/AUTHENTICATION_AND_SECURITY.md): Panduan refresh token rotation dan keamanan sesi.
- [`backend/DATABASE_GUIDELINES.md`](backend/DATABASE_GUIDELINES.md): Pedoman skema database dan diagram ERD.
- [`backend/migrations/`](backend/migrations/): Referensi berkas migrasi SQL skema tabel.

### 3. Pembuatan Berkas Rilis (Production Build)

```bash
# Android APK
flutter build apk --release

# Android App Bundle (Google Play Store)
flutter build appbundle --release

# iOS Bundle (macOS dengan Xcode)
flutter build ipa --release
```

Berkas biner Android APK hasil build tersimpan di `build/app/outputs/flutter-apk/app-release.apk`.

---

## Struktur Direktori

```
liveeuy_mob/
├── pubspec.yaml                       # Konfigurasi dependensi dan aset Flutter
├── analysis_options.yaml              # Aturan linter Dart
├── android/                           # Proyek native Android
├── ios/                               # Proyek native iOS
├── lib/
│   ├── main.dart                      # Titik masuk aplikasi, inisialisasi tema dan routing
│   ├── core/                          # Modul inti global
│   │   ├── data/
│   │   │   └── mock_data.dart         # Data seed katalog dan fallback offline
│   │   ├── deeplink/                  # Layanan deep link parser dan dispatcher rute
│   │   │   └── deep_link_service.dart
│   │   ├── network/                   # Klien Dio, interceptor, dan klasifikasi DioException
│   │   │   ├── api_client.dart
│   │   │   ├── api_config.dart
│   │   │   ├── api_exception.dart
│   │   │   ├── api_response.dart
│   │   │   ├── api_service.dart
│   │   │   ├── dio_exception.dart
│   │   │   └── dio_interceptor.dart
│   │   ├── notification/              # Layanan dispatch notifikasi dan in-app banner
│   │   │   └── notification_service.dart
│   │   ├── storage/                   # Layanan penyimpanan lokal (SecureStorage dan SharedPreferences)
│   │   │   └── local_storage_service.dart
│   │   └── theme/                     # Definisi tema, palet warna, dan tipografi
│   │       └── app_theme.dart
│   ├── features/                      # Modul layar dan fungsionalitas fitur
│   │   ├── auth/                      # Layar login dan pendaftaran akun
│   │   │   ├── login_screen.dart
│   │   │   └── register_screen.dart
│   │   ├── home/                      # Beranda, hero billboard, dan baris kategori
│   │   │   ├── home_screen.dart
│   │   │   └── widgets/
│   │   │       ├── hero_showcase_banner.dart
│   │   │       └── in_feed_sponsor_billboard.dart # Kartu sponsor billboard feed
│   │   ├── detail/                    # Halaman detail tayangan dan tab episode
│   │   │   └── content_detail_screen.dart
│   │   ├── player/                    # Layar pemutar video, pre-roll ad overlay, dan HUD kontrol
│   │   │   └── video_player_screen.dart
│   │   └── search/                    # Pencarian katalog dan filter genre
│   │       └── search_screen.dart
│   ├── models/                        # Model data DTO (Movie, Episode, Ad, Review, Settings)
│   │   ├── ad_model.dart              # Model kampanye iklan dan layer placement
│   │   ├── episode_model.dart
│   │   ├── movie_model.dart
│   │   ├── notification_model.dart
│   │   ├── review_model.dart
│   │   ├── user_settings_model.dart
│   │   └── watch_progress_model.dart
│   ├── providers/                     # State management Riverpod
│   │   ├── ad_provider.dart           # Provider kampanye iklan, impresi, dan VIP gating
│   │   ├── auth_provider.dart
│   │   ├── media_provider.dart
│   │   ├── notification_provider.dart
│   │   ├── player_provider.dart
│   │   ├── search_provider.dart
│   │   └── user_settings_provider.dart
│   └── shared/                        # Komponen widget yang dipakai bersama
│       └── widgets/
│           ├── ambient_glow.dart
│           ├── glass_container.dart
│           ├── liveeuy_logo.dart
│           ├── notification_modal.dart
│           ├── resolution_badge.dart
│           └── streamflix_logo.dart
└── test/                              # Pengujian unit dan widget
    ├── account_settings_test.dart
    ├── ad_system_test.dart            # Pengujian komprehensif sistem iklan hybrid & VIP
    ├── notification_test.dart
    ├── vip_subscription_test.dart
    ├── widget_test.dart
    ├── network/
    └── services/
```

---

## Lisensi dan Kontributor

Proyek ini dikembangkan oleh tim LiveEuy untuk keperluan pengembangan platform streaming mobile.
