package main

import (
	"fmt"
	"log"
	"os"
	"time"

	"github.com/DXR3IN/auth-service/internal/config"
	"github.com/DXR3IN/auth-service/internal/http"
	"github.com/DXR3IN/auth-service/internal/infrastructure/provider"
	"github.com/DXR3IN/auth-service/internal/migration"
	repo "github.com/DXR3IN/auth-service/internal/repository"
	"github.com/DXR3IN/auth-service/internal/storage"
	"github.com/DXR3IN/auth-service/internal/utils"
	"github.com/joho/godotenv"
	"github.com/redis/go-redis/v9"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// @title Auth Service API
// @version 1.0
// @description Authentication & User Management Service for LiveEuy platform.
// @termsOfService http://swagger.io/terms/

// @contact.name API Support
// @contact.email support@liveeuy.com

// @license.name MIT
// @license.url https://opensource.org/licenses/MIT

// @host localhost:8080
// @BasePath /

// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
// @description Type "Bearer" followed by a space and JWT token.


func main() {
	// Load environment variables
	if _, exists := os.LookupEnv("RUNNING_IN_DOCKER"); !exists {
		if err := godotenv.Load(); err != nil {
			log.Printf("Warning: .env file not found")
		}
	}

	cfg := config.NewConfigFromEnv()

	db, err := gorm.Open(postgres.New(postgres.Config{
		DSN:                  cfg.DBURL,
		PreferSimpleProtocol: true, // Disables prepared statement caching for Neon Pooler / PgBouncer compatibility
	}), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Warn), // Prevent leaking SQL queries and sensitive parameters in production logs
	})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// Configure database connection pool to prevent connection exhaustion and DoS
	sqlDB, err := db.DB()
	if err == nil {
		sqlDB.SetMaxIdleConns(10)
		sqlDB.SetMaxOpenConns(50)
		sqlDB.SetConnMaxLifetime(time.Hour)
	}

	log.Println("Database connection established")

	log.Println("Running database migrations...")
	if err := migration.RunMigrations(db); err != nil {
		log.Fatalf("Migration failed: %v", err)
	}
	log.Println("All migrations completed successfully")

	if err := migration.ShowMigrationStatus(db); err != nil {
		log.Printf("Warning: Could not show migration status: %v", err)
	}

	// Initialize Redis
	redisOptions, err := redis.ParseURL(cfg.RedisData.URL)
	if err != nil {
		log.Printf("Warning: Could not parse Redis URL, using fallback default. Error: %v", err)
		redisOptions = &redis.Options{Addr: "localhost:6379"}
	}
	rdb := redis.NewClient(redisOptions)

	// Repositories and Providers
	userRepo := repo.NewUserRepository(db)
	sessionRepo := repo.NewRedisSessionRepository(rdb)

	// Initialize RSA Keypair & JWT Manager (Asymmetric RS256)
	privKey, pubKey, err := utils.LoadOrGenerateRSAKeys(
		cfg.JWTConfig.PrivateKeyPath,
		cfg.JWTConfig.PublicKeyPath,
		cfg.JWTConfig.PrivateKey,
		cfg.JWTConfig.PublicKey,
	)
	if err != nil {
		log.Fatalf("Failed to initialize RSA keys: %v", err)
	}
	jwtMgr := utils.NewJWTManager(privKey, pubKey, cfg.JWTConfig.KeyID, cfg.JWTConfig.TTL)
	oauthProvider := provider.NewGoogleOAuthProvider(cfg)

	// ── Cloudflare R2 Storage ────────────────────────────────────────────────
	// R2 bersifat opsional: jika R2_ACCOUNT_ID tidak diset, fitur upload avatar
	// tetap berjalan tanpa error pada saat startup (hanya gagal saat digunakan).
	var r2Svc storage.R2StorageService
	if cfg.R2Config.AccountID != "" {
		r2Client, r2Err := storage.NewR2Client(&storage.R2Config{
			AccountID:       cfg.R2Config.AccountID,
			AccessKeyID:     cfg.R2Config.AccessKeyID,
			SecretAccessKey: cfg.R2Config.SecretAccessKey,
			BucketName:      cfg.R2Config.BucketName,
			PublicURL:       cfg.R2Config.PublicURL,
		})
		if r2Err != nil {
			log.Printf("Warning: Gagal inisialisasi R2 client: %v (fitur upload avatar tidak tersedia)", r2Err)
		} else {
			r2Svc = storage.NewR2StorageService(r2Client)
			log.Printf("Cloudflare R2 berhasil diinisialisasi (bucket: %s)", cfg.R2Config.BucketName)
		}
	} else {
		log.Println("Warning: R2_ACCOUNT_ID tidak dikonfigurasi. Fitur upload avatar tidak tersedia.")
	}

	r := http.NewRouter(cfg, userRepo, jwtMgr, sessionRepo, oauthProvider, r2Svc)

	addr := fmt.Sprintf(":%s", cfg.Port)
	log.Printf("Starting server at %s", addr)
	if err := r.Run(addr); err != nil {
		log.Fatalf("Server error: %v", err)
	}
}
