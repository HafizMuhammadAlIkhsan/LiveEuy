package main

import (
	"fmt"
	"log"
	"os"

	"github.com/DXR3IN/auth-service/internal/config"
	"github.com/DXR3IN/auth-service/internal/http"
	"github.com/DXR3IN/auth-service/internal/infrastructure/provider"
	"github.com/DXR3IN/auth-service/internal/migration"
	repo "github.com/DXR3IN/auth-service/internal/repository"
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

	db, err := gorm.Open(postgres.Open(cfg.DBURL), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
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
	jwtMgr := utils.NewJWTManager(cfg.JWTConfig.Secret, cfg.JWTConfig.TTL)
	oauthProvider := provider.NewGoogleOAuthProvider(cfg)

	r := http.NewRouter(cfg, userRepo, jwtMgr, sessionRepo, oauthProvider)

	addr := fmt.Sprintf(":%s", cfg.Port)
	log.Printf("Starting server at %s", addr)
	if err := r.Run(addr); err != nil {
		log.Fatalf("Server error: %v", err)
	}
}
