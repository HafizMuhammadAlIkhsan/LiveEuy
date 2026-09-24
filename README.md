# LiveEuy - Platform Streaming Video & Sinema Online Modern

![LiveEuy Banner](https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1200&auto=format&fit=crop&q=80)

**LiveEuy** adalah antarmuka web streaming video on demand (VOD) dan sinema modern yang responsif, berkinerja tinggi, dan ramah pengguna (*user-friendly*), dibangun dengan **React 18**, **TypeScript**, **Tailwind CSS**, dan **Vite**.

---

## 🌟 Fitur Utama

### 1. 🎬 Pemutar Video Interaktif Tingkat Lanjut (Advanced Video Player)
- **Playback Nyata (Real Streams)**: Terintegrasi dengan stream MP4 berkualitas tinggi.
- **Efek Cahaya Sinema (Ambient Glow)**: Efek proyeksi pencahayaan dinamis di sekitar layar pemutar video untuk pengalaman menonton ala bioskop premium.
- **Bilah Progres & Scrubbing Interaktif**: Dilengkapi dengan preview timestamp melayang (*hover time tooltip*) dan indikator buffering.
- **Kontrol Lengkap**:
  - Tombol Putar / Jeda (Play/Pause)
  - Lompat Maju & Mundur 10 Detik
  - Tombol **"Lewati Intro" (Skip Intro)** otomatis pada 30 detik pertama
  - Pengatur Kecepatan Putar (0.75x, 1x, 1.25x, 1.5x, 2x)
  - Pemilih Resolusi Kualitas (4K UHD, 1080p, 720p, Otomatis)
  - Pemilih Subtitle / Terjemahan (Bahasa Indonesia, English, Japanese, Nonaktif)
  - Dukungan **Picture-in-Picture (PiP)** dan **Layar Penuh (Fullscreen)**
  - Panel **Statistik Diagnostik Pemutaran (Stats for Nerds)**: Bitrate, FPS, buffer health, dan audio codec
  - Tombol otomatis menuju **Episode Selanjutnya** untuk serial TV

### 2. 🎮 Pintasan Keyboard (Keyboard Shortcuts)
| Tombol | Aksi |
| :--- | :--- |
| `Spasi` / `K` | Putar / Jeda (Play / Pause) |
| `F` | Layar Penuh (Toggle Fullscreen) |
| `M` | Bisukan / Nyalakan Suara (Mute / Unmute) |
| `Panah Kiri` / `Panah Kanan` | Mundur / Maju 10 detik |
| `Panah Atas` / `Panah Bawah` | Naikkan / Turunkan Volume |
| `Esc` | Keluar dari Pemutar / Modal |

### 3. 🍿 Hero Showcase & Preview Otomatis
- Banner sorotan film/serial terpopuler dengan rotasi otomatis.
- Background video teaser dengan tombol nyala/bisu audio.
- Match score rating, badge usia, resolusi (4K UHD / Dolby Vision), dan ringkasan sinopsis.
- Tombol aksi cepat: *Putar Sekarang*, *Tambah ke Koleksi*, dan *Detail Info*.

### 4. 📈 Baris Kategori & Top 10 Indonesia
- **Top 10 Hari Ini**: Menampilkan tipografi angka peringkat berukuran besar yang artistik.
- **Sedang Populer di Indonesia**: Baris tayangan paling banyak ditonton.
- **Genre Carousels**: Aksi & Fiksi Ilmiah, Drama & Cerita Penuh Misteri, Animasi & Komedi.
- **Lanjutkan Menonton (Continue Watching)**: Bar progres tontonan tersimpan otomatis di LocalStorage.

### 5. 🔍 Pencarian Cepat & Filter Multikriteria
- Input pencarian instan dengan auto-suggestions dan dropdown hasil pencarian.
- Halaman eksplorasi dengan filter berdasarkan Format (Semua / Film / Serial), chip Genre (Aksi, Fiksi Ilmiah, Horor, Drama, Komedi, dll.), serta pengurutan (Terpopuler, Rating Tertinggi, Rilis Terbaru).

### 6. 📋 Modal Detail Komprehensif
- Tab **Ringkasan**: Sinopsis, daftar aktor, sutradara, genre, dan rating usia.
- Tab **Episode & Musim**: Pemilih musim interaktif dengan daftar episode, durasi, thumbnail, dan ringkasan tiap episode.
- Tab **Mirip Ini**: Rekomendasi tayangan terkait dengan genre serupa.
- Tab **Ulasan Pengguna**: Formulir interaktif untuk memberikan rating 1-10 bintang dan ulasan komentar real-time.

---

## 🛠️ Arsitektur Teknologi

### Frontend (Client-side)
- **Library UI**: React 18
- **Bahasa**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS 3.4 & PostCSS (Glassmorphism, Dark Theme `#08090d`, Custom Ambient Glow)
- **Ikon**: Lucide React
- **Build Tool**: Vite 5
- **Layer API**: `src/services/api.ts` (Automatic fallback to mock data if offline)
- **Penyimpanan State**: React Context API + LocalStorage persistence

### Backend & Dokumentasi API
- **Framework**: Spring Boot 3.3.4 (Java 17+)
- **Dokumentasi API**: SpringDoc OpenAPI & Swagger UI
- **Spesifikasi Kontrak**: [`API_CONTRACT.md`](./API_CONTRACT.md)
- **Interactive Swagger UI**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
- **OpenAPI Schema**: [http://localhost:8080/api-docs](http://localhost:8080/api-docs)

---

## 🚀 Panduan Memulai (Getting Started)

### 1. Menjalankan Frontend (React + Vite)
```bash
npm install
npm run dev
```
Buka browser pada URL yang ditampilkan di terminal (default: `http://localhost:3000`).

### 2. Menjalankan Backend (Spring Boot + Swagger)
```bash
cd backend
mvn spring-boot:run
```
*Atau menggunakan Docker:*
```bash
cd backend
docker build -t liveeuy-backend .
docker run -p 8080:8080 liveeuy-backend
```
Buka Swagger UI di: **http://localhost:8080/swagger-ui.html**

### 3. Build untuk Produksi
```bash
npm run build
```
Hasil build optimal siap deploy akan tersimpan di direktori `dist/`.

---

## 📁 Struktur Direktori
```
LiveEuy/
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── types.ts
│   ├── context/
│   │   └── WatchContext.tsx
│   ├── data/
│   │   └── mockData.ts
│   └── components/
│       ├── Navbar.tsx
│       ├── HeroBanner.tsx
│       ├── MediaCard.tsx
│       ├── MediaRow.tsx
│       ├── TopTenRow.tsx
│       ├── VideoPlayerModal.tsx
│       ├── DetailModal.tsx
│       ├── CatalogView.tsx
│       ├── WatchlistView.tsx
│       └── Footer.tsx
```