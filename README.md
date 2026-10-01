# LiveEuy — Web Frontend Platform

![LiveEuy Banner](https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1200&auto=format&fit=crop&q=80)

> **Branch:** `dev-frontend`  
> Repository khusus untuk aplikasi **Web Frontend LiveEuy** berbasis **React 18**, **TypeScript**, **Vite**, dan **Tailwind CSS**.

---

## 🌟 Ikhtisar Aplikasi

**LiveEuy Web Frontend** adalah aplikasi web streaming video on demand (VOD) dan sinema online modern dengan estetika sinematik gelap (*Cinematic Dark Theme* `#08090d`), dynamic ambient lighting glow, animasi mulus, Progressive Web App (PWA) readiness, serta arsitektur modular yang skalabel.

---

## 🚀 Fitur Utama

### 1. 🎬 Pemutar Video Sinematik (Advanced Cinema Video Player)
* **Real Streams & Adaptive Playback**: Dukungan stream MP4 dan HLS (`.m3u8`) melalui `hls.js`.
* **Dynamic Ambient Glow**: Efek pencahayaan pendaran dinamis di sekitar layar pemutar video ala bioskop modern.
* **Timeline Interaktif & Scrubbing**: Hover preview timestamp, buffer health indicator, dan scrubbing presisi.
* **Kontrol Player Lengkap**:
  * Play / Pause, Lompat Maju & Mundur 10 Detik
  * Tombol cerdas **"Lewati Intro" (Skip Intro)**
  * Kontrol kecepatan pemutaran (0.75x, 1x, 1.25x, 1.5x, 2x)
  * Pemilih resolusi kualitas (4K UHD, 1080p, 720p, Otomatis)
  * Pemilih audio multi-bahasa & takarir tertutup (Closed Captions)
  * Dukungan **Picture-in-Picture (PiP)** dan **Layar Penuh (Fullscreen)**
  * Panel **Stats for Nerds**: Bitrate, FPS, buffer health, codec

### 2. 🍿 Hero Showcase & Rotasi Carousel
* Banner sorotan film/serial dengan rotasi otomatis dan Ken Burns effect.
* Background video teaser dengan toggle audio mute/unmute.
* Match score rating, badge batas usia (SU, 13+, 16+, 18+), dan badge resolusi (4K UHD / Dolby Vision / Atmos).
* Aksi cepat: *Putar Sekarang*, *Tambah ke Koleksi*, dan *Detail Info*.

### 3. 📈 Baris Kategori & Top 10 Indonesia
* **Top 10 Hari Ini di Indonesia**: Desain tipografi angka peringkat besar ala Netflix.
* **Lanjutkan Menonton (Continue Watching)**: Penyimpanan posisi tontonan otomatis di LocalStorage / WatchContext.
* **Koleksi Tematik**: *Aksi & Pahlawan Super*, *Drama & Romansa*, *Fiksi Ilmiah (Sci-Fi)*, dll.

### 4. 🔍 Pencarian Instan & Filter Multikriteria
* Pencarian cepat dengan debouncing cerdas melalui custom hook `useAjaxSearch`.
* Filter multikriteria: Format (Semua / Film / Serial), chip Genre, dan Pengurutan (Popular, Rating, Newest).

### 5. 📋 Modal Detail Tayangan Interaktif (4 Tab)
* **Tab Ringkasan**: Sinopsis, sutradara, aktor, rating usia, dan detail teknis.
* **Tab Episode & Musim**: Season selector interaktif dengan thumbnail dan deskripsi per episode.
* **Tab Mirip Ini**: Rekomendasi tayangan terkait dengan genre serupa.
* **Tab Ulasan Penonton**: Rating bintang 1-10 dan form pengiriman ulasan interaktif.

### 6. 👤 Personalisasi Akun & Autentikasi
* Mode Akun: **Pengguna Terdaftar (VIP Ultra / Premium)** vs **Tamu (Guest Mode)**.
* Alur Lupa Password (`/forgot-password`), Reset Password (`/reset-password`), dan Verifikasi Email PIN 6-Digit (`/verify-email`).
* Proteksi sesi dan deteksi konflik perangkat aktif.

### 7. 🛡️ Admin Studio CMS Modular
* **Role-Based Access Control (RBAC)**: Proteksi rute `/admin` dengan `<AdminRouteGuard />` (403 Forbidden untuk unauthorized).
* **Arsitektur Modular**: Terbagi dalam 9 modul mandiri:
  1. `MediaModule`: Manajemen katalog, tambah tayangan, edit, hapus, backup & restore (JSON).
  2. `EpisodesModule`: Manajemen musim dan episode serial TV.
  3. `UsersModule`: Kontrol status pengguna (aktif/suspend), role, dan reset password.
  4. `TrackingModule`: Pelacakan sesi aktif dan audit perangkat.
  5. `BannerModule`: Pengaturan banner pengumuman & broadcast alert.
  6. `AdsModule`: Manajemen billboard ad & kampanye sponsor.
  7. `AnalyticsModule`: Metrik performa tayangan dan popularitas.
  8. `ReviewsModule`: Moderasi ulasan penonton.
  9. `SystemModule`: Diagnostik REST API backend, ping server, dan reset data default.
* **Stream URL Health Inspector**: Uji coba tautan streaming real-time sebelum dipublikasikan.

---

## 🛠️ Tech Stack

| Kategori | Teknologi |
| :--- | :--- |
| **Framework & Core** | React 18, TypeScript 5, Vite 5 |
| **Styling & UI** | Tailwind CSS 3.4, PostCSS, Lucide React Icons |
| **Routing** | React Router DOM v7 |
| **Media Playback** | HLS.js, HTML5 Video API |
| **Testing** | Vitest 2, React Testing Library, JSDOM |
| **PWA & Offline** | Service Worker, Web App Manifest |

---

## 📁 Struktur Direktori

```text
liveeuy/
├── docs/                       # Dokumentasi kontrak API & integrasi
│   ├── ADMIN_INTEGRATION_GUIDE.md
│   ├── API_CONTRACT.md
│   └── AUTH_API_CONTRACT.md
├── public/                     # Static assets (poster, icon, manifest, sw.js)
│   ├── posters/
│   ├── favicon.ico
│   ├── manifest.json
│   └── sw.js
├── src/
│   ├── assets/                 # Asset styling & SVG
│   ├── components/             # Reusable UI components
│   │   ├── BillboardAd/
│   │   ├── CastSection/
│   │   ├── DetailModal/
│   │   ├── HeroBanner/
│   │   ├── MediaCard/
│   │   ├── MediaRow/
│   │   ├── Navbar/
│   │   ├── TopTenRow/
│   │   └── VideoPlayerModal/
│   ├── context/                # Global React context (WatchContext)
│   ├── data/                   # Mock data katalog sinema fallback
│   ├── hooks/                  # Custom React hooks (useAjaxSearch, useModalA11y, dll)
│   ├── pages/                  # Halaman aplikasi
│   │   ├── AdminPage/          # Modular Admin Studio CMS (9 Modules)
│   │   ├── DetailPage/         # Halaman detail film / series
│   │   ├── ErrorPages/         # 404, 403 Forbidden, 500
│   │   ├── HomePage/           # Showcase utama & kategori
│   │   ├── MoviesPage/         # Katalog film bioskop
│   │   ├── ResetPasswordPage/  # Reset password form
│   │   ├── SearchPage/         # Pencarian katalog
│   │   ├── SeriesPage/         # Katalog TV series
│   │   ├── TrendingPage/       # Tayangan trending
│   │   ├── VerifyEmailPage/    # Verifikasi email kode OTP
│   │   └── WatchlistPage/      # Daftar tontonan tersimpan
│   ├── services/               # API layer (Catalog, Auth, Fallback handler)
│   ├── test/                   # Vitest unit & integration test suites
│   ├── types/                  # TypeScript interface definitions
│   ├── utils/                  # Helper functions (security, image fallback, tracking)
│   ├── App.tsx                 # Root router & layout
│   └── main.tsx                # React DOM entry point
├── .env.example                # Template variabel lingkungan
├── .gitignore                  # Aturan git ignore khusus frontend
├── index.html                  # HTML entry point Vite
├── package.json                # Dependensi & script npm
├── tailwind.config.js          # Konfigurasi styling Tailwind CSS
├── tsconfig.json               # Konfigurasi TypeScript
├── vite.config.ts              # Konfigurasi build Vite
└── vitest.config.ts            # Konfigurasi test runner Vitest
```

---

## ⚙️ Persyaratan Sistem

* **Node.js**: v18.0.0 atau lebih tinggi (disarankan v20 LTS)
* **npm**: v9.0.0 atau lebih tinggi (atau **yarn** / **pnpm**)

---

## 🏃 Menjalankan Aplikasi Secara Lokal

### 1. Salin Variabel Lingkungan
Salin file `.env.example` ke `.env`:
```bash
cp .env.example .env
```
Isi konfigurasi URL backend (opsional, jika tidak dijalankan sistem otomatis menggunakan fallback mock data bawaan):
```env
VITE_CATALOG_API_URL=http://localhost:8081/api/v1
VITE_API_BASE_URL=http://localhost:8080/api/v1
VITE_AUTH_API_URL=http://localhost:8080
```

### 2. Jalankan Development Server
```bash
npm run dev
```
Buka browser pada: [http://localhost:5173](http://localhost:5173)

### 3. Menjalankan Pengujian (Testing)
Jalankan seluruh rangkaian tes otomatis menggunakan Vitest:
```bash
npm run test
```
Atau jalankan dalam mode interaktif (watch mode):
```bash
npm run test:watch
```

### 4. Build untuk Produksi
Kompilasi TypeScript dan build bundle aset teroptimasi:
```bash
npm run build
```
Preview hasil build:
```bash
npm run preview
```

---

## 📄 Lisensi & Kontribusi

Proyek ini dikembangkan secara internal untuk platform streaming **LiveEuy**.  
Untuk pengembangan backend dan mobile, silakan beralih ke branch masing-masing:
* Branch Backend: `dev-backend`
* Branch Mobile: `dev-mobile`
