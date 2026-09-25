package http

import (
	_ "github.com/DXR3IN/auth-service/docs"
	"github.com/DXR3IN/auth-service/internal/config"
	"github.com/DXR3IN/auth-service/internal/domain"
	h "github.com/DXR3IN/auth-service/internal/http/handler"
	"github.com/DXR3IN/auth-service/internal/http/middleware"
	"github.com/DXR3IN/auth-service/internal/repository"
	"github.com/DXR3IN/auth-service/internal/service"
	ginpkg "github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

func NewRouter(cfg *config.Config, userRepo repository.UserRepository, jwtMgr domain.TokenManager, sessionRepo domain.SessionRepository, oauthProvider domain.OAuthProvider) *ginpkg.Engine {
	r := ginpkg.Default()

	// Swagger documentation route
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	authSvc := service.NewAuthService(userRepo, jwtMgr, sessionRepo)
	oauthSvc := service.NewOAuthService(oauthProvider, userRepo, jwtMgr, sessionRepo)
	authHandler := h.NewAuthHandler(authSvc)
	oauthHandler := h.NewOAuthHandler(oauthSvc)

	r.POST("/register", authHandler.Register)
	r.POST("/login", authHandler.Login)
	r.POST("/refresh-token", authHandler.RefreshToken)

	//
	api := r.Group("/api/v1/auth")
	{
		api.GET("/google/login", oauthHandler.GoogleLogin)
		api.GET("/google/callback", oauthHandler.GoogleCallback)
	}

	auth := r.Group("/api")
	auth.Use(middleware.AuthRequired(jwtMgr))
	auth.GET("/me", authHandler.Me)
	auth.GET("/ping", authHandler.Ping)
	auth.GET("/health", authHandler.HealthCheck)
	auth.PUT("/me/password", authHandler.UpdatePassword)
	auth.PUT("/me/name", authHandler.UpdateName)

	return r
}

