package main

import (
	"context"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/LiveEuy/transcoder-service/config"
	"github.com/LiveEuy/transcoder-service/internal/api"
	"github.com/LiveEuy/transcoder-service/internal/service"
	"github.com/LiveEuy/transcoder-service/internal/storage"
)

func main() {
	log.Println("🎬 Memulai LiveEuy Transcoder Service...")

	cfg := config.LoadConfig()

	// Inisialisasi Storage (LocalStorage dengan abstraksi interface)
	var st storage.Storage
	var err error

	switch cfg.StorageType {
	case "r2", "s3":
		log.Printf("☁️ Menginisialisasi R2 Storage Provider (Scratch: %s)", cfg.StorageLocalDir)
		st, err = storage.NewR2Storage("liveeuy-media-bucket", cfg.PublicStreamBaseURL, cfg.StorageLocalDir)
	default:
		log.Printf("💾 Menginisialisasi Local Storage Provider pada direktori: %s", cfg.StorageLocalDir)
		st, err = storage.NewLocalStorage(cfg.StorageLocalDir, cfg.PublicStreamBaseURL)
	}

	if err != nil {
		log.Fatalf("Gagal inisialisasi media storage: %v", err)
	}

	// Inisialisasi Transcoder Service & Worker Pool
	transcoderSvc := service.NewTranscoderService(cfg, st)
	defer transcoderSvc.Stop()

	// Inisialisasi Router Gin
	router := api.SetupRouter(cfg, transcoderSvc, st)

	serverAddr := fmt.Sprintf(":%s", cfg.Port)
	srv := &http.Server{
		Addr:    serverAddr,
		Handler: router,
	}

	// Jalankan server HTTP di background goroutine
	go func() {
		log.Printf("🚀 Transcoder Service aktif dan mendengarkan di http://localhost%s", serverAddr)
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Fatalf("Server HTTP error: %v", err)
		}
	}()

	// Graceful shutdown listener
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("🛑 Menerima sinyal shutdown, menghentikan server dan worker pool secara anggun...")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Fatalf("Server terpaksa dimatikan: %v", err)
	}

	log.Println("✨ Transcoder Service berhasil dimatikan dengan aman.")
}
