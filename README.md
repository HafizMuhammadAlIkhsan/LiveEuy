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
* **Scrubbing & Timeline Interaktif**: Hover preview timestamp, buffer health indicator, and scrubbing akurat.
* **Kontrol Lengkap**:
  * Putar / Jeda, Lompat Maju & Mundur 10 Detik
  * Tombol **"Lewati Intro" (Skip Intro)** otomatis
  * Pengatur Kecepatan Putar (0.75x, 1x, 1.25x, 1.5x, 2x)
  * Pemilih Resolusi Kualitas (4K UHD, 1080p, 720p, Otomatis)
  * Pemilih Subtitle / Terjemahan (Bahasa Indonesia, English, Japanese, Nonaktif)
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

### 6. 👤 Diferensiasi Pengguna Login (VIP Ultra 4K) vs Tamu (Guest)
* **Pengguna Login (VIP Ultra)**:
  * Akses stream 4K UHD & Dolby Vision/Atmos.
  * Sinkronisasi koleksi watchlist dan continue watching antar-perangkat.
  * Hak memposting ulasan film.
* **Mode Tamu (Guest Mode)**:
  * Eksplorasi katalog terbuka dengan penyimpanan tontonan lokal browser.
  * Ajakan upgrade ke VIP Ultra dengan demo login 1-klik.

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
│   ├── main.dart
│   ├── core/                          # Theme, Data Mock
│   ├── features/                      # Auth, Home, Detail, Player, Search Screens
│   ├── models/                        # Movie, Episode, Review Models
│   ├── providers/                     # Riverpod State Notifiers
│   └── shared/                        # Widgets (Ambient Glow, Glassmorphic Cards)
│
├── src/                               # Web Frontend (React + TypeScript)
│   ├── main.tsx
│   ├── App.tsx
│   ├── context/WatchContext.tsx
│   ├── data/mockData.ts
│   ├── pages/                         # Clean Page Architecture
│   │   ├── HomePage/
│   │   ├── MoviesPage/
│   │   ├── SeriesPage/
│   │   ├── TrendingPage/
│   │   ├── WatchlistPage/
│   │   └── SearchPage/
│   ├── components/                    # Navbar, Player, Hero, Modals, Footer
│   └── services/api.ts                # Full-Stack API Integration Layer
```
