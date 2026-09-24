package main

import (
	"fmt"
	"log"
	"os"

	"github.com/DXR3IN/auth-service/internal/config"
	"github.com/DXR3IN/auth-service/internal/http"
	"github.com/DXR3IN/auth-service/internal/migration"
	repo "github.com/DXR3IN/auth-service/internal/repository"
	"github.com/joho/godotenv"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

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

	userRepo := repo.NewUserRepository(db)

	r := http.NewRouter(cfg, userRepo)

	addr := fmt.Sprintf(":%s", cfg.Port)
	log.Printf("Starting server at %s", addr)
	if err := r.Run(addr); err != nil {
		log.Fatalf("Server error: %v", err)
	}
}
