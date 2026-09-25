package http

import (
	"github.com/DXR3IN/auth-service/internal/config"
	h "github.com/DXR3IN/auth-service/internal/http/handler"
	"github.com/DXR3IN/auth-service/internal/http/middleware"
	"github.com/DXR3IN/auth-service/internal/repository"
	"github.com/DXR3IN/auth-service/internal/service"
	"github.com/DXR3IN/auth-service/internal/utils"
	ginpkg "github.com/gin-gonic/gin"
)

func NewRouter(cfg *config.Config, userRepo repository.UserRepository) *ginpkg.Engine {
	r := ginpkg.Default()

	jwtMgr := utils.NewJWTManagerFromEnv()
	authSvc := service.NewAuthService(userRepo, jwtMgr)
	oauthSvc := service.NewOAuthService(cfg ,userRepo, jwtMgr)
	authHandler := h.NewAuthHandler(authSvc)
	oauthHandler := h.NewOAuthHandler(oauthSvc)

	r.POST("/register", authHandler.Register)
	r.POST("/login", authHandler.Login)

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
