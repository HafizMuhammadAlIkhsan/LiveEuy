# 🚀 Panduan Integrasi Admin Console & Kontrak Antar-Tim (Backend & Mobile)

**Platform Video Streaming LiveEuy**  
*Spesifikasi Resmi Integrasi Admin Studio CMS, RBAC Guard, User Security Controls, Stream Health Inspector, Batch Media Operations, dan Sinkronisasi Sesi Mobile (Flutter)*

---

## 📑 Daftar Isi
1. [Ringkasan Eksekutif & Arsitektur](#-ringkasan-eksekutif--arsitektur)
2. [Bagian I: Panduan & Spesifikasi untuk Tim Backend (Spring Boot 3 & Go)](#-bagian-i-panduan--spesifikasi-untuk-tim-backend)
   - [1.1 Perubahan Skema Database (PostgreSQL)](#11-perubahan-skema-database-postgresql)
   - [1.2 Endpoint Batch Operations Katalog Media](#12-endpoint-batch-operations-katalog-media)
   - [1.3 Endpoint Cadangan & Pemulihan Katalog (JSON)](#13-endpoint-cadangan--pemulihan-katalog-json)
   - [1.4 Endpoint Server-Side Stream Health Probe](#14-endpoint-server-side-stream-health-probe)
   - [1.5 Endpoint Manajemen & Keamanan Akun Pengguna](#15-endpoint-manajemen--keamanan-akun-pengguna)
   - [1.6 Implementasi Spring Boot 3 DTO & Controller](#16-implementasi-spring-boot-3-dto--controller)
3. [Bagian II: Panduan & Spesifikasi untuk Tim Mobile (Flutter / Android / iOS)](#-bagian-ii-panduan--spesifikasi-untuk-tim-mobile-flutter)
   - [2.1 Pembaruan Model Data User](#21-pembaruan-model-data-user-dart)
   - [2.2 Penanganan Interceptor Sesi: Akun Suspended & Remote Logout](#22-penanganan-interceptor-sesi-dio-flutter)
   - [2.3 Panduan Playback Stream Video (HLS & MP4) di Mobile](#23-panduan-playback-stream-video-hls--mp4-di-mobile)
4. [Bagian III: Standar Skema JSON Cadangan Katalog](#-bagian-iii-standar-skema-json-cadangan-katalog)
5. [Bagian IV: Matriks Pengujian Integrasi Antar-Tim (QA Checklist)](#-bagian-iv-matriks-pengujian-integrasi-antar-tim-qa-checklist)
6. [Bagian V: Standar Keamanan Siber Platform (Security Hardening Standards)](#-bagian-v-standar-keamanan-siber-platform-security-hardening-standards)

---

## 🏛️ Ringkasan Eksekutif & Arsitektur

Pembaruan pada **Admin Console LiveEuy** memperkenalkan fitur tingkat produksi:
1. **Role-Based Access Control (RBAC Guard)**: Proteksi ketat rute `/admin` dengan layar 403 Forbidden sinematik.
2. **User Security Management Suite**: Fitur penangguhan (*suspend/activate*), pemutusan sesi jarak jauh (*force remote logout*), pencarian, filter, dan CRUD pengguna.
3. **Stream URL Health Inspector**: Pengujian kelayakan tautan stream video real-time (`.m3u8` / `.mp4`) dengan mini tester player bawaan modal.
4. **Media Bulk Actions Suite**: Multi-select tayangan, *batch delete*, *batch set trending*, dan ekspor parsial.
5. **Catalog Backup & Restore (JSON)**: Ekspor dan pemulihan database katalog penuh dengan opsi *Merge* atau *Overwrite*.

```mermaid
flowchart TD
    subgraph WebAdmin["🌐 Web Admin Console (React + TS)"]
        Guard["<AdminRouteGuard /> (RBAC)"]
        MediaMod["CMS Media & Bulk Actions"]
        Inspector["Stream URL Health Inspector"]
        UserMod["User Security Suite (Suspend / Logout All)"]
        BackupMod["Catalog JSON Backup & Restore"]
    end

    subgraph Backend["⚙️ Backend Microservices"]
        Spring["Spring Boot 3 Catalog Service (Port 8080)"]
        GoAuth["Go Auth & Session Service (Port 8081)"]
        Redis["Redis Session & Token Blacklist"]
        DB[("PostgreSQL Database")]
    end

    subgraph Mobile["📱 Mobile Client (Flutter)"]
        Dio["Dio / HTTP Client Interceptor"]
        Player["Video Player (Better Player / HLS)"]
        Storage["Flutter Secure Storage"]
    end

    Guard -->|JWT Bearer (role == admin)| Spring
    UserMod -->|PATCH /status & POST /revoke-sessions| GoAuth
    GoAuth -->|Blacklist Token & Invalidate Session| Redis
    MediaMod -->|Batch DELETE & PATCH| Spring
    BackupMod -->|Export & Import JSON| Spring
    Spring --> DB
    GoAuth --> DB

    Dio -->|Check 401 / 403 Event| Redis
    Redis -.->|Token Revoked / Suspended| Dio
    Dio -->|Clear Tokens & Trigger UI Modal| Storage
    Player -->|Stream Playback| MediaMod
```

---

## ⚙️ Bagian I: Panduan & Spesifikasi untuk Tim Backend

### 1.1 Perubahan Skema Database (PostgreSQL)

Tim backend perlu menambahkan kolom status pada tabel `users` serta tabel pencatatan sesi / token blacklist:

```sql
-- 1. Tambahkan status pengguna pada tabel users
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'active' 
CHECK (status IN ('active', 'suspended'));

CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- 2. Tabel token blacklist untuk menangani Force Remote Logout
CREATE TABLE IF NOT EXISTS token_blacklist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token_jti VARCHAR(255) NOT NULL UNIQUE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    revoked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_token_blacklist_jti ON token_blacklist(token_jti);
CREATE INDEX IF NOT EXISTS idx_token_blacklist_expires_at ON token_blacklist(expires_at);
```

---

### 1.2 Endpoint Batch Operations Katalog Media

#### a. `POST /api/v1/admin/media/batch-delete`
Menghapus banyak tayangan sekaligus dari katalog media.
* **Otorisasi**: `Authorization: Bearer <AdminAccessToken>` (Wajib Role: `admin`)
* **Request Body**:
```json
{
  "ids": ["film-101", "film-102", "series-201"]
}
```
* **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Berhasil menghapus 3 tayangan dari katalog media.",
  "data": {
    "deletedCount": 3,
    "deletedIds": ["film-101", "film-102", "series-201"]
  }
}
```

#### b. `PATCH /api/v1/admin/media/batch-update`
Memperbarui atribut pada banyak tayangan sekaligus (contoh: massal jadikan trending atau ubah kategori usia).
* **Otorisasi**: `Authorization: Bearer <AdminAccessToken>` (Wajib Role: `admin`)
* **Request Body**:
```json
{
  "ids": ["film-101", "film-102"],
  "updates": {
    "isTrending": true,
    "isFeatured": false
  }
}
```
* **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Berhasil memperbarui 2 tayangan terpilih.",
  "data": {
    "updatedCount": 2,
    "appliedUpdates": {
      "isTrending": true,
      "isFeatured": false
    }
  }
}
```

---

### 1.3 Endpoint Cadangan & Pemulihan Katalog (JSON)

#### a. `GET /api/v1/admin/catalog/export`
Mengunduh salinan utuh seluruh katalog tayangan dalam format JSON standar.
* **Otorisasi**: `Authorization: Bearer <AdminAccessToken>`
* **Response (200 OK)**:
```json
{
  "appName": "LiveEuy Cinema Catalog Backup",
  "exportedAt": "2026-09-28T14:15:00.000Z",
  "exportedBy": "Hafiz Muhammad",
  "totalItems": 15,
  "media": [
    {
      "id": "cyberpunk-neo-nusantara",
      "title": "Cyberpunk: Neo Nusantara",
      "type": "movie",
      "tagline": "Ketika Masa Depan Bertemu Tradisi",
      "overview": "Di Jakarta tahun 2099...",
      "posterUrl": "https://images.unsplash.com/...",
      "backdropUrl": "https://images.unsplash.com/...",
      "releaseYear": 2026,
      "country": "Indonesia",
      "rating": 9.2,
      "matchScore": 98,
      "ageRating": "16+",
      "duration": "2j 15m",
      "quality": "4K UHD",
      "audio": "Dolby Atmos",
      "director": "Timo Tjahjanto",
      "cast": ["Iko Uwais", "Chelsea Islan"],
      "genres": ["Aksi", "Fiksi Ilmiah"],
      "videoUrl": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
      "trailerUrl": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      "isFeatured": true,
      "isTrending": true
    }
  ]
}
```

#### b. `POST /api/v1/admin/catalog/import`
Memulihkan katalog media dari payload JSON.
* **Otorisasi**: `Authorization: Bearer <AdminAccessToken>`
* **Request Body**:
```json
{
  "mode": "merge", // Opsi: "merge" | "replace"
  "media": [
    { /* Objek MediaItem */ }
  ]
}
```
* **Keterangan Mode**:
  * `merge`: Menambahkan tayangan baru dan menimpa record yang memiliki ID sama tanpa menghapus tayangan lain di database.
  * `replace`: Melakukan *hard truncate* atau penggantian menyeluruh katalog dengan daftar `media` dari payload.
* **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Pemulihan katalog selesai diproses dalam mode 'merge'.",
  "data": {
    "totalProcessed": 15,
    "inserted": 3,
    "updated": 12,
    "mode": "merge"
  }
}
```

---

### 1.4 Endpoint Server-Side Stream Health Probe

Frontend saat ini melakukan uji coba *client-side* via HTML5 video metadata & fallback no-cors probe. Namun, untuk CDN stream pihak ketiga yang menerapkan header CORS ketat (*Strict Origin*), backend Spring Boot disediakan endpoint pendamping untuk melakukan inspeksi berbasis **HTTP HEAD** atau **FFprobe**:

#### `POST /api/v1/admin/media/probe-stream`
* **Request Body**:
```json
{
  "videoUrl": "https://liveeuy-cdn.id/stream/manifest.m3u8"
}
```
* **Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "status": "healthy", // "healthy" | "slow" | "unreachable"
    "httpStatus": 200,
    "contentType": "application/x-mpegURL",
    "latencyMs": 84,
    "isHLS": true,
    "details": "Manifest HLS valid dengan 4 resolusi varian terdeteksi."
  }
}
```

---

### 1.5 Endpoint Manajemen & Keamanan Akun Pengguna

#### a. `PATCH /api/v1/admin/users/{userId}/status`
Menangguhkan (*suspend*) atau mengaktifkan (*activate*) akun pengguna.
* **Otorisasi**: `Authorization: Bearer <AdminAccessToken>`
* **Request Body**:
```json
{
  "status": "suspended", // "active" | "suspended"
  "reason": "Pelanggaran hak cipta / penayangan tidak sah"
}
```
* **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Status pengguna berhasil diperbarui menjadi 'suspended'.",
  "data": {
    "userId": "usr-102",
    "status": "suspended",
    "updatedAt": "2026-09-28T14:15:30Z"
  }
}
```

#### b. `POST /api/v1/admin/users/{userId}/revoke-sessions`
Mencabut paksa seluruh sesi login aktif milik pengguna dari jarak jauh (*Force Remote Logout*).
* **Otorisasi**: `Authorization: Bearer <AdminAccessToken>`
* **Cara Kerja Backend**:
  1. Hapus semua refresh token milik `userId` di database PostgreSQL.
  2. Masukkan `userId` ke daftar revocations di Redis dengan TTL selama umur sisa Access Token (misal 15 menit).
  3. API Gateway / JWT Filter memeriksa Redis cache pada setiap request. Jika `userId` terdaftar di blacklist, tolak dengan `401 Unauthorized` (`error_code: "SESSION_REVOKED"`).
* **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Seluruh sesi perangkat milik pengguna berhasil dicabut paksa.",
  "data": {
    "userId": "usr-102",
    "revokedSessionsCount": 3
  }
}
```

---

### 1.6 Implementasi Spring Boot 3 DTO & Controller

Contoh implementasi controller Spring Boot 3 untuk tim backend:

```java
package id.liveeuy.controller.admin;

import id.liveeuy.dto.ApiResponse;
import id.liveeuy.dto.admin.*;
import id.liveeuy.service.AdminCatalogService;
import id.liveeuy.service.AdminUserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@Tag(name = "Admin Operations", description = "Endpoint CMS, Batch Catalog, Stream Inspector & User Security")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('ADMIN')")
public class AdminOperationsController {

    private final AdminCatalogService catalogService;
    private final AdminUserService userService;

    @PostMapping("/media/batch-delete")
    @Operation(summary = "Hapus massal tayangan dari katalog")
    public ResponseEntity<ApiResponse<BatchDeleteResponse>> batchDeleteMedia(
            @Valid @RequestBody BatchDeleteRequest request) {
        BatchDeleteResponse response = catalogService.batchDelete(request.getIds());
        return ResponseEntity.ok(ApiResponse.success("Berhasil menghapus tayangan terpilih", response));
    }

    @PatchMapping("/media/batch-update")
    @Operation(summary = "Perbarui atribut tayangan secara massal")
    public ResponseEntity<ApiResponse<BatchUpdateResponse>> batchUpdateMedia(
            @Valid @RequestBody BatchUpdateRequest request) {
        BatchUpdateResponse response = catalogService.batchUpdate(request.getIds(), request.getUpdates());
        return ResponseEntity.ok(ApiResponse.success("Berhasil memperbarui tayangan", response));
    }

    @GetMapping("/catalog/export")
    @Operation(summary = "Ekspor seluruh katalog ke format JSON")
    public ResponseEntity<CatalogExportDto> exportCatalog() {
        return ResponseEntity.ok(catalogService.exportFullCatalog());
    }

    @PostMapping("/catalog/import")
    @Operation(summary = "Pulihkan katalog dari file cadangan JSON")
    public ResponseEntity<ApiResponse<CatalogImportResponse>> importCatalog(
            @Valid @RequestBody CatalogImportRequest request) {
        CatalogImportResponse response = catalogService.importCatalog(request.getMedia(), request.getMode());
        return ResponseEntity.ok(ApiResponse.success("Katalog berhasil dipulihkan", response));
    }

    @PatchMapping("/users/{userId}/status")
    @Operation(summary = "Ubah status pengguna (Active / Suspended)")
    public ResponseEntity<ApiResponse<UserStatusResponse>> updateUserStatus(
            @PathVariable String userId,
            @Valid @RequestBody UserStatusRequest request) {
        UserStatusResponse response = userService.updateStatus(userId, request.getStatus(), request.getReason());
        return ResponseEntity.ok(ApiResponse.success("Status pengguna diperbarui", response));
    }

    @PostMapping("/users/{userId}/revoke-sessions")
    @Operation(summary = "Putus paksa seluruh sesi login pengguna (Force Remote Logout)")
    public ResponseEntity<ApiResponse<RevokeSessionsResponse>> revokeUserSessions(
            @PathVariable String userId) {
        RevokeSessionsResponse response = userService.revokeAllSessions(userId);
        return ResponseEntity.ok(ApiResponse.success("Sesi pengguna berhasil dicabut", response));
    }
}
```

---

## 📱 Bagian II: Panduan & Spesifikasi untuk Tim Mobile (Flutter)

### 2.1 Pembaruan Model Data User (Dart)

Tambahkan field `status` pada model `User`:

```dart
enum UserStatus {
  active,
  suspended,
}

class User {
  final String id;
  final String name;
  final String email;
  final String avatar;
  final String tier;
  final String role; // 'admin' | 'user'
  final UserStatus status;
  final String memberSince;

  User({
    required this.id,
    required this.name,
    required this.email,
    required this.avatar,
    required this.tier,
    required this.role,
    this.status = UserStatus.active,
    required this.memberSince,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] as String,
      name: json['name'] as String,
      email: json['email'] as String,
      avatar: json['avatar'] as String? ?? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120',
      tier: json['tier'] as String? ?? 'VIP Standard',
      role: json['role'] as String? ?? 'user',
      status: (json['status'] == 'suspended') ? UserStatus.suspended : UserStatus.active,
      memberSince: json['memberSince'] as String? ?? 'September 2026',
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'email': email,
    'avatar': avatar,
    'tier': tier,
    'role': role,
    'status': status == UserStatus.suspended ? 'suspended' : 'active',
    'memberSince': memberSince,
  };
}
```

---

### 2.2 Penanganan Interceptor Sesi (Dio Flutter)

Ketika Admin melakukan aksi:
1. **Suspend User** → Backend mengembalikan HTTP 403 dengan `error_code: "ACCOUNT_SUSPENDED"`.
2. **Force Remote Logout** → Backend mengembalikan HTTP 401 dengan `error_code: "SESSION_REVOKED"`.

Aplikasi Flutter wajib menangkap kedua error ini di `AuthInterceptor` untuk membersihkan secure storage dan mengarahkan pengguna kembali ke layar Login dengan pesan yang bersahabat:

```dart
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class LiveEuyAuthInterceptor extends Interceptor {
  final FlutterSecureStorage secureStorage;
  final GlobalKey<NavigatorState> navigatorKey;

  LiveEuyAuthInterceptor({
    required this.secureStorage,
    required this.navigatorKey,
  });

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    final response = err.response;

    if (response != null) {
      final statusCode = response.statusCode;
      final responseData = response.data;
      final errorCode = responseData is Map ? responseData['error_code'] : null;

      // 1. Kasus: Akun Ditangguhkan (Suspended)
      if (statusCode == 403 && errorCode == 'ACCOUNT_SUSPENDED') {
        await _clearSession();
        _showSuspendedDialog(
          responseData['message'] ?? 'Akun Anda telah ditangguhkan oleh Administrator LiveEuy.',
        );
        return handler.reject(err);
      }

      // 2. Kasus: Sesi Dicabut Paksa dari Admin Panel (Force Remote Logout)
      if (statusCode == 401 && errorCode == 'SESSION_REVOKED') {
        await _clearSession();
        _showRemoteLogoutSnackbar(
          'Sesi login Anda telah diputus oleh admin dari pusat kontrol. Silakan masuk kembali.',
        );
        navigatorKey.currentState?.pushNamedAndRemoveUntil('/login', (route) => false);
        return handler.reject(err);
      }
    }

    super.onError(err, handler);
  }

  Future<void> _clearSession() async {
    await secureStorage.delete(key: 'access_token');
    await secureStorage.delete(key: 'refresh_token');
    await secureStorage.delete(key: 'user_profile');
  }

  void _showSuspendedDialog(String message) {
    final context = navigatorKey.currentContext;
    if (context == null) return;

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF161822),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Row(
          children: [
            Icon(Icons.gavel_rounded, color: Colors.amberAccent),
            SizedBox(width: 8),
            Text('Akun Ditangguhkan', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ],
        ),
        content: Text(message, style: const TextStyle(color: Colors.white70, fontSize: 13)),
        actions: [
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFE50914)),
            onPressed: () {
              Navigator.of(ctx).pop();
              navigatorKey.currentState?.pushNamedAndRemoveUntil('/login', (route) => false);
            },
            child: const Text('Kembali ke Login', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  void _showRemoteLogoutSnackbar(String message) {
    final context = navigatorKey.currentContext;
    if (context == null) return;

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: const Color(0xFFE50914),
        duration: const Duration(seconds: 4),
      ),
    );
  }
}
```

---

### 2.3 Panduan Playback Stream Video (HLS & MP4) di Mobile

Aplikasi Flutter mendukung tautan video MP4 progresif dan HLS `.m3u8` adaptif. Gunakan pustaka `better_player` atau `video_player` dengan konfigurasi berikut:

```dart
import 'package:better_player/better_player.dart';

BetterPlayerDataSource createDataSource(String streamUrl) {
  final isHls = streamUrl.contains('.m3u8');

  return BetterPlayerDataSource(
    BetterPlayerDataSourceType.network,
    streamUrl,
    videoFormat: isHls ? BetterPlayerVideoFormat.hls : BetterPlayerVideoFormat.other,
    cacheConfiguration: const BetterPlayerCacheConfiguration(
      useCache: true,
      maxCacheSize: 50 * 1024 * 1024, // 50 MB cache
      maxCacheFileSize: 10 * 1024 * 1024,
    ),
    headers: {
      'User-Agent': 'LiveEuy-Mobile-Flutter/1.0',
      'Referer': 'https://liveeuy.id/',
    },
    bufferingConfiguration: const BetterPlayerBufferingConfiguration(
      minBufferMs: 15000,
      maxBufferMs: 50000,
      bufferForPlaybackMs: 2500,
      bufferForPlaybackAfterRebufferMs: 5000,
    ),
  );
}
```

---

## 💾 Bagian III: Standar Skema JSON Cadangan Katalog

File cadangan yang diekspor dari Web Admin (`liveeuy-catalog-backup-YYYY-MM-DD.json`) mengikuti skema berikut:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "LiveEuyCatalogBackup",
  "type": "object",
  "required": ["appName", "exportedAt", "totalItems", "media"],
  "properties": {
    "appName": { "type": "string" },
    "exportedAt": { "type": "string", "format": "date-time" },
    "exportedBy": { "type": "string" },
    "totalItems": { "type": "integer", "minimum": 0 },
    "media": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id", "title", "type", "videoUrl"],
        "properties": {
          "id": { "type": "string" },
          "title": { "type": "string" },
          "originalTitle": { "type": "string" },
          "type": { "type": "string", "enum": ["movie", "tv"] },
          "tagline": { "type": "string" },
          "overview": { "type": "string" },
          "posterUrl": { "type": "string" },
          "backdropUrl": { "type": "string" },
          "releaseYear": { "type": "integer" },
          "country": { "type": "string" },
          "rating": { "type": "number" },
          "matchScore": { "type": "integer" },
          "ageRating": { "type": "string", "enum": ["SU", "13+", "16+", "18+", "21+"] },
          "duration": { "type": "string" },
          "totalSeasons": { "type": "integer" },
          "quality": { "type": "string" },
          "audio": { "type": "string" },
          "director": { "type": "string" },
          "cast": { "type": "array", "items": { "type": "string" } },
          "genres": { "type": "array", "items": { "type": "string" } },
          "videoUrl": { "type": "string" },
          "trailerUrl": { "type": "string" },
          "isFeatured": { "type": "boolean" },
          "isTrending": { "type": "boolean" },
          "topRank": { "type": "integer" }
        }
      }
    }
  }
}
```

---

## 🧪 Bagian IV: Matriks Pengujian Integrasi Antar-Tim (QA Checklist)

| No | Modul / Skenario | Langkah Pengujian | Hasil yang Diharapkan (Expected) | Status Web | Status Mobile |
| :--- | :--- | :--- | :--- | :---: | :---: |
| **1** | **RBAC Route Guard** | Akses URL `/admin` tanpa token admin | Dialihkan ke layar login admin atau 403 Forbidden | ✅ Pass | N/A (Admin Web Only) |
| **2** | **Suspend User** | Admin mengubah status user ke `suspended` | User di web & Flutter langsung ter-logout dengan modal penangguhan | ✅ Pass | 📋 Ready for QA |
| **3** | **Force Remote Logout** | Admin klik "Putus Sesi Seluruh Perangkat" | Refresh token dihapus di backend, Flutter interceptor memicu logout | ✅ Pass | 📋 Ready for QA |
| **4** | **Stream Health Inspector** | Input URL stream dan klik "Uji Kelayakan" | Muncul status aktif + latensi + opsi Mini Player pratinjau | ✅ Pass | N/A (Admin Web Only) |
| **5** | **Batch Delete Media** | Centang 3 film di tabel dan klik "Hapus Terpilih" | Muncul dialog konfirmasi; 3 film terhapus serentak dari katalog & API | ✅ Pass | N/A (Admin Web Only) |
| **6** | **Batch Set Trending** | Centang 2 film dan klik "Set Trending" | Kedua film otomatis berstatus `isTrending: true` di katalog | ✅ Pass | N/A (Admin Web Only) |
| **7** | **Export Backup JSON** | Klik "Cadangkan JSON" di toolbar | Terunduh file `liveeuy-catalog-backup-*.json` berisi semua data media | ✅ Pass | N/A (Admin Web Only) |
| **8** | **Restore JSON (Merge)** | Unggah file cadangan dengan mode *Merge* | Tayangan baru bertambah tanpa menghapus tayangan lama yang ada | ✅ Pass | N/A (Admin Web Only) |
| **9** | **Restore JSON (Overwrite)**| Unggah file cadangan dengan mode *Overwrite* | Seluruh katalog tergantikan 1:1 dengan isi file cadangan | ✅ Pass | N/A (Admin Web Only) |
| **10** | **JSON Protocol Sanitization**| Unggah file JSON berisi URL berbahaya (`javascript:`, `vbscript:`) | Data berbahaya disaring & ditolak otomatis, alert keamanan tampil | ✅ Pass | N/A (Admin Web Only) |
| **11** | **Brute-Force Rate Limiter** | Coba login salah 5x berturut-turut di modal auth | Form terkunci 60 detik dengan hitung mundur & input dinonaktifkan | ✅ Pass | 📋 Ready for Mobile |

---

## 🛡️ Bagian V: Standar Keamanan Siber Platform (Security Hardening Standards)

Untuk menjaga kedaulatan data pengguna, lisensi tayangan sinema, dan integritas platform, seluruh tim wajib mematuhi standar berikut:

### 5.1 Web Client Hardening
1. **Content Security Policy (CSP)**:
   - Dideklarasikan pada `index.html` dengan restriksi `default-src 'self'`, `object-src 'none'`, `base-uri 'self'`, dan daftar whitelist domain media yang diperbolehkan (`test-streams.mux.dev`, `commondatastorage.googleapis.com`, `akamaihd.net`, `cloudflarestream.com`).
2. **Anti-Clickjacking Defense**:
   - Skrip frame-buster OWASP dan CSS `display:none` disematkan di `<head>` untuk menggagalkan upaya framing LiveEuy di situs penipuan (*clickjacking*).
3. **Login Brute-Force Throttling**:
   - Client throttling otomatis mengunci form selama 60 detik setelah 5 kali kegagalan autentikasi berturut-turut (`src/utils/security.ts`).
   - Tim Backend wajib mengimbangi dengan Redis-based rate limiting (5 req/menit per IP) pada endpoint `/api/v1/auth/login`.
4. **Input & JSON Schema Sanitization (OWASP CWE-20 & CWE-79)**:
   - Setiap berkas cadangan JSON yang diunggah diproses melalui `sanitizeMediaCatalog()`.
   - URL yang mengandung protokol non-HTTP/HTTPS (seperti `javascript:`, `data:text/html`, `vbscript:`) langsung disaring dan ditolak.

### 5.2 Perlindungan Aliran Konten Video (Media DRM & Anti-Piracy Roadmap)
1. **CDN Signed URLs / HMAC Tokens**:
   - URL `.m3u8` master manifest harus memiliki query parameter tanda tangan kriptografis (contoh: `?token=...&expires=1727500000`) yang di-generate backend per pengguna dengan masa berlaku 2-4 jam.
2. **Enkripsi HLS & DRM**:
   - Tahap 1: Enkripsi AES-128 via HLS (`#EXT-X-KEY:METHOD=AES-128,URI="https://auth.liveeuy.id/hls/key"`) dengan token otentikasi saat mengambil kunci enkripsi.
   - Tahap 2: Google Widevine L3/L1 (Android & Desktop Web via EME / Encrypted Media Extensions) & Apple FairPlay (iOS Safari & Flutter iOS).

### 5.3 Mobile Security Standards (Flutter)
1. **SSL Certificate Pinning**:
   - Mencegah intersepsi Man-in-the-Middle (MITM) pada lalu lintas API produksi menggunakan sertifikat SHA-256 fingerprint.
2. **Penyimpanan Kunci Kredensial**:
   - Wajib menggunakan `flutter_secure_storage` (Android Keystore / iOS Keychain) untuk menyimpan access token & refresh token. Dilarang keras menggunakan plain `SharedPreferences`.
3. **Anti-Screen Recording & Screenshot (`FLAG_SECURE`)**:
   - Mengaktifkan `WindowManager.LayoutParams.FLAG_SECURE` pada Activity Android saat player video aktif untuk mencegah perekaman layar ilegal dari film berbayar.
4. **Root / Jailbreak Detection**:
   - Memeriksa status perangkat yang di-root untuk membatasi pemutaran resolusi 4K UHD demi memenuhi persyaratan kepatuhan lisensi studio film internasional.
