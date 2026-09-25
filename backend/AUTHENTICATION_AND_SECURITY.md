# LiveEuy — Arsitektur Autentikasi, Refresh Token, & Keamanan Klien

Dokumen ini merupakan panduan teknis resmi bagi **Tim Backend (Spring Boot)**, **Tim Frontend Web (React)**, dan **Tim Mobile (Flutter)** mengenai desain autentikasi terpadu, manajemen sesi, Refresh Token Rotation, dan strategi penyimpanan token yang aman.

---

## 📌 Ringkasan Eksekutif & Filosofi Desain

Sistem autentikasi LiveEuy menerapkan standar keamanan modern berbasis **JWT (JSON Web Token)** dengan arsitektur **Dual-Token**:
1. **Access Token (Short-lived, 15 Menit)**:
   * Digunakan untuk mengotorisasi request ke API privat (`/api/v1/user/*`, `/api/v1/auth/me`).
   * Dikirim via header `Authorization: Bearer <accessToken>`.
   * Disimpan hanya di memori runtime klien (State Management).
2. **Refresh Token (Long-lived, 7 Hari)**:
   * Digunakan semata-mata untuk meminta Access Token baru ketika Access Token habis tanpa memaksa pengguna login ulang (*Silent Refresh*).
   * Menerapkan **Refresh Token Rotation (RTR)**: setiap kali digunakan, token lama dicabut (*revoked*) dan digantikan dengan token baru.
   * Dilengkapi **Deteksi Replay Attack**: jika token yang sudah dicabut dikirim kembali (indikasi pencurian token), seluruh token milik pengguna tersebut langsung dihanguskan (*session invalidation*).

---

## 🛡️ Strategi Penyimpanan Token Klien: Web vs Mobile

| Parameter | Frontend Web (React 18 + Vite) | Mobile Client (Flutter Android & iOS) |
|---|---|---|
| **Mekanisme Penyimpanan Refresh Token** | **Cookie HttpOnly** (`SameSite=Lax`, `Path=/api/v1/auth`, `MaxAge=7d`) | **`flutter_secure_storage`** (Hardware-backed Keystore & Keychain) |
| **Akses JavaScript / Dart** | ❌ **Terisolasi total**: JavaScript di browser tidak bisa membaca cookie (Kebal serangan XSS). | 🔑 Aplikasi membaca secara aman lewat API native OS berenkripsi. |
| **Penyimpanan Access Token** | Variabel memori (React Context / Zustand / memory variable). | State provider memori (Riverpod `authProvider`). |
| **Apakah boleh LocalStorage / SharedPreferences?** | ❌ **Dilarang keras**: `localStorage` rentan XSS. | ❌ **Dilarang keras**: `shared_preferences` menyimpan *plaintext* XML/.plist terbuka (Melanggar OWASP M1). |
| **Alur Refresh Request** | Browser otomatis melampirkan cookie saat menembak POST `/api/v1/auth/refresh` (`withCredentials: true`). | Mobile membaca token dari Secure Storage lalu mengirimkan JSON body `{ "refreshToken": "..." }`. |

> [!IMPORTANT]
> **Mengapa Flutter Tidak Boleh Menggunakan SharedPreferences untuk Token?**
> * Pada Android, `shared_preferences` tersimpan dalam file XML teks biasa di `/data/data/<package>/shared_prefs/*.xml`.
> * Pada iOS, tersimpan dalam file `.plist` biasa (`NSUserDefaults`).
> * Pada perangkat yang di-*root*, di-*jailbreak*, atau dicadangkan (*ADB/iTunes backup*), token berumur panjang dapat dicuri dengan sangat mudah tanpa autentikasi biometrik/sistem.
> * Pustaka [`flutter_secure_storage: ^9.2.1`](pubspec.yaml) mengenkripsi data menggunakan **AES-256 GCM** dengan kunci enkripsi yang tersimpan di dalam **Android Keystore (TEE/SE)** dan **Apple Keychain (Secure Enclave)**.

---

## 🔄 Diagram Alur Sesi & Silent Refresh

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              ALUR LENGKAP AUTENTIKASI                                  │
│                                                                                        │
│   Web / Mobile Klien                             Spring Boot Backend                   │
│          │                                                │                            │
│          │── 1. POST /api/v1/auth/login ─────────────────>│                            │
│          │   { email, password }                          │ Verifikasi Password        │
│          │                                                │ Generate AT (15m) + RT (7d)│
│          │<── 2. 200 OK ──────────────────────────────────│                            │
│          │   - Web: Set-Cookie (HttpOnly) + JSON          │                            │
│          │   - Mobile: Simpan RT ke FlutterSecureStorage  │                            │
│          │                                                │                            │
│          │── 3. GET /api/v1/user/watchlist ──────────────>│                            │
│          │   Authorization: Bearer <accessToken>          │ Token Valid (200 OK)       │
│          │<── 200 OK (Data Koleksi) ──────────────────────│                            │
│          │                                                │                            │
│      [ 15 Menit Kemudian: Access Token Expired ]          │                            │
│          │                                                │                            │
│          │── 4. GET /api/v1/user/progress ───────────────>│                            │
│          │   Authorization: Bearer <expired_token>        │ 401 Unauthorized           │
│          │<── 401 Unauthorized ───────────────────────────│                            │
│          │                                                │                            │
│      [ SILENT REFRESH OTOMATIS BERJALAN DI BACKGROUND ]   │                            │
│          │                                                │                            │
│          │── 5. POST /api/v1/auth/refresh ───────────────>│ Validasi RT & Cek Status   │
│          │   - Web: Cookie terlampir otomatis             │ Cabut RT lama (Revoke)     │
│          │   - Mobile: Body { "refreshToken": "..." }     │ Terbitkan AT baru + RT baru│
│          │<── 200 OK (New AccessToken + New Cookie/RT) ───│                            │
│          │                                                │                            │
│          │── 6. Retry GET /api/v1/user/progress ─────────>│                            │
│          │   Authorization: Bearer <new_accessToken>      │ Request Sukses             │
│          │<── 200 OK (Data Tontonan) ─────────────────────│                            │
│          │                                                │                            │
│      [ Pengguna Melakukan Logout ]                        │                            │
│          │                                                │                            │
│          │── 7. POST /api/v1/auth/logout ────────────────>│ Hapus RT dari daftar aktif │
│          │<── 200 OK + Set-Cookie (MaxAge=0) ─────────────│ Hapus Cookie Klien         │
│          │   - Mobile: Hapus Secure Storage               │                            │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Endpoints Spesifikasi Backend (`/api/v1/auth`)

### 1. Registrasi Akun (`POST /api/v1/auth/register`)
Mendaftarkan akun baru ke platform LiveEuy.
* **Request Body**:
  ```json
  {
    "name": "Aria Pratama",
    "email": "aria@liveeuy.id",
    "password": "PasswordKuat123!"
  }
  ```
* **Response Body (`201 Created` / `200 OK`)**:
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

### 2. Login Pengguna (`POST /api/v1/auth/login`)
* **Request Body**:
  ```json
  {
    "email": "hafiz@streamflix.id",
    "password": "password123",
    "rememberMe": true
  }
  ```
* **Response Headers**:
  ```http
  Set-Cookie: refreshToken=eyJhbGciOi...; Path=/api/v1/auth; Max-Age=604800; HttpOnly; SameSite=Lax
  ```
* **Response Body (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Login berhasil. Selamat datang kembali!",
    "data": {
      "accessToken": "eyJhbGciOi...ACCESS_TOKEN",
      "refreshToken": "eyJhbGciOi...REFRESH_TOKEN",
      "tokenType": "Bearer",
      "expiresIn": 900,
      "user": {
        "id": "user_hafiz",
        "name": "Hafiz Muhammad",
        "email": "hafiz@streamflix.id",
        "avatarUrl": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120",
        "membershipTier": "VIP_4K"
      }
    },
    "timestamp": "2026-09-25T11:00:00"
  }
  ```

---

### 3. Silent Refresh Token (`POST /api/v1/auth/refresh`)
Endpoint ini mendukung **Dual-Mode**:
* **Mode Web**: Membaca cookie `refreshToken` dari header HTTP request (`@CookieValue(name = "refreshToken", required = false)`).
* **Mode Mobile**: Membaca properti `refreshToken` dari JSON request body (`@RequestBody(required = false) RefreshTokenRequest request`).
* **Response Body (`200 OK`)**:
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
    },
    "timestamp": "2026-09-25T11:15:00"
  }
  ```
* **Error (`401 Unauthorized`)**:
  Jika refresh token tidak valid, telah kedaluwarsa, atau terdeteksi telah digunakan ulang (Replay Attack):
  ```json
  {
    "success": false,
    "message": "Refresh token tidak valid atau telah kedaluwarsa. Silakan login kembali.",
    "data": null,
    "timestamp": "2026-09-25T11:15:01"
  }
  ```

---

### 4. Logout Pengguna (`POST /api/v1/auth/logout`)
* **Method**: `POST`
* **Path**: `/api/v1/auth/logout`
* **Response Headers**:
  ```http
  Set-Cookie: refreshToken=; Path=/api/v1/auth; Max-Age=0; HttpOnly; SameSite=Lax
  ```
* **Response Body (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Logout berhasil. Sesi telah diakhiri.",
    "data": null,
    "timestamp": "2026-09-25T11:30:00"
  }
  ```

---

### 5. Informasi Akun Pengguna (`GET /api/v1/auth/me`)
* **Header Wajib**: `Authorization: Bearer <accessToken>`
* **Response Body (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Data profil pengguna berhasil diambil",
    "data": {
      "id": "user_hafiz",
      "name": "Hafiz Muhammad",
      "email": "hafiz@streamflix.id",
      "avatarUrl": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120",
      "membershipTier": "VIP_4K"
    },
    "timestamp": "2026-09-25T11:30:00"
  }
  ```

---

## 💻 Referensi Implementasi Klien Mobile (Flutter)

Berikut adalah implementasi standar produksi untuk Flutter menggunakan `flutter_secure_storage` dan integrasi *silent refresh* pada `ApiClient`:

### A. Service Penyimpanan Token Terenkripsi (`TokenStorageService`)
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

### B. Interceptor Silent Refresh di Mobile Klien (`ApiClient` / `http`)
```dart
Future<http.Response> sendWithAutoRefresh(
  Future<http.Response> Function(String? token) executeRequest,
) async {
  String? accessToken = await TokenStorageService.getAccessToken();
  var response = await executeRequest(accessToken);

  // Jika token expired (401 Unauthorized), jalankan silent refresh
  if (response.statusCode == 401) {
    final refreshToken = await TokenStorageService.getRefreshToken();
    if (refreshToken == null) {
      await TokenStorageService.clearTokens();
      return response;
    }

    // Panggil POST /api/v1/auth/refresh dengan JSON body
    final refreshResponse = await http.post(
      Uri.parse('http://10.0.2.2:8080/api/v1/auth/refresh'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'refreshToken': refreshToken}),
    );

    if (refreshResponse.statusCode == 200) {
      final json = jsonDecode(refreshResponse.body);
      final newAccessToken = json['data']['accessToken'];
      final newRefreshToken = json['data']['refreshToken'];

      // Simpan token baru hasil rotasi
      await TokenStorageService.saveTokens(
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      );

      // Ulangi request asli dengan token baru
      response = await executeRequest(newAccessToken);
    } else {
      // Refresh token juga expired / invalid -> paksa logout
      await TokenStorageService.clearTokens();
    }
  }

  return response;
}
```

---

## 🔒 Konfigurasi CORS & Keamanan Cookie di Backend

Di Spring Boot (`CorsConfig.java`), header `allowCredentials` **wajib diatur ke `true`** agar browser mengizinkan pertukaran cookie lintas domain:

```java
@Configuration
public class CorsConfig {
    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true); // KRUSIAL UNTUK COOKIE HTTPONLY
        config.addAllowedOriginPattern("http://localhost:5173"); // Vite Frontend
        config.addAllowedOriginPattern("http://localhost:3000");
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}
```

---

## 📋 Pengujian via cURL

### 1. Login
```bash
curl -i -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"hafiz@streamflix.id","password":"password123","rememberMe":true}'
```

### 2. Silent Refresh (Menggunakan Cookie HttpOnly ala Web)
```bash
curl -i -X POST http://localhost:8080/api/v1/auth/refresh \
  -H "Cookie: refreshToken=<TOKEN_DARI_LOGIN>"
```

### 3. Silent Refresh (Menggunakan JSON Body ala Mobile)
```bash
curl -i -X POST http://localhost:8080/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"<TOKEN_DARI_LOGIN>"}'
```

### 4. Mengakses Profil Pribadi
```bash
curl -i -X GET http://localhost:8080/api/v1/auth/me \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

### 5. Logout
```bash
curl -i -X POST http://localhost:8080/api/v1/auth/logout
```
