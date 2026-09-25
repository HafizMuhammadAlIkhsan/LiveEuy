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

// Register godoc
// @Summary Register a new user
// @Description Register a new user with name, email, and password
// @Tags Authentication
// @Accept json
// @Produce json
// @Param request body registerReq true "Register Request"
// @Success 201 {object} AuthResponseData "Registered successfully"
// @Failure 400 {object} BaseResponseData "Bad Request / Validation Error"
// @Failure 409 {object} BaseResponseData "User already exists"
// @Failure 500 {object} BaseResponseData "Internal server error"
// @Router /register [post]
func (h *AuthHandler) Register(c *gin.Context) {
	var req registerReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": err.Error()})
		return
	}
	
	deviceName := c.GetHeader("User-Agent")

	data, err := h.svc.Register(c.Request.Context(), req.Name, req.Email, req.Password, deviceName)

	if err != nil {
		if err == service.ErrUserExists {
			c.JSON(http.StatusConflict, gin.H{"success": false, "error": "user already exists", "message": "please login instead or try another email"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "internal", "message": "There is an error on our side, please try again later"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"success": true, "message": "registered", "refresh_token": data.RefreshToken, "access_token": data.AccessToken, "user": UserResponse{Name: data.Name, Email: data.Email, CreatedAt: data.CreatedAt}})
}

// Login godoc
// @Summary User login
// @Description Authenticate user using email and password
// @Tags Authentication
// @Accept json
// @Produce json
// @Param request body loginReq true "Login Request"
// @Success 200 {object} AuthResponseData "Logged in successfully"
// @Failure 400 {object} BaseResponseData "Bad Request"
// @Failure 401 {object} BaseResponseData "Invalid credentials"
// @Failure 500 {object} BaseResponseData "Internal server error"
// @Router /login [post]
func (h *AuthHandler) Login(c *gin.Context) {
	var req loginReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	deviceName := c.GetHeader("User-Agent")

	data, err := h.svc.Login(c.Request.Context(), req.Email, req.Password, deviceName)
	if err != nil {
		if err == service.ErrInvalidCredentials {
			c.JSON(http.StatusUnauthorized, gin.H{"success": false, "error": "invalid credentials"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "internal"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "logged in", "refresh_token": data.RefreshToken, "access_token": data.AccessToken, "user": UserResponse{Name: data.Name, Email: data.Email, CreatedAt: data.CreatedAt}})
}

// RefreshToken godoc
// @Summary Refresh access token
// @Description Rotate refresh token and generate new access token
// @Tags Authentication
// @Accept json
// @Produce json
// @Param request body refreshTokenReq true "Refresh Token Request"
// @Success 200 {object} RefreshTokenResponseData "Token refreshed successfully"
// @Failure 400 {object} BaseResponseData "Bad Request"
// @Failure 401 {object} BaseResponseData "Invalid or expired token"
// @Router /refresh-token [post]
func (h *AuthHandler) RefreshToken(c *gin.Context) {
	var req refreshTokenReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": err.Error()})
		return
	}

	deviceName := c.GetHeader("User-Agent")
	newAccess, newRefresh, err := h.svc.RefreshToken(c.Request.Context(), req.RefreshToken, deviceName)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "error": "invalid or expired refresh token", "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "access_token": newAccess, "refresh_token": newRefresh})
}

// UpdateName godoc
// @Summary Update user name
// @Description Update the authenticated user's name
// @Tags User
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body updateNameReq true "Update Name Request"
// @Success 200 {object} BaseResponseData "Name updated successfully"
// @Failure 400 {object} BaseResponseData "Bad Request"
// @Failure 401 {object} BaseResponseData "Unauthorized"
// @Failure 500 {object} BaseResponseData "Internal server error"
// @Router /api/me/name [put]
func (h *AuthHandler) UpdateName(c *gin.Context) {
	var req updateNameReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false,"error": err.Error()})
		return
	}
	userID, exists := c.Get("owner_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "error": "unauthorized"})
		return
	}
	if err := h.svc.UpdateName(userID.(string), req.NewName); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "internal"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "name updated"})
}

// UpdatePassword godoc
// @Summary Update user password
// @Description Update the authenticated user's password
// @Tags User
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body updatePasswordReq true "Update Password Request"
// @Success 200 {object} BaseResponseData "Password updated successfully"
// @Failure 400 {object} BaseResponseData "Bad Request"
// @Failure 401 {object} BaseResponseData "Unauthorized"
// @Failure 500 {object} BaseResponseData "Internal server error"
// @Router /api/me/password [put]
func (h *AuthHandler) UpdatePassword(c *gin.Context) {
	var req updatePasswordReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": err.Error()})
		return
	}
	userID, exists := c.Get("owner_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "error": "unauthorized"})
		return
	}
	if err := h.svc.UpdatePassword(userID.(string), req.NewPassword); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "internal"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "password updated"})
}

// Me godoc
// @Summary Get user profile
// @Description Retrieve current authenticated user profile
// @Tags User
// @Produce json
// @Security BearerAuth
// @Success 200 {object} UserProfileResponseData "User Profile"
// @Failure 401 {object} BaseResponseData "Unauthorized"
// @Failure 404 {object} BaseResponseData "User not found"
// @Failure 500 {object} BaseResponseData "Internal server error"
// @Router /api/me [get]
func (h *AuthHandler) Me(c *gin.Context) {
	userID, exists := c.Get("owner_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "unauthorized"})
		return
	}

	u, err := h.svc.GetUserDataByID(userID.(string))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "internal"})
		return
	}

	if u == nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "user not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "user": UserResponse{Name: u.Name, Email: u.Email, CreatedAt: u.CreatedAt}})
}

// HealthCheck godoc
// @Summary Health check
// @Description Service health status
// @Tags System
// @Produce json
// @Security BearerAuth
// @Success 200 {object} BaseResponseData "Healthy"
// @Router /api/health [get]
func (h *AuthHandler) HealthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"success": true, "status": "healthy"})
}

// Ping godoc
// @Summary Ping check
// @Description Ping test endpoint
// @Tags System
// @Produce json
// @Security BearerAuth
// @Success 200 {object} BaseResponseData "Pong"
// @Router /api/ping [get]
func (h *AuthHandler) Ping(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "pong"})
}
