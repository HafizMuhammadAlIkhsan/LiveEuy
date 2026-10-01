# Panduan Teknis & Arsitektur: Fitur Unduh Offline (YouTube-Style) dengan Cloudflare R2

Dokumen ini ditujukan untuk **Tim Backend** LiveEuy sebagai acuan standar implementasi API, manajemen kredensial Cloudflare R2, enkripsi konten, dan pengelolaan lisensi offline (*offline DRM/license renewal*).

---

## 1. Arsitektur & Prinsip Keamanan

Sistem unduh offline LiveEuy mengadopsi pola **YouTube Offline / Netflix Offline**:

```
[ Mobile App ] ─── 1. POST /downloads/request ──────────> [ Backend API ]
                                                               │
                                                       (1. Validasi VIP/Hak Akses)
                                                       (2. Hitung Kuota Perangkat)
                                                       (3. Sign Cloudflare R2 Presigned URL)
                                                       (4. Generate License Token & Expiry)
                                                               │
[ Mobile App ] <── 2. Presigned URL + License Token ───────────┘
      │
      ├──── 3. Download binary chunk langsung dari Cloudflare R2 (Bypass server backend)
      │
[ Cloudflare R2 Bucket ]
      │
      ▼
[ Penyimpanan Privat App (Internal Sandbox) ]
      │
[ Local Hive DB (Metadata & Expiry) ]
      │
      ▼
[ Pemutaran Video (ExoPlayer/AVPlayer dari File Lokal) ]
      │
      └── (Jika masa aktif habis > 30 hari) ──> POST /downloads/renew-license ──> [ Backend API ]
```

### Prinsip Utama:
1. **Zero Secret on Client**: Kredensial Cloudflare R2 (`ACCESS_KEY_ID`, `SECRET_ACCESS_KEY`, `ENDPOINT_URL`) **HANYA** disimpan di server backend (Environment Secrets). Aplikasi mobile sama sekali tidak memiliki akses langsung ke kredensial master R2.
2. **Short-Lived Presigned URLs**: Backend menghasilkan URL unduh sementara dari Cloudflare R2 dengan masa berlaku singkat (**15–30 menit**).
3. **Restricted Storage**: File video disimpan di direktori internal aplikasi (*app-private documents storage*), bukan galeri publik.
4. **Offline Playback Expiry**: Setiap unduhan memiliki lisensi dengan masa aktif terbatas (default: **30 hari**). Ketika lisensi kedaluwarsa, aplikasi mewajibkan pengguna terhubung ke internet untuk memperbarui lisensi (*license renewal*) tanpa perlu mengunduh ulang file video.

---

## 2. Konfigurasi Cloudflare R2 & Integrasi S3 SDK

Cloudflare R2 menyediakan API yang kompatibel dengan protokol AWS S3 SDK.

### A. Environment Variables Backend
```env
# Cloudflare R2 Configuration
R2_ACCOUNT_ID=your_cloudflare_account_id
R2_ACCESS_KEY_ID=your_r2_access_key_id
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
R2_BUCKET_NAME=liveeuy-media-production
R2_PUBLIC_DOMAIN=https://media.liveeuy.com # (Optional CDN domain)
R2_ENDPOINT=https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com
```

### B. Contoh Pembuatan Presigned URL (Java / Spring Boot)
Backend dapat menggunakan `software.amazon.awssdk:s3` atau `s3-presigner`:

```java
@Service
public class R2PresignedUrlService {

    @Value("${R2_BUCKET_NAME}")
    private String bucketName;

    private final S3Presigner s3Presigner;

    public R2PresignedUrlService(
            @Value("${R2_ENDPOINT}") String endpoint,
            @Value("${R2_ACCESS_KEY_ID}") String accessKey,
            @Value("${R2_SECRET_ACCESS_KEY}") String secretKey) {

        AwsBasicCredentials credentials = AwsBasicCredentials.create(accessKey, secretKey);
        
        this.s3Presigner = S3Presigner.builder()
                .endpointOverride(URI.create(endpoint))
                .credentialsProvider(StaticCredentialsProvider.create(credentials))
                .region(Region.of("auto"))
                .build();
    }

    public String generatePresignedDownloadUrl(String objectKey, Duration duration) {
        GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                .bucket(bucketName)
                .key(objectKey)
                .build();

        GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                .signatureDuration(duration) // e.g. Duration.ofMinutes(30)
                .getObjectRequest(getObjectRequest)
                .build();

        return s3Presigner.presignGetObject(presignRequest).url().toString();
    }
}
```

### C. Contoh Pembuatan Presigned URL (Node.js / Express / NestJS)
```typescript
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function getR2PresignedUrl(objectKey: string, expiresInSeconds = 1800): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: objectKey,
  });
  return await getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
}
```

---

## 3. Spesifikasi Kontrak API (API Endpoints)

Semua endpoint dilindungi oleh JWT header `Authorization: Bearer <accessToken>`.

---

### Endpoint 1: Request Download Video
Memvalidasi hak akses pengguna (VIP tier), batas kuota perangkat, dan menerbitkan Presigned URL Cloudflare R2 beserta token lisensi offline.

* **Method**: `POST`
* **Path**: `/api/v1/downloads/request`
* **Headers**:
  ```http
  Authorization: Bearer <JWT_ACCESS_TOKEN>
  Content-Type: application/json
  X-Device-Id: <DEVICE_UUID>
  ```
* **Request Body**:
  ```json
  {
    "mediaId": "m1",
    "episodeId": "m1_ep1",      // null jika Film (bukan Serial TV)
    "quality": "1080p",          // "480p" | "720p" | "1080p" | "4K"
    "deviceId": "dev_android_991823"
  }
  ```

* **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Izin unduh berhasil diterbitkan",
    "data": {
      "downloadId": "dl_891724019283",
      "mediaId": "m1",
      "episodeId": "m1_ep1",
      "title": "Gadis Kretek - Episode 1: Jeng Yah",
      "quality": "1080p",
      "presignedUrl": "https://liveeuy-media-production.r2.cloudflarestorage.com/videos/gadis_kretek_ep1_1080p.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=...&X-Amz-Expires=1800&X-Amz-Signature=...",
      "presignedExpiresInSeconds": 1800,
      "fileSizeBytes": 458920112,
      "checksumSha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      "license": {
        "licenseToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "issuedAt": "2026-10-01T09:50:00Z",
        "expiresAt": "2026-10-31T09:50:00Z",
        "maxOfflineDays": 30
      }
    }
  }
  ```

* **Error Responses**:
  * `401 Unauthorized`: Token pengguna tidak valid atau kedaluwarsa.
  * `403 Forbidden`: 
    ```json
    {
      "success": false,
      "errorCode": "VIP_REQUIRED",
      "message": "Fitur unduh offline resolusi tinggi memerlukan paket LIVEEUY VIP Cinema Ultra."
    }
    ```
    atau batas kuota perangkat tercapai:
    ```json
    {
      "success": false,
      "errorCode": "DEVICE_LIMIT_REACHED",
      "message": "Batas unduhan pada perangkat telah mencapai batas maksimum (maksimal 4 perangkat aktif)."
    }
    ```
  * `404 Not Found`: Media atau episode tidak ditemukan di katalog.

---

### Endpoint 2: Renew Offline Playback License
Digunakan ketika masa berlaku lisensi lokal (misal: 30 hari) habis atau mendekati habis, namun file fisik video masih tersimpan di storage perangkat. **Pengguna TIDAK perlu mengunduh ulang ratusan megabyte/gigabyte video**, hanya memperbarui lisensi hak tonton.

* **Method**: `POST`
* **Path**: `/api/v1/downloads/renew-license`
* **Headers**:
  ```http
  Authorization: Bearer <JWT_ACCESS_TOKEN>
  Content-Type: application/json
  ```
* **Request Body**:
  ```json
  {
    "downloadId": "dl_891724019283",
    "mediaId": "m1",
    "episodeId": "m1_ep1",
    "currentLicenseToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "deviceId": "dev_android_991823"
  }
  ```

* **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Lisensi offline berhasil diperpanjang 30 hari kedepan",
    "data": {
      "downloadId": "dl_891724019283",
      "licenseToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9_NEW_TOKEN...",
      "issuedAt": "2026-10-31T10:00:00Z",
      "expiresAt": "2026-11-30T10:00:00Z",
      "maxOfflineDays": 30
    }
  }
  ```

* **Error Response (`403 Forbidden`)**:
  Jika status VIP pengguna sudah kedaluwarsa dan belum membayar perpanjangan:
  ```json
  {
    "success": false,
    "errorCode": "SUBSCRIPTION_EXPIRED",
    "message": "Paket VIP Anda telah berakhir. Perpanjang langganan untuk melanjutkan menonton offline."
  }
  ```

---

### Endpoint 3: Notifikasi Hapus Unduhan (Release Quota)
Dipanggil saat pengguna menghapus file unduhan di aplikasi mobile untuk membebaskan kuota perangkat di database backend.

* **Method**: `DELETE`
* **Path**: `/api/v1/downloads/{downloadId}`
* **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Sesi unduhan berhasil dihapus dari daftar perangkat aktif"
  }
  ```

---

### Endpoint 4: Sinkronisasi Riwayat Tontonan Offline (Offline Analytics Sync)
Ketika user menonton video saat offline dan kemudian mendapatkan koneksi internet, mobile app mengirimkan log tontonan agar *continue watching* dan statistik tayangan tetap sinkron.

* **Method**: `POST`
* **Path**: `/api/v1/downloads/sync`
* **Request Body**:
  ```json
  {
    "sessions": [
      {
        "mediaId": "m1",
        "episodeId": "m1_ep1",
        "watchedDurationSeconds": 1840,
        "totalDurationSeconds": 3120,
        "lastWatchedPositionSeconds": 1840,
        "watchedAt": "2026-10-05T14:22:10Z"
      }
    ]
  }
  ```

* **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Statistik pemutaran offline berhasil disinkronkan"
  }
  ```

---

## 4. Desain Skema Database Backend (Rekomendasi)

Tabel berikut direkomendasikan untuk PostgreSQL / MySQL:

```sql
-- Tabel Sesi Unduhan Pengguna
CREATE TABLE user_downloads (
    id VARCHAR(64) PRIMARY KEY,                  -- dl_891724019283
    user_id VARCHAR(64) NOT NULL,                -- Foreign key ke tabel users
    device_id VARCHAR(128) NOT NULL,             -- UUID perangkat
    media_id VARCHAR(64) NOT NULL,               -- Foreign key ke tabel media
    episode_id VARCHAR(64) NULL,                 -- Null jika Film
    quality VARCHAR(16) NOT NULL DEFAULT '1080p',
    file_size_bytes BIGINT NOT NULL,
    license_token TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    license_expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(24) NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'REVOKED', 'DELETED'
    last_synced_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_user_downloads_user ON user_downloads(user_id, status);
CREATE INDEX idx_user_downloads_device ON user_downloads(device_id);
```

---

## 5. Proteksi Enkripsi Video (Anti-Piracy)

Ada dua level proteksi yang dapat dipilih tim backend:

### Level 1: Standard URL Token & App-Sandbox (Paling Mudah Diimplementasikan)
* Video disimpan di R2 dalam format `.mp4`.
* Mobile mengunduh file via Presigned URL dan menyimpannya di direktori internal aplikasi (`/data/user/0/com.liveeuy.app/app_flutter/offline_downloads/`).
* Aplikasi media lain dan file explorer standar tidak memiliki izin membaca file ini tanpa akses Root.
* Hive database menyimpan `expiresAt` dan token lisensi untuk mengontrol pemutaran di UI.

### Level 2: HLS AES-128 Segmented Encryption (Standar Industri YouTube/Netflix)
* Video di R2 ditranscode menjadi paket HLS (`master.m3u8` dan potongan `.ts` yang dienkripsi AES-128).
* Tag `#EXT-X-KEY` dalam playlist merujuk ke endpoint backend:
  `URI="https://api.liveeuy.com/api/v1/drm/key?token=..."`
* Saat memutar offline, key didekripsi menggunakan kunci lokal yang disimpan di Android Keystore / iOS Keychain.

---

## 6. Ringkasan Checklist untuk Tim Backend

- [ ] Konfigurasi Bucket Cloudflare R2 dengan izin baca privat (non-public).
- [ ] Implementasikan service `S3Presigner` untuk generate URL unduhan dengan TTL 30 menit.
- [ ] Buat endpoint `POST /api/v1/downloads/request` dengan validasi VIP dan limit kuota.
- [ ] Buat endpoint `POST /api/v1/downloads/renew-license` untuk pembaruan lisensi 30 harian.
- [ ] Buat endpoint `DELETE /api/v1/downloads/{downloadId}` untuk penghapusan sesi.
- [ ] Buat endpoint `POST /api/v1/downloads/sync` untuk sinkronisasi analytics pemutaran offline.
- [ ] Pastikan respons error menggunakan format standar `ApiResponse` (JSON).
