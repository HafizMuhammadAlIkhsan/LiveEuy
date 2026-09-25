# LiveEuy — Spesifikasi Kontrak API (API Contract)

Dokumen ini adalah **kontrak resmi (Single Source of Truth)** antara tim **Backend (Spring Boot)**, **Frontend (React)**, dan **Mobile (Flutter)**.  
Semua klien (Web & Mobile) mengonsumsi endpoint yang **sama persis** tanpa duplikasi di sisi backend.

---

## 🌐 Base URL
- **Local Dev (Web React / iOS Sim)**: `http://localhost:8080/api/v1`
- **Android Emulator**: `http://10.0.2.2:8080/api/v1`
- **Physical Device (LAN/Wi-Fi)**: `http://<IP_LAN_HOST>:8080/api/v1`
- **Swagger UI**: `http://localhost:8080/swagger-ui.html`

---

## 📦 Standar Format Respon JSON (ApiResponse Wrapper)

Semua endpoint mengembalikan struktur pembungkus JSON standar:

```json
{
  "success": true,
  "message": "Deskripsi status operasi",
  "data": { ... },
  "timestamp": "2026-09-24T20:00:00"
}
```

---

## 📋 Daftar Endpoint Terpadu (Unified Endpoints)

### 1. Katalog Media & Konten (`/api/v1/media`)

#### a. Ambil Semua Media
- **Method**: `GET`
- **Path**: `/api/v1/media`
- **Digunakan oleh**:
  - Web: Halaman Beranda, MoviesPage, SeriesPage
  - Mobile: `HomeScreen` & `SearchScreen`
- **Respon Data**: Array `MediaItem`

#### b. Detail Media Berdasarkan ID
- **Method**: `GET`
- **Path**: `/api/v1/media/{id}`
- **Digunakan oleh**:
  - Web: `DetailModal`
  - Mobile: `ContentDetailScreen`
- **Respon Data**: Objek `MediaItem` lengkap dengan `seasons` & `episodes`.

#### c. Tayangan Top 10 Indonesia
- **Method**: `GET`
- **Path**: `/api/v1/media/top10`
- **Digunakan oleh**:
  - Web: Baris `TopTenRow` di HomePage
  - Mobile: Carousel Top 10 di `HomeScreen`

---

### 2. Koleksi Tontonan Pengguna (`/api/v1/user/watchlist`)

#### a. Dapatkan Daftar Media Tersimpan
- **Method**: `GET`
- **Path**: `/api/v1/user/watchlist`
- **Query Params**: `userId` (string, default: ID pengguna aktif)
- **Digunakan oleh**:
  - Web: `WatchlistPage`
  - Mobile: Tab `Koleksi` (`_KoleksiTab` di `main.dart`)

#### b. Dapatkan Kumpulan ID Watchlist
- **Method**: `GET`
- **Path**: `/api/v1/user/watchlist/ids`
- **Query Params**: `userId` (string)
- **Respon Data**: `["m1", "m_hero", ...]` (Set of string IDs)

#### c. Toggle Simpan / Hapus Watchlist (Idempotent)
- **Method**: `POST`
- **Path**: `/api/v1/user/watchlist/{mediaId}`
- **Query Params**: `userId` (string)
- **Respon Data**:
  ```json
  {
    "mediaId": "m1",
    "inWatchlist": true
  }
  ```

---

### 3. Riwayat Tontonan & Lanjutkan Menonton (`/api/v1/user/progress`)

#### a. Dapatkan Riwayat Progres Tontonan
- **Method**: `GET`
- **Path**: `/api/v1/user/progress`
- **Query Params**: `userId` (string)
- **Respon Data**: Array `WatchProgress`

#### b. Sinkronisasi Durasi Tontonan (UPSERT)
- **Method**: `POST`
- **Path**: `/api/v1/user/progress`
- **Query Params**: `userId` (string)
- **Payload Request**:
  ```json
  {
    "mediaId": "m1",
    "progress": 0.65,
    "lastEpisodeId": "gk_ep1"
  }
  ```
- **Catatan**: Dipanggil secara berkala / saat pause dari `video_player` di mobile dan web player.

---

### 4. Ulasan Penonton (`/api/v1/media/{mediaId}/reviews`)

#### a. Dapatkan Ulasan Tayangan
- **Method**: `GET`
- **Path**: `/api/v1/media/{mediaId}/reviews`
- **Respon Data**: Array `Review` diurutkan dari yang terbaru.

#### b. Kirim Ulasan Baru
- **Method**: `POST`
- **Path**: `/api/v1/media/{mediaId}/reviews`
- **Payload Request**:
  ```json
  {
    "rating": 9.5,
    "comment": "Akting dan visualnya sangat luar biasa!",
    "userName": "Hafiz Muhammad"
  }
  ```

---

## 🏷️ Skema Model Data Utama (Data Contract)

### `MediaItem`
| Field | Tipe | Keterangan |
|---|---|---|
| `id` | `String` | ID unik (contoh: `"m1"`, `"m_hero"`) |
| `title` | `String` | Judul tayangan |
| `synopsis` | `String` | Deskripsi cerita |
| `posterUrl` | `String` | URL poster vertikal (2:3) |
| `backdropUrl` | `String` | URL banner horizontal (16:9) |
| `videoUrl` | `String` | URL stream berkas video MP4 |
| `matchScore` | `Double` | Persentase kecocokan (e.g. `98.0`) |
| `ageRating` | `String` | Rating usia (`"SU"`, `"13+"`, `"16+"`, `"18+"`) |
| `resolutionBadges` | `List<String>` | `["4K UHD", "Dolby Vision", "Dolby Atmos"]` |
| `genre` | `String` | Kategori utama |
| `durationOrSeasons`| `String` | e.g. `"2 Jam 15 Min"` atau `"1 Musim"` |
| `releaseYear` | `Integer` | Tahun rilis (e.g. `2024`) |
| `director` | `String` | Sutradara |
| `cast` | `List<String>` | Daftar aktor/aktris |
| `isTop10` | `Boolean` | Apakah masuk Top 10 |
| `top10Rank` | `Integer` | Urutan 1-10 (nullable) |
| `userRating` | `Double` | Rata-rata rating bintang 1.0-10.0 |
| `continueWatchingProgress` | `Double` | Progres tontonan pengguna (0.0-1.0) |
| `seasons` | `List<Season>` | Daftar musim & episode (khusus serial) |

---

### 🔄 Interoperabilitas & Keselarasan Frontend Web (Universal Compatibility)
Untuk menjamin kompatibilitas tanpa *breaking changes* antara **Web (React)** dan **Mobile (Flutter)**:

| Field Standar Backend / Mobile | Alias Kompatibel Web (`src/types.ts`) | Keterangan / Normalisasi |
|---|---|---|
| `synopsis` | `overview` | Kedua field disediakan oleh backend |
| `genre` | `genres: List<String>` | `genres` berupa array token, `genre` string utama |
| `userRating` | `rating` | Skala rating numerik yang sama (0 - 10) |
| `top10Rank` | `topRank` | Urutan peringkat Top 10 (1 - 10) |
| `resolutionBadges` | `quality`, `audio` | Berisi badge resolusi & audio terpadu |
| `userName` (Review) | `author` | Nama penulis ulasan |
| `userAvatarUrl` (Review) | `avatar` | URL avatar penulis ulasan |
| `thumbnailUrl` (Episode) | `thumbnail` | URL gambar cuplikan episode |

---

## 🔐 5. Autentikasi, Refresh Token, & Manajemen Cookie (`/api/v1/auth`)

Sistem autentikasi LiveEuy mengadopsi standar industri modern (**Short-lived Access Token** + **Long-lived Refresh Token with Cookie HttpOnly**) yang aman dari celah XSS dan CSRF, serta mendukung klien multiplatform (**Web React** dan **Mobile Flutter**).

```
   ┌────────────────────────────────────────────────────────┐
   │                  ALUR SILENT REFRESH                   │
   │                                                        │
   │  [Frontend / Mobile]               [Spring Boot]       │
   │          │                               │             │
   │          │─── POST /api/v1/auth/login ──>│             │
   │          │<── 200 OK (AccessToken) ─────│             │
   │          │    + Set-Cookie (HttpOnly)    │             │
   │          │                               │             │
   │          │─── GET /api/v1/media (401) ──>│ (Token Exp) │
   │          │<── 401 Unauthorized ──────────│             │
   │          │                               │             │
   │          │─── POST /auth/refresh ───────>│ (Kirim      │
   │          │    (Cookie otomatis terkirim) │  Cookie /   │
   │          │<── 200 OK (New AccessToken) ──│  Body)      │
   │          │    + New Rotated Cookie       │             │
   │          │                               │             │
   │          │─── Retry GET /media (200) ───>│ (Sukses!)   │
   └────────────────────────────────────────────────────────┘
```

---

### a. Registrasi Pengguna Baru (`POST /api/v1/auth/register`)
- **Method**: `POST`
- **Path**: `/api/v1/auth/register`
- **Request Body**:
  ```json
  {
    "name": "Aria Pratama",
    "email": "aria@liveeuy.id",
    "password": "PasswordKuat123!"
  }
  ```
- **Response Body (`201 Created` / `200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Registrasi berhasil. Akun Anda telah siap!",
    "data": {
      "accessToken": "eyJhbGciOi...",
      "refreshToken": "eyJhbGciOi...",
      "tokenType": "Bearer",
      "expiresIn": 900,
      "user": {
        "id": "usr_99812",
        "name": "Aria Pratama",
        "email": "aria@liveeuy.id",
        "avatarUrl": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120",
        "membershipTier": "REGULAR"
      }
    },
    "timestamp": "2026-09-25T11:00:00"
  }
  ```

---

### b. Login Pengguna (`POST /api/v1/auth/login`)
- **Method**: `POST`
- **Path**: `/api/v1/auth/login`
- **Request Body**:
  ```json
  {
    "email": "hafiz@streamflix.id",
    "password": "password123",
    "rememberMe": true
  }
  ```
- **Response Headers**:
  ```http
  Set-Cookie: refreshToken=eyJhbGciOi...; Path=/api/v1/auth; Max-Age=604800; HttpOnly; SameSite=Lax
  ```
- **Response Body**:
  ```json
  {
    "success": true,
    "message": "Login berhasil. Selamat datang kembali!",
    "data": {
      "accessToken": "eyJhbGciOi...",
      "refreshToken": "eyJhbGciOi...",
      "tokenType": "Bearer",
      "expiresIn": 900,
      "user": {
        "id": "user_hafiz",
        "name": "Hafiz Muhammad",
        "email": "hafiz@streamflix.id",
        "avatarUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120",
        "membershipTier": "VIP_4K"
      }
    },
    "timestamp": "2026-09-25T10:00:00"
  }
  ```

---

### c. Refresh Access Token (`POST /api/v1/auth/refresh`)
- **Method**: `POST`
- **Path**: `/api/v1/auth/refresh`
- **Mekanisme Dual-Mode (Web & Mobile)**:
  - **Web**: Browser **otomatis mengirimkan cookie** `refreshToken` melalui header `Cookie: refreshToken=...` (Cukup pastikan `withCredentials: true` atau `credentials: 'include'`).
  - **Mobile**: Klien mobile dapat mengirimkan JSON body `{ "refreshToken": "..." }` jika tidak mengandalkan cookie storage.
- **Keamanan (Refresh Token Rotation)**:
  - Token lama langsung dicabut dari server begitu digunakan.
  - Backend menerbitkan pasangan Access Token baru + Refresh Token baru via `Set-Cookie`.
- **Response Body**:
  ```json
  {
    "success": true,
    "message": "Access token berhasil diperbarui",
    "data": {
      "accessToken": "eyJhbGciOi...NEW_ACCESS_TOKEN",
      "refreshToken": "eyJhbGciOi...NEW_REFRESH_TOKEN",
      "tokenType": "Bearer",
      "expiresIn": 900,
      "user": { ... }
    }
  }
  ```

---

### d. Logout Pengguna (`POST /api/v1/auth/logout`)
- **Method**: `POST`
- **Path**: `/api/v1/auth/logout`
- **Efek Operasi**:
  - Mencabut refresh token dari daftar token aktif di server.
  - Mengembalikan instruksi penghapusan cookie ke browser:
    ```http
    Set-Cookie: refreshToken=; Path=/api/v1/auth; Max-Age=0; HttpOnly; SameSite=Lax
    ```

---

### e. Profil Pengguna Aktif (`GET /api/v1/auth/me`)
- **Method**: `GET`
- **Path**: `/api/v1/auth/me`
- **Header**: `Authorization: Bearer <accessToken>`
- **Response Body**: Mengembalikan data profil `User` pengguna saat ini.

---

### 💻 Referensi Implementasi Klien Frontend (React 18 + Axios)

Berikut adalah referensi implementasi lengkap untuk tim Frontend Web (`src/api/authApi.ts` atau Axios Interceptor):

```typescript
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
  withCredentials: true, // WAJIB: agar browser menyertakan HttpOnly cookie ke backend
  headers: {
    'Content-Type': 'application/json',
  },
});

let inMemoryAccessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  inMemoryAccessToken = token;
};

// 1. Request Interceptor: Pasang Bearer token jika tersedia
apiClient.interceptors.request.use((config) => {
  if (inMemoryAccessToken && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${inMemoryAccessToken}`;
  }
  return config;
});

// 2. Response Interceptor: Tangani 401 dan jalankan Silent Refresh
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token!);
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Jika error 401 dan bukan request refresh/login itu sendiri
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/')) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Panggil endpoint refresh (Cookie HttpOnly terkirim otomatis oleh browser)
        const res = await axios.post(
          'http://localhost:8080/api/v1/auth/refresh',
          {},
          { withCredentials: true }
        );

        const newAccessToken = res.data.data.accessToken;
        setAccessToken(newAccessToken);
        processQueue(null, newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        setAccessToken(null);
        // Arahkan ke halaman login jika refresh token kedaluwarsa
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
```

---

### 📱 Referensi Implementasi Klien Mobile (Flutter + `flutter_secure_storage`)

Berikut adalah referensi implementasi lengkap untuk tim Mobile Flutter (`lib/core/storage/token_storage_service.dart` & `ApiClient` retry interceptor):

#### 1. Penyimpanan Token Terenkripsi (`TokenStorageService`)
```dart
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class TokenStorageService {
  static const _accessTokenKey = 'liveeuy_access_token';
  static const _refreshTokenKey = 'liveeuy_refresh_token';

  static const _storage = FlutterSecureStorage(
    aOptions: AndroidOptions(
      encryptedSharedPreferences: true,
      resetOnError: true,
    ),
    iOptions: IOSOptions(
      accessibility: KeychainAccessibility.first_unlock,
    ),
  );

  static Future<void> saveTokens({
    required String accessToken,
    required String refreshToken,
  }) async {
    await Future.wait([
      _storage.write(key: _accessTokenKey, value: accessToken),
      _storage.write(key: _refreshTokenKey, value: refreshToken),
    ]);
  }

  static Future<String?> getAccessToken() => _storage.read(key: _accessTokenKey);
  static Future<String?> getRefreshToken() => _storage.read(key: _refreshTokenKey);

  static Future<void> clearTokens() async {
    await Future.wait([
      _storage.delete(key: _accessTokenKey),
      _storage.delete(key: _refreshTokenKey),
    ]);
  }
}
```

#### 2. Mekanisme Silent Refresh di Mobile Client
```dart
import 'dart:convert';
import 'package:http/http.dart' as http;

Future<http.Response> executeWithAutoRefresh(
  Future<http.Response> Function(String? token) requestFn,
) async {
  String? accessToken = await TokenStorageService.getAccessToken();
  var response = await requestFn(accessToken);

  // Jika token expired (401), lakukan silent refresh via body JSON
  if (response.statusCode == 401) {
    final refreshToken = await TokenStorageService.getRefreshToken();
    if (refreshToken == null) {
      await TokenStorageService.clearTokens();
      return response;
    }

    final refreshRes = await http.post(
      Uri.parse('http://10.0.2.2:8080/api/v1/auth/refresh'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'refreshToken': refreshToken}),
    );

    if (refreshRes.statusCode == 200) {
      final data = jsonDecode(refreshRes.body)['data'];
      final newAccessToken = data['accessToken'] as String;
      final newRefreshToken = data['refreshToken'] as String;

      await TokenStorageService.saveTokens(
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      );

      // Ulangi request asli dengan accessToken yang baru
      response = await requestFn(newAccessToken);
    } else {
      await TokenStorageService.clearTokens();
    }
  }

  return response;
}
```



