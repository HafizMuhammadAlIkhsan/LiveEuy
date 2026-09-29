# LiveEuy: Dokumentasi Kontrak & Spesifikasi API Backend

Direktori ini berisi dokumentasi spesifikasi teknis, kontrak API, panduan keamanan token, dan referensi skema database untuk integrasi klien mobile (**LiveEuy Mobile Flutter**).

Layanan backend resmi dikembangkan dalam arsitektur **microservices**:
1. **`auth-service` (Port 8080)**: Layanan autentikasi, registrasi, sesi perangkat, persona demo, profil, dan token JWT RSA-256 (Golang Gin & Redis & PostgreSQL).
2. **`catalog-service` (Port 8081)**: Layanan katalog media, film, serial TV, seasons, episodes, pagination Spring Boot, dan batch fetch (Java 21 + Spring Boot 3.4.3).

---

## Struktur Berkas Direktori

```
backend/
├── API_CONTRACT.md                  # Spesifikasi payload JSON request/response, query params, & error code
├── AUTHENTICATION_AND_SECURITY.md   # Panduan refresh token rotation, HttpOnly cookies, & Dio interceptor
├── DATABASE_GUIDELINES.md           # Pedoman arsitektur database, diagram ERD, indeks, & aturan UPSERT
├── docker-compose.yml               # Konfigurasi container lokal (PostgreSQL 16 & Redis 7)
├── migrations/                      # Referensi skema SQL DDL untuk tabel LiveEuy
│   ├── V20260924_01__init_schema.sql
│   ├── V20260925_01__create_refresh_tokens_table.sql
│   └── V20260925_02__create_user_settings_table.sql
└── README.md                        # Ringkasan dokumentasi & daftar endpoint
```

---

## Ringkasan Endpoint API

### 1. Auth Service (`http://localhost:8080/api/v1/auth`)

| Method | Path Endpoint | Autentikasi | Deskripsi |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Publik | Registrasi akun baru dengan pilihan membership tier |
| `POST` | `/api/v1/auth/login` | Publik | Login email & password, mengembalikan access token & refresh token |
| `POST` | `/api/v1/auth/demo-login?persona={tamu\|vip\|ultra}` | Publik | Login instan menggunakan persona demo pengujian |
| `POST` | `/api/v1/auth/refresh` | Cookie / Body | Rotasi token JWT sesi aktif |
| `POST` | `/api/v1/auth/logout` | Publik | Logout sesi perangkat saat ini |
| `POST` | `/api/v1/auth/logout-all` | Bearer Token | Logout seluruh sesi atau sesi lain |
| `GET` | `/api/v1/auth/profile` | Bearer Token | Mengambil detail profil dan metrik akun |
| `PUT` | `/api/v1/auth/change-password` | Bearer Token | Mengganti kata sandi akun |
| `GET` | `/api/v1/auth/devices` | Bearer Token | Mengambil daftar sesi perangkat terdaftar |
| `DELETE` | `/api/v1/auth/devices/{id}` | Bearer Token | Mencabut sesi perangkat tertentu |

### 2. Catalog Service (`http://localhost:8081/api/v1/media`)

| Method | Path Endpoint | Query Params | Deskripsi |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/media` | `type`, `search`, `page`, `size`, `sort` | Katalog tayangan & pencarian dengan Spring Pageable |
| `GET` | `/api/v1/media/{id}` | - | Detail film atau serial lengkap beserta episode |
| `GET` | `/api/v1/media/top10` | - | Daftar 10 tayangan terpopuler |
| `POST` | `/api/v1/media/batch` | - | Mengambil data beberapa media sekaligus via ID |
| `GET` | `/api/v1/series` | `page`, `size` | Daftar serial TV |
| `GET` | `/api/v1/series/{id}/seasons` | - | Daftar musim dari serial tertentu |
| `GET` | `/api/v1/seasons/{id}/episodes` | - | Daftar episode dari musim tertentu |

---

## Panduan Menjalankan Backend Lokal (Docker)

### Prasyarat: Instalasi Docker di CachyOS (Arch Linux)
Apabila sistem Anda menggunakan **CachyOS**, jalankan skrip pembantu atau perintah berikut:

```bash
# Opsi 1: Jalankan skrip pembantu otomatis
sudo ./scripts/install_docker_cachyos.sh

# Opsi 2: Perintah manual via pacman
sudo pacman -Sy --noconfirm docker docker-compose
sudo systemctl enable --now docker.service
sudo usermod -aG docker $USER
newgrp docker
```

### Menjalankan Layanan Basis Data Lokal
```bash
# Jalankan PostgreSQL dan Redis di latar belakang
docker compose -f backend/docker-compose.yml up -d

# Periksa status kontainer
docker compose -f backend/docker-compose.yml ps
```

---

## Arsitektur Keamanan dan Refresh Token

Sistem autentikasi menerapkan model token ganda (**Dual-Token**):
1. **Access Token (Masa Berlaku 15 Menit)**:
   - Digunakan untuk otorisasi request endpoint privat melalui header `Authorization: Bearer <token>`.
   - Disimpan di memori runtime klien.
2. **Refresh Token (Masa Berlaku 7 Hari)**:
   - Digunakan untuk menerbitkan access token baru tanpa meminta pengguna login ulang.
   - **Refresh Token Rotation (RTR)**: setiap rotasi token, token lama dicabut dan diganti dengan pasangan token baru.
   - **Deteksi Replay Attack**: jika token yang telah dicabut dikirimkan kembali, seluruh token aktif milik pengguna tersebut dinonaktifkan.
3. **Strategi Penyimpanan Klien**:
   - **Web (React)**: Refresh token dikirimkan melalui cookie HttpOnly (`SameSite=Lax`, `Path=/api/v1/auth`) untuk memitigasi risiko pembacaan token via script XSS di browser.
   - **Mobile (Flutter)**: Token disimpan terenkripsi menggunakan `flutter_secure_storage` (Android Keystore dan Apple Keychain), menghindari penyimpanan plain-text di `shared_preferences`.

---

## Referensi Dokumentasi

Dokumentasi pelengkap untuk pengembangan modul backend:
- [API_CONTRACT.md](API_CONTRACT.md): Kontrak payload JSON request dan response, enum kualitas streaming, dan contoh request cURL.
- [AUTHENTICATION_AND_SECURITY.md](AUTHENTICATION_AND_SECURITY.md): Panduan teknis autentikasi, refresh token, penanganan cookie HttpOnly, dan interceptor klien.
- [DATABASE_GUIDELINES.md](DATABASE_GUIDELINES.md): Pedoman skema database PostgreSQL, diagram ERD, pola UPSERT anti race-condition, dan aturan migrasi Flyway.
- [V20260924_01__init_schema.sql](migrations/V20260924_01__init_schema.sql): Migrasi skema awal tabel pengguna, tayangan, musim, episode, ulasan, dan progres.
- [V20260925_01__create_refresh_tokens_table.sql](migrations/V20260925_01__create_refresh_tokens_table.sql): Migrasi skema tabel `refresh_tokens`.
- [V20260925_02__create_user_settings_table.sql](migrations/V20260925_02__create_user_settings_table.sql): Migrasi skema tabel `user_settings`.
