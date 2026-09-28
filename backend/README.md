# LiveEuy: Dokumentasi Kontrak & Spesifikasi API Backend

Direktori ini berisi dokumentasi spesifikasi teknis, kontrak API, panduan keamanan token, dan referensi skema database untuk integrasi klien mobile (**LiveEuy Mobile Flutter**).

Implementasi layanan backend resmi dikembangkan secara terpisah melalui microservices pada repositori/branch backend:
1. **Auth Service**: Layanan autentikasi, registrasi, Google OAuth2, dan sesi pengguna (Golang & Redis).
2. **Catalog Service**: Layanan katalog tayangan, serial TV, ulasan, watchlist, dan riwayat tontonan (Spring Boot).

---

## Struktur Berkas Direktori

```
backend/
├── API_CONTRACT.md                  # Spesifikasi payload JSON request/response, query params, & error code
├── AUTHENTICATION_AND_SECURITY.md   # Panduan refresh token rotation, HttpOnly cookies, & Dio interceptor
├── DATABASE_GUIDELINES.md           # Pedoman arsitektur database, diagram ERD, indeks, & aturan UPSERT
├── migrations/                      # Referensi skema SQL DDL untuk tabel LiveEuy
│   ├── V20260924_01__init_schema.sql
│   ├── V20260925_01__create_refresh_tokens_table.sql
│   └── V20260925_02__create_user_settings_table.sql
└── README.md                        # Ringkasan dokumentasi & daftar endpoint
```

---

## Ringkasan Endpoint API

Seluruh endpoint menggunakan prefix `/api/v1`:

| Kategori | Method | Path Endpoint | Autentikasi | Klien | Keterangan |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Auth | `POST` | `/api/v1/auth/login` | Publik | Web dan Mobile | Login pengguna, menghasilkan access token dan refresh token |
| Auth | `POST` | `/api/v1/auth/register` | Publik | Web dan Mobile | Pendaftaran akun baru |
| Auth | `POST` | `/api/v1/auth/refresh` | Cookie / Body | Web dan Mobile | Rotasi token sesi aktif |
| Auth | `POST` | `/api/v1/auth/logout` | Publik | Web dan Mobile | Pencabutan refresh token dan pembersihan cookie |
| Auth | `GET` | `/api/v1/auth/me` | Bearer Token | Web dan Mobile | Mengambil profil pengguna aktif |
| Settings | `GET` | `/api/v1/user/settings` | Publik / User | Web dan Mobile | Mengambil preferensi kualitas streaming |
| Settings | `PUT` | `/api/v1/user/settings` | Publik / User | Web dan Mobile | Memperbarui konfigurasi streaming dan cache |
| Media | `GET` | `/api/v1/media` | Publik | Web dan Mobile | Mengambil katalog film dan serial |
| Media | `GET` | `/api/v1/media/{id}` | Publik | Web dan Mobile | Mengambil detail tayangan dan daftar episode |
| Media | `GET` | `/api/v1/media/top10` | Publik | Web dan Mobile | Mengambil daftar Top 10 tayangan |
| Watchlist | `GET` | `/api/v1/user/watchlist` | Publik / User | Web dan Mobile | Mengambil daftar film tersimpan |
| Watchlist | `GET` | `/api/v1/user/watchlist/ids` | Publik / User | Web dan Mobile | Mengambil daftar ID film tersimpan |
| Watchlist | `POST` | `/api/v1/user/watchlist/{id}` | Publik / User | Web dan Mobile | Menambah atau menghapus tayangan dari koleksi |
| Progress | `GET` | `/api/v1/user/progress` | Publik / User | Web dan Mobile | Riwayat durasi menonton |
| Progress | `POST` | `/api/v1/user/progress` | Publik / User | Web dan Mobile | Sinkronisasi durasi menonton (UPSERT) |
| Review | `GET` | `/api/v1/media/{id}/reviews` | Publik | Web dan Mobile | Mengambil daftar ulasan tayangan |
| Review | `POST` | `/api/v1/media/{id}/reviews` | Publik / User | Web dan Mobile | Mengirim ulasan dan rating baru |

---

## Arsitektur Keamanan dan Refresh Token

Sistem autentikasi menerapkan model token ganda (Dual-Token):
1. Access Token (Masa Berlaku 15 Menit):
   - Digunakan untuk otorisasi request endpoint privat melalui header `Authorization: Bearer <token>`.
   - Disimpan di memori runtime klien.
2. Refresh Token (Masa Berlaku 7 Hari):
   - Digunakan untuk menerbitkan access token baru tanpa meminta pengguna login ulang.
   - Refresh Token Rotation (RTR): setiap rotasi token, token lama dicabut dan diganti dengan pasangan token baru.
   - Deteksi Replay Attack: jika token yang telah dicabut dikirimkan kembali, seluruh token aktif milik pengguna tersebut dinonaktifkan.
3. Strategi Penyimpanan Klien:
   - Web (React): Refresh token dikirimkan melalui cookie HttpOnly (`SameSite=Lax`, `Path=/api/v1/auth`) untuk memitigasi risiko pembacaan token via script XSS di browser.
   - Mobile (Flutter): Token disimpan terenkripsi menggunakan `flutter_secure_storage` (Android Keystore dan Apple Keychain), menghindari penyimpanan plain-text di `shared_preferences`.

---

## Referensi Dokumentasi

Dokumentasi pelengkap untuk pengembangan modul backend:
- [AUTHENTICATION_AND_SECURITY.md](AUTHENTICATION_AND_SECURITY.md): Panduan teknis autentikasi, refresh token, penanganan cookie HttpOnly, dan interceptor klien.
- [API_CONTRACT.md](API_CONTRACT.md): Kontrak payload JSON request dan response, enum kualitas streaming, dan contoh request cURL.
- [DATABASE_GUIDELINES.md](DATABASE_GUIDELINES.md): Pedoman skema database PostgreSQL, diagram ERD, pola UPSERT anti race-condition, dan aturan migrasi Flyway.
- [V20260924_01__init_schema.sql](migrations/V20260924_01__init_schema.sql): Migrasi skema awal tabel pengguna, tayangan, musim, episode, ulasan, dan progres.
- [V20260925_01__create_refresh_tokens_table.sql](migrations/V20260925_01__create_refresh_tokens_table.sql): Migrasi skema tabel `refresh_tokens`.
- [V20260925_02__create_user_settings_table.sql](migrations/V20260925_02__create_user_settings_table.sql): Migrasi skema tabel `user_settings`.
