# LiveEuy - Spring Boot 3 & Swagger RESTful Backend

Aplikasi backend mikro/layanan RESTful untuk platform **LiveEuy**, dibangun dengan **Spring Boot 3.3.4**, **Java 17**, dan **SpringDoc OpenAPI (Swagger UI)**.

---

## 🚀 Cara Menjalankan Backend

### Prasyarat
- Java 17 atau lebih baru (`openjdk@17` / Temurin)
- Apache Maven 3.8+ (atau Docker)

### Opsi 1: Menjalankan dengan Maven
```bash
cd backend
mvn clean spring-boot:run
```

### Opsi 2: Menjalankan dengan Docker
Jika di komputer lokal belum terpasang JDK 17:
```bash
cd backend
docker build -t liveeuy-backend .
docker run -p 8080:8080 liveeuy-backend
```

---

## 📖 Akses Dokumentasi Swagger UI

Setelah aplikasi berjalan, buka browser di alamat:
- **Swagger UI Interaktif**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
- **OpenAPI JSON Spec**: [http://localhost:8080/api-docs](http://localhost:8080/api-docs)

---

## 🏛️ Arsitektur Paket (Package Architecture)
```
com.liveeuy.backend/
├── LiveEuyBackendApplication.java
├── config/
│   ├── OpenApiConfig.java    # Konfigurasi Swagger & OpenAPI
│   └── CorsConfig.java       # Pengaturan CORS untuk Frontend React (:3000)
├── model/
│   ├── MediaItem.java        # Entitas Film & Serial
│   ├── Episode.java          # Entitas Episode
│   ├── Season.java           # Entitas Musim
│   ├── Review.java           # Entitas Ulasan
│   └── WatchProgress.java    # Entitas Durasi Tontonan
├── dto/
│   ├── ApiResponse.java      # Wrapper respon standar JSON
│   ├── ReviewRequest.java    # DTO kirim review
│   └── WatchProgressRequest.java # DTO sinkronisasi durasi
├── service/
│   └── MediaService.java     # Layanan data dan logika bisnis (in-memory & seeded)
└── controller/
    ├── MediaController.java  # Endpoints /api/v1/media
    ├── WatchlistController.java # Endpoints /api/v1/user/watchlist
    ├── WatchProgressController.java # Endpoints /api/v1/user/progress
    └── ReviewController.java # Endpoints /api/v1/media/{id}/reviews
```
