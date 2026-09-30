package api

import (
	"net/http"
	"time"

	"github.com/LiveEuy/transcoder-service/config"
	"github.com/LiveEuy/transcoder-service/internal/api/handler"
	"github.com/LiveEuy/transcoder-service/internal/api/middleware"
	"github.com/LiveEuy/transcoder-service/internal/service"
	"github.com/LiveEuy/transcoder-service/internal/storage"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func SetupRouter(cfg *config.Config, svc *service.TranscoderService, st storage.Storage) *gin.Engine {
	r := gin.Default()

	// Batas alokasi memory form multipart (32 MiB di RAM, selebihnya disk buffer)
	r.MaxMultipartMemory = 32 << 20

	// Konfigurasi CORS
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length", "Content-Type"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// JWKS Manager untuk verifikasi token asimetris RS256
	jwksMgr := middleware.NewJWKSManager(cfg.JWKSetURI)

	jobHandler := handler.NewJobHandler(svc)
	streamHandler := handler.NewStreamHandler(st)

	// Health Check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":  "UP",
			"service": "transcoder-service",
			"time":    time.Now().UTC().Format(time.RFC3339),
		})
	})
	r.GET("/ping", func(c *gin.Context) {
		c.String(http.StatusOK, "pong")
	})

	apiV1 := r.Group("/api/v1/transcoder")
	{
		// 1. Endpoint Streaming Terbuka (Public / Media Player)
		apiV1.GET("/stream/:id/*filepath", streamHandler.ServeStream)

		// 2. Endpoint Manajemen Transkoding (WAJIB ADMIN)
		adminOnly := apiV1.Group("/jobs")
		adminOnly.Use(middleware.AdminAuthRequired(jwksMgr, cfg.JWTIssuer))
		{
			adminOnly.POST("", jobHandler.CreateJob)
			adminOnly.GET("", jobHandler.ListJobs)
			adminOnly.GET("/:id", jobHandler.GetJob)
			adminOnly.DELETE("/:id", jobHandler.CancelJob)
			adminOnly.DELETE("/:id/hard", jobHandler.DeleteJob)
			adminOnly.GET("/:id/sse", jobHandler.JobProgressSSE)
		}
	}

	return r
}
