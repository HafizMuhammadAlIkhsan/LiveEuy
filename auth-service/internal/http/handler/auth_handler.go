package handler

import (
	"net/http"

	"github.com/DXR3IN/auth-service/internal/service"
	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	svc *service.AuthService
}

func NewAuthHandler(svc *service.AuthService) *AuthHandler {
	return &AuthHandler{svc: svc}
}

func (h *AuthHandler) Register(c *gin.Context) {
	var req registerReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	data, err := h.svc.Register(req.Name, req.Email, req.Password)

	if err != nil {
		if err == service.ErrUserExists {
			c.JSON(http.StatusConflict, gin.H{"error": "user already exists", "message": "please login instead or try another email"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal", "message": "There is an error on our side, please try again later"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"success": "true", "message": "registered", "token": data.Token, "user": UserResponse{Name: data.Name,Email: data.Email,CreatedAt:  data.CreatedAt}})
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req loginReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	data, err := h.svc.Login(req.Email, req.Password)
	if err != nil {
		if err == service.ErrInvalidCredentials {
			c.JSON(http.StatusUnauthorized, gin.H{"success": "false", "error": "invalid credentials"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"success": "false", "error": "internal"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"success": "true", "message": "registered", "token": data.Token, "user": UserResponse{Name: data.Name, Email: data.Email, CreatedAt:data.CreatedAt}})
}

func (h *AuthHandler) UpdateName(c *gin.Context) {
	var req struct {
		NewName string `json:"new_name" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	userID, exists := c.Get("owner_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"success": "false", "error": "unauthorized"})
		return
	}
	if err := h.svc.UpdateName(userID.(string), req.NewName); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": "false", "error": "internal"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": "true", "message": "name updated"})
}

func (h *AuthHandler) UpdatePassword(c *gin.Context) {
	var req struct {
		NewPassword string `json:"new_password" binding:"required,min=6"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	userID, exists := c.Get("owner_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"success": "false", "error": "unauthorized"})
		return
	}
	if err := h.svc.UpdatePassword(userID.(string), req.NewPassword); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": "false", "error": "internal"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": "true", "message": "password updated"})
}

func (h *AuthHandler) Me(c *gin.Context) {
	userID, exists := c.Get("owner_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"success": "false", "message": "unauthorized"})
	}

	u, err := h.svc.GetUserDataByID(userID.(string))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": "false", "message": "internal"})
		return
	}

	if u == nil {
		c.JSON(http.StatusNotFound, gin.H{"success": "false", "message": "user not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": "true", "user": UserResponse{Name: u.Name, Email: u.Email, CreatedAt: u.CreatedAt}})

}

func (h *AuthHandler) HealthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"status": "healthy"})
}

func (h *AuthHandler) Ping(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "pong"})
}

func (h *AuthHandler) Logout(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Sesi berhasil diakhiri. Sampai jumpa kembali!",
	})
}

func (h *AuthHandler) LogoutAll(c *gin.Context) {
	var req struct {
		IncludeCurrent bool `json:"includeCurrent"`
	}
	_ = c.ShouldBindJSON(&req)
	msg := "Berhasil logout dari semua perangkat. Semua sesi aktif telah dicabut."
	if !req.IncludeCurrent {
		msg = "Berhasil mengeluarkan semua perangkat lain. Sesi ini tetap aktif."
	}
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": msg,
	})
}
