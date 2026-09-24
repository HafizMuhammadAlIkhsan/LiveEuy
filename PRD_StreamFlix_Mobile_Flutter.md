# Product Requirements Document (PRD)
# Aplikasi Mobile Streaming Film — "StreamFlix" (Flutter)

**Versi:** 1.0
**Tanggal:** 24 September 2026
**Platform:** iOS & Android (Flutter, single codebase)
**Status:** Draft untuk review

---

## 1. Ringkasan Produk

StreamFlix Mobile adalah aplikasi streaming film & serial TV berbasis Flutter yang menjadi *counterpart* dari StreamFlix Web App. Aplikasi mobile ini **mereplikasi 1:1 seluruh fitur yang ada di web app** (tanpa penambahan/pengurangan scope fitur), ditambah alur **Register & Login** sebagai gerbang masuk pengguna baru di mobile.

Fokus utama produk:
- Pengalaman menonton video yang mulus, cepat, dan minim jeda (buffer-free feel).
- Navigasi & discovery konten (Hero, Top 10, kategori, search) yang responsif.
- Arsitektur teknis **async-first** agar UI tidak pernah blocking, dengan strategi caching & prefetching agresif supaya persepsi loading seminimal mungkin.

---

## 2. Tujuan & Sasaran (Goals)

| Tujuan | Deskripsi | Metrik Sukses |
|---|---|---|
| Feature Parity | Semua fitur web app tersedia di mobile dengan UX yang di-adaptasi ke pola native mobile | 100% checklist fitur web ter-cover |
| Onboarding Mulus | User baru bisa register & login < 60 detik | Completion rate register > 80% |
| Playback Instan | Video mulai diputar tanpa terasa nge-lag | Time-to-first-frame < 1.5 detik (jaringan baik) |
| UI Tanpa Jank | Scrolling & transisi 60 FPS konsisten | Jank rate < 1% (Flutter DevTools) |
| Retensi | User kembali untuk melanjutkan tontonan | Continue Watching usage > 40% DAU |

---

## 3. Target Pengguna

- **Persona 1 – "Casual Binger"**: Menonton serial TV tiap malam, butuh fitur Continue Watching & Skip Intro yang cepat.
- **Persona 2 – "Cinephile"**: Peduli kualitas gambar (4K/Dolby Vision), suka statistik teknis (Stats for Nerds), sering ganti resolusi/subtitle.
- **Persona 3 – "Explorer"**: Suka mencari film baru lewat search, filter genre, dan rekomendasi "Mirip Ini".

---

## 4. Ruang Lingkup (Scope)

### 4.1 In-Scope
1. Autentikasi: Register, Login (fitur baru khusus mobile, tidak ada di web sesuai brief, tapi wajib ada di app).
2. Advanced Video Player (streaming MP4, kontrol lengkap).
3. Hero Showcase & Auto Preview.
4. Baris Kategori & Top 10 Indonesia.
5. Pencarian Cepat & Filter Multikriteria.
6. Detail Konten Komprehensif (4 tab: Ringkasan, Episode & Musim, Mirip Ini, Ulasan).

### 4.2 Out of Scope (v1)
- Tidak ada penambahan fitur di luar daftar web (sesuai instruksi: *no improvement*, strict parity).
- Live streaming/TV channel.
- Multi-profile keluarga (dipertimbangkan untuk v2 bila web menambahkannya).
- Pembayaran/subscription tiering (asumsi ditangani backend yang sama dengan web, tidak dibahas mendalam di PRD ini kecuali diperlukan untuk gating fitur).

---

## 5. Fitur Detail & Functional Requirements

### 5.1 🔐 Autentikasi — Register & Login (Khusus Mobile)

**Register Page**
- Input: Nama, Email, Password, Konfirmasi Password.
- Validasi real-time (format email, kekuatan password, kecocokan konfirmasi) — dijalankan async/debounced, tidak memblokir mengetik.
- Opsi daftar via Email atau Social Login (Google/Apple) — tombol tersedia, implementasi tergantung ketersediaan backend OAuth.
- Loading state non-blocking (skeleton/spinner lokal pada tombol, bukan full-screen blocking loader).
- Setelah sukses → auto-login → redirect ke Home (Hero Showcase).

**Login Page**
- Input: Email/Username, Password.
- "Ingat saya" (persist session token secara lokal, async storage).
- "Lupa Password" → flow reset password via email.
- Error handling non-intrusif (inline error, bukan popup modal yang mengganggu).
- Biometric login (Face ID/Fingerprint) sebagai *quick login* opsional setelah login pertama berhasil.

**Session Management**
- Token disimpan aman (flutter_secure_storage).
- Auto-refresh token di background (silent refresh via async interceptor), user tidak pernah lihat loading karena refresh token.

---

### 5.2 🎬 Pemutar Video Interaktif Tingkat Lanjut

| Sub-fitur | Requirement |
|---|---|
| Real Streams | Integrasi player dengan stream MP4 kualitas tinggi (mendukung adaptive bitrate bila tersedia HLS/DASH di backend) |
| Ambient Glow | Efek cahaya dinamis di sekitar video, direalisasikan dengan sampling warna dominan frame video secara async (throttled, tidak setiap frame) agar tidak membebani main thread |
| Progress Bar & Scrubbing | Hover/drag thumbnail preview timestamp, indikator buffer health real-time |
| Play/Pause | Standar, dengan gesture tap di area video |
| Skip ±10 detik | Tombol + double-tap gesture kiri/kanan layar |
| Skip Intro | Tombol muncul otomatis pada window waktu tertentu (default 30 detik pertama), auto-hide setelah beberapa detik |
| Playback Speed | 0.75x / 1x / 1.25x / 1.5x / 2x |
| Resolusi | 4K UHD / 1080p / 720p / Auto (adaptive berdasarkan bandwidth, dicek async tanpa interupsi playback) |
| Subtitle | Bahasa Indonesia / English / Japanese / Nonaktif — load file subtitle async, cache lokal setelah didownload sekali |
| Picture-in-Picture | Native PiP Android & iOS |
| Fullscreen | Rotasi otomatis + toggle manual |
| Stats for Nerds | Overlay panel: bitrate, FPS, buffer health, audio codec — update via stream (polling ringan, tidak sinkron dengan render thread) |
| Auto Next Episode | Countdown overlay di ~90% durasi episode, auto-play episode berikutnya |

**Catatan Arsitektur Player:** Semua operasi I/O (fetch subtitle, fetch metadata episode berikutnya, cek kualitas jaringan) dilakukan di background via `Future`/`Stream`, tidak pernah menahan render thread UI player.

---

### 5.3 🍿 Hero Showcase & Preview Otomatis

- Banner rotasi otomatis (auto-carousel) untuk film/serial terpopuler, preload gambar/video item berikutnya secara async sebelum rotasi terjadi (agar transisi instan, tanpa flicker).
- Background video teaser: autoplay muted, tombol toggle mute/unmute.
- Info: match score, badge usia, badge resolusi (4K UHD/Dolby Vision), sinopsis singkat.
- Tombol aksi cepat: **Putar Sekarang**, **Tambah ke Koleksi**, **Detail Info**.

---

### 5.4 📈 Baris Kategori & Top 10 Indonesia

- **Top 10 Hari Ini**: tipografi angka besar & artistik di depan poster (custom widget, bukan gambar statis, agar ringan).
- **Sedang Populer di Indonesia**: horizontal list.
- **Genre Carousels**: Aksi & Fiksi Ilmiah, Drama & Misteri, Animasi & Komedi (dan genre lain sesuai data backend).
- **Continue Watching**: progress bar per-item, data disimpan lokal (async, mis. Hive/SharedPreferences) sebagai padanan `LocalStorage` di web, dan disinkronkan ke server saat online.

**Performa list:** semua carousel menggunakan lazy-loading horizontal (`ListView.builder`) + image caching, sehingga hanya item yang terlihat (+buffer kecil) yang di-render/di-decode.

---

### 5.5 🔍 Pencarian Cepat & Filter Multikriteria

- Search bar dengan auto-suggestion, query di-debounce (mis. 300ms) dan dijalankan async agar tidak spam request tiap ketikan.
- Dropdown hasil pencarian real-time saat mengetik.
- Halaman eksplorasi/filter:
  - Format: Semua / Film / Serial.
  - Genre chips (multi-select): Aksi, Fiksi Ilmiah, Horor, Drama, Komedi, dll.
  - Sorting: Terpopuler, Rating Tertinggi, Rilis Terbaru.
- Hasil pencarian & filter dimuat dengan pagination async (infinite scroll), request baru otomatis dibatalkan (cancel token) bila user mengubah filter sebelum request lama selesai — mencegah race condition & flicker data lama.

---

### 5.6 📋 Detail Konten Komprehensif

Di web berupa modal; di mobile direkomendasikan sebagai **halaman detail full-screen atau draggable bottom sheet** (pola native mobile) agar tetap nyaman digunakan satu tangan, namun struktur informasi & tab tetap identik dengan web:

1. **Tab Ringkasan**: sinopsis, daftar aktor, sutradara, genre, rating usia.
2. **Tab Episode & Musim**: pemilih musim (dropdown/segmented), daftar episode dengan thumbnail, durasi, ringkasan — thumbnail di-lazy-load.
3. **Tab Mirip Ini**: rekomendasi horizontal, di-load async setelah tab dibuka (lazy tab loading, bukan sekaligus semua tab saat modal dibuka) agar buka detail terasa instan.
4. **Tab Ulasan Pengguna**: form rating 1–10 bintang + komentar, submit async dengan optimistic UI update (komentar langsung tampil di list sebelum konfirmasi server selesai, rollback bila gagal).

---

## 6. Non-Functional Requirements

| Kategori | Requirement |
|---|---|
| Performa | 60 FPS pada scrolling & transisi; Time-to-Interactive Home < 2 detik pada 4G |
| Async-first | Tidak ada operasi network/disk I/O yang berjalan di main/UI thread |
| Offline Resilience | Continue Watching, watchlist, dan riwayat pencarian tetap dapat diakses offline (cache lokal) |
| Skalabilitas UI | List panjang (episode, hasil pencarian) tidak boleh menyebabkan jank meski >1000 item |
| Keamanan | Token & kredensial disimpan di secure storage, bukan plain SharedPreferences |
| Aksesibilitas | Kontras warna cukup untuk overlay ambient glow, subtitle dapat dibaca di semua tema |
| Konsistensi Cross-Platform | UI & behavior identik di Android & iOS kecuali perbedaan native wajib (PiP, biometric) |

---

## 7. Arsitektur Teknis (Fokus: Smooth & Serba Async)

### 7.1 Prinsip Arsitektur
- **Clean Architecture** 3 lapis: `Presentation` → `Domain` → `Data`, agar logic bisnis terpisah dari UI dan mudah di-test.
- **Async/await & Stream di semua boundary I/O**: setiap pemanggilan API, disk cache, dan sensor (network status) berbentuk `Future` atau `Stream`, tidak pernah dipanggil secara sync yang memblokir isolate utama.
- **Reactive State Management**: **Riverpod (AsyncNotifier/StreamProvider)** — dipilih karena native mendukung `AsyncValue` (loading/data/error) sehingga UI otomatis menampilkan state yang tepat tanpa boilerplate loading flag manual. (Alternatif: BLoC jika tim lebih familiar, prinsip async tetap sama.)
- **Isolates untuk kerja berat**: parsing JSON besar, decoding gambar/analisis warna untuk ambient glow, dan operasi kompresi cache dijalankan di `compute()`/isolate terpisah agar UI thread tetap bebas.

### 7.2 Struktur Layer

```
lib/
├── core/
│   ├── network/        (Dio client, interceptors, retry, cancel token)
│   ├── cache/          (Hive/Drift local DB, cache policies)
│   ├── di/             (get_it service locator)
│   └── utils/
├── features/
│   ├── auth/           (register, login, session)
│   ├── home/           (hero, top10, kategori)
│   ├── player/         (video player & controls)
│   ├── search/         (search & filter)
│   └── detail/         (detail konten, tabs)
├── shared/             (widgets reusable, theming, ambient-glow widget)
└── main.dart
```

Setiap fitur memiliki: `data/` (repository, datasource, DTO), `domain/` (entity, usecase), `presentation/` (widgets, providers/notifiers).

### 7.3 Networking & Caching
- **Dio** sebagai HTTP client dengan interceptor untuk auth-refresh otomatis, retry-on-failure, dan request cancellation.
- **Stale-While-Revalidate**: data (Home, Top 10, Detail) langsung ditampilkan dari cache lokal (instan), lalu di-refresh async di background dan UI update begitu data baru tiba — user nyaris tidak pernah melihat spinner kosong.
- **cached_network_image** untuk semua poster/thumbnail dengan disk cache otomatis.
- **Prefetching**: saat user scroll mendekati akhir carousel/list, item halaman berikutnya sudah di-fetch di background (predictive prefetch).

### 7.4 Video Player
- Basis: `video_player` (Flutter core) dikombinasikan dengan custom controls layer (bukan UI bawaan) agar bisa mengimplementasikan semua kontrol kustom (skip intro, ambient glow, stats overlay).
- Buffer & resolusi diatur via `Stream` yang memonitor kondisi jaringan (connectivity_plus) dan menyesuaikan resolusi "Auto" secara otomatis tanpa memutus playback.
- Preload beberapa detik video episode berikutnya di background sebelum "Auto Next Episode" muncul, agar transisi mulus tanpa jeda buffering.

### 7.5 Local Persistence
- **Hive** (key-value ringan, cepat, async native) untuk: Continue Watching, watchlist, preferensi subtitle/kualitas, cache hasil search terakhir.
- Sinkronisasi ke server dilakukan async di background (fire-and-forget dengan retry queue) sehingga aksi user (mis. tambah ke koleksi) terasa instan (optimistic update).

### 7.6 Rendering Performance
- `const` constructor di semua widget statis untuk menghindari rebuild tidak perlu.
- `ListView.builder` / `SliverList` untuk semua list panjang, tidak pernah `ListView(children: [...])` untuk data dinamis besar.
- `RepaintBoundary` pada widget kompleks (ambient glow, player controls) agar repaint tidak menyebar ke seluruh tree.
- Image loading pakai resolusi sesuai ukuran tampil (`cacheWidth`/`cacheHeight`) untuk menghindari decode gambar berlebihan.

### 7.7 Error & Loading UX
- Tidak ada full-screen blocking spinner untuk operasi non-kritis; gunakan **shimmer/skeleton placeholder** yang menyerupai layout final konten.
- Error non-fatal (mis. gagal load 1 carousel) tidak menghentikan seluruh halaman — bagian lain tetap berfungsi normal (graceful degradation).

---

## 8. Alur Pengguna Utama (User Flow Singkat)

1. **Buka App** → Splash (cek token tersimpan, async) → jika ada token valid langsung ke Home; jika tidak, ke Login.
2. **Login/Register** → Home (Hero Showcase auto-rotate).
3. **Browse** → scroll Top 10 / kategori → tap poster → Detail (tab Ringkasan default, tab lain lazy-load).
4. **Putar** → Player fullscreen, kontrol lengkap, auto-next episode.
5. **Search** → ketik → suggestion muncul → filter genre/format/sort → hasil infinite scroll.
6. **Review** → di tab Ulasan, beri rating & komentar → muncul instan (optimistic).

---

## 9. Metrik Keberhasilan (KPI)

- Crash-free session rate > 99.5%.
- Rata-rata waktu buka video hingga frame pertama < 1.5 detik.
- Jank (dropped frames) < 1% dari total frame saat scrolling Home.
- Conversion Register → Login pertama > 85%.
- Retensi D7 > 30%.

---

## 10. Asumsi & Ketergantungan

- Backend/API sudah menyediakan endpoint yang sama dengan yang dipakai web app (katalog, search, review, auth).
- Streaming source berupa MP4 langsung; dukungan adaptive bitrate (HLS/DASH) bersifat *nice-to-have* mengikuti kesiapan backend.
- Tidak ada perubahan/penambahan fitur bisnis di luar daftar fitur web yang diberikan — mobile murni menyesuaikan paritas fitur + auth.

---

## 11. Risiko

| Risiko | Mitigasi |
|---|---|
| Ambient glow membebani performa di device low-end | Throttle sampling warna, matikan efek otomatis di device dengan RAM rendah |
| Sinkronisasi Continue Watching bentrok antar device | Gunakan timestamp terbaru menang (last-write-wins) + reconciliation di server |
| Ukuran app membesar karena banyak asset player | Lazy-load asset non-kritis, kompres ikon/animasi |

---

*Dokumen ini merepresentasikan cakupan fitur yang identik dengan web app, dengan tambahan alur Register/Login khusus mobile dan pendekatan arsitektur async-first untuk pengalaman playback dan navigasi yang mulus.*
