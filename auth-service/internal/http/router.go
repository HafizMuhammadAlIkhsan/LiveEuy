package http

import (
	_ "github.com/DXR3IN/auth-service/docs"
	"github.com/DXR3IN/auth-service/internal/config"
	"github.com/DXR3IN/auth-service/internal/domain"
	h "github.com/DXR3IN/auth-service/internal/http/handler"
	"github.com/DXR3IN/auth-service/internal/http/middleware"
	"github.com/DXR3IN/auth-service/internal/repository"
	"github.com/DXR3IN/auth-service/internal/service"
	"github.com/DXR3IN/auth-service/internal/storage"
	ginpkg "github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

func NewRouter(
	cfg *config.Config,
	userRepo repository.UserRepository,
	jwtMgr domain.TokenManager,
	sessionRepo domain.SessionRepository,
	oauthProvider domain.OAuthProvider,
	r2Svc storage.R2StorageService,
) *ginpkg.Engine {
	r := ginpkg.Default()

	// Swagger documentation route
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	// Standard OIDC / OAuth2 JWKS Discovery endpoint at root
	r.GET("/.well-known/jwks.json", func(c *ginpkg.Context) {
		h.NewAuthHandler(nil, jwtMgr).JWKS(c)
	})

	authSvc := service.NewAuthService(userRepo, jwtMgr, sessionRepo)
	oauthSvc := service.NewOAuthService(oauthProvider, userRepo, jwtMgr, sessionRepo)
	authHandler := h.NewAuthHandler(authSvc, jwtMgr)
	oauthHandler := h.NewOAuthHandler(oauthSvc)
	r2Handler := h.NewR2UploadHandler(r2Svc)

	// API v1 Auth Group (Standard Contract)
	authV1 := r.Group("/api/v1/auth")
	{
		// Public Endpoints & JWKS Discovery
		authV1.GET("/jwks.json", authHandler.JWKS)
		authV1.GET("/public-key.pem", authHandler.PublicKeyPEM)
		authV1.POST("/register", authHandler.Register)
		authV1.POST("/login", authHandler.Login)
		authV1.POST("/demo-login", authHandler.DemoLogin)
		authV1.POST("/refresh", authHandler.RefreshToken)
		authV1.POST("/logout", authHandler.Logout)
		authV1.POST("/forgot-password", authHandler.ForgotPassword)
		authV1.POST("/reset-password", authHandler.ResetPassword)
		authV1.GET("/google/login", oauthHandler.GoogleLogin)
		authV1.GET("/google/callback", oauthHandler.GoogleCallback)

		// Protected Endpoints
		protectedAuth := authV1.Group("")
		protectedAuth.Use(middleware.AuthRequired(jwtMgr))
		{
			protectedAuth.GET("/me", authHandler.Me)
			protectedAuth.PUT("/profile", authHandler.UpdateProfile)
			protectedAuth.PUT("/change-password", authHandler.ChangePassword)
			protectedAuth.POST("/logout-all", authHandler.LogoutAll)

			// ── Cloudflare R2 — Avatar & File Storage ──────────────────────
			protectedAuth.POST("/me/avatar", r2Handler.UploadAvatar)
			protectedAuth.DELETE("/me/avatar", r2Handler.DeleteAvatar)
			protectedAuth.GET("/storage/presign", r2Handler.GetPresignedDownloadURL)
		}
	}

	// Legacy routes for backward compatibility
	r.POST("/register", authHandler.Register)
	r.POST("/login", authHandler.Login)
	r.POST("/refresh-token", authHandler.RefreshToken)
	r.POST("/logout", authHandler.Logout)

	legacyAPI := r.Group("/api")
	legacyAPI.Use(middleware.AuthRequired(jwtMgr))
	{
		legacyAPI.GET("/me", authHandler.Me)
		legacyAPI.PUT("/me/name", authHandler.UpdateName)
		legacyAPI.PUT("/me/password", authHandler.UpdatePassword)
		legacyAPI.POST("/logout", authHandler.Logout)
		legacyAPI.POST("/logout-all", authHandler.LogoutAll)
		legacyAPI.GET("/ping", authHandler.Ping)
		legacyAPI.GET("/health", authHandler.HealthCheck)
	}

	return r
}
