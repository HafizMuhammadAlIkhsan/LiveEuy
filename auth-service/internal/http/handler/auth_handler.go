package handler

import (
	"errors"
	"net/http"
	"time"

	"github.com/DXR3IN/auth-service/internal/domain"
	"github.com/DXR3IN/auth-service/internal/service"
	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	svc    *service.AuthService
	jwtMgr domain.TokenManager
}

func NewAuthHandler(svc *service.AuthService, jwtMgr domain.TokenManager) *AuthHandler {
	return &AuthHandler{svc: svc, jwtMgr: jwtMgr}
}

func sendSuccess(c *gin.Context, httpStatus int, message string, data interface{}) {
	c.JSON(httpStatus, gin.H{
		"success": true,
		"message": message,
		"data":    data,
	})
}

func sendError(c *gin.Context, httpStatus int, message string, errType string, code string, details []ErrorDetail) {
	resp := gin.H{
		"success":   false,
		"message":   message,
		"error":     errType,
		"code":      code,
		"timestamp": time.Now().UTC().Format(time.RFC3339),
	}
	if len(details) > 0 {
		resp["details"] = details
	}
	c.JSON(httpStatus, resp)
}

func setRefreshTokenCookie(c *gin.Context, token string) {
	c.SetSameSite(http.SameSiteStrictMode)
	c.SetCookie("refreshToken", token, 2592000, "/api/v1/auth", "", false, true)
}

func clearRefreshTokenCookie(c *gin.Context) {
	c.SetSameSite(http.SameSiteStrictMode)
	c.SetCookie("refreshToken", "", -1, "/api/v1/auth", "", false, true)
}

// Register godoc
// @Summary Register a new user
// @Description Register a new user with name, email, password, and tier
// @Tags Authentication
// @Accept json
// @Produce json
// @Param request body registerReq true "Register Request"
// @Success 201 {object} APIResponse{data=AuthContractData} "Pendaftaran akun berhasil"
// @Failure 400 {object} APIErrorResponse "Bad Request / Validation Error"
// @Failure 409 {object} APIErrorResponse "Email sudah terdaftar di sistem"
// @Failure 500 {object} APIErrorResponse "Internal server error"
// @Router /api/v1/auth/register [post]
func (h *AuthHandler) Register(c *gin.Context) {
	var req registerReq
	if err := c.ShouldBindJSON(&req); err != nil {
		sendError(c, http.StatusBadRequest, "Kolom input tidak memenuhi syarat validasi.", "BAD_REQUEST", "AUTH_400_01", []ErrorDetail{
			{Field: "validation", Message: err.Error()},
		})
		return
	}

	deviceName := c.GetHeader("User-Agent")
	res, err := h.svc.Register(c.Request.Context(), req.Name, req.Email, req.Password, req.Tier, deviceName)
	if err != nil {
		if errors.Is(err, service.ErrUserExists) {
			sendError(c, http.StatusConflict, "Email sudah terdaftar di sistem.", "CONFLICT", "AUTH_409_01", nil)
			return
		}
		sendError(c, http.StatusInternalServerError, "Terjadi kendala internal pada server autentikasi.", "INTERNAL_ERROR", "AUTH_500_01", nil)
		return
	}

	setRefreshTokenCookie(c, res.RefreshToken)

	sendSuccess(c, http.StatusCreated, "Pendaftaran akun berhasil. Selamat datang di LiveEuy!", AuthContractData{
		AccessToken:  res.AccessToken,
		TokenType:    "Bearer",
		ExpiresIn:    900,
		RefreshToken: res.RefreshToken,
		User:         ToUserContractResponse(res.User),
	})
}

// Login godoc
// @Summary User login
// @Description Authenticate user using email and password
// @Tags Authentication
// @Accept json
// @Produce json
// @Param request body loginReq true "Login Request"
// @Success 200 {object} APIResponse{data=AuthContractData} "Berhasil masuk ke LiveEuy"
// @Failure 400 {object} APIErrorResponse "Bad Request"
// @Failure 401 {object} APIErrorResponse "Email atau kata sandi tidak cocok"
// @Failure 500 {object} APIErrorResponse "Internal server error"
// @Router /api/v1/auth/login [post]
func (h *AuthHandler) Login(c *gin.Context) {
	var req loginReq
	if err := c.ShouldBindJSON(&req); err != nil {
		sendError(c, http.StatusBadRequest, "Format request login tidak valid.", "BAD_REQUEST", "AUTH_400_01", nil)
		return
	}

	deviceName := c.GetHeader("User-Agent")
	res, err := h.svc.Login(c.Request.Context(), req.Email, req.Password, deviceName)
	if err != nil {
		if errors.Is(err, service.ErrInvalidCredentials) {
			sendError(c, http.StatusUnauthorized, "Email atau kata sandi tidak cocok.", "UNAUTHORIZED", "AUTH_401_01", nil)
			return
		}
		sendError(c, http.StatusInternalServerError, "Terjadi kendala internal pada server autentikasi.", "INTERNAL_ERROR", "AUTH_500_01", nil)
		return
	}

	setRefreshTokenCookie(c, res.RefreshToken)

	sendSuccess(c, http.StatusOK, "Berhasil masuk ke LiveEuy", AuthContractData{
		AccessToken:  res.AccessToken,
		TokenType:    "Bearer",
		ExpiresIn:    900,
		RefreshToken: res.RefreshToken,
		User:         ToUserContractResponse(res.User),
	})
}

// DemoLogin godoc
// @Summary Demo persona login
// @Description Fast login for development, testing, and UI persona testing (hafiz / budi)
// @Tags Authentication
// @Accept json
// @Produce json
// @Param request body demoLoginReq true "Demo Login Request"
// @Success 200 {object} APIResponse{data=AuthContractData} "Berhasil masuk via Demo Account"
// @Failure 400 {object} APIErrorResponse "Bad Request"
// @Failure 500 {object} APIErrorResponse "Internal server error"
// @Router /api/v1/auth/demo-login [post]
func (h *AuthHandler) DemoLogin(c *gin.Context) {
	var req demoLoginReq
	if err := c.ShouldBindJSON(&req); err != nil {
		sendError(c, http.StatusBadRequest, "Kolom persona wajib disertakan (contoh: 'hafiz' atau 'budi').", "BAD_REQUEST", "AUTH_400_01", nil)
		return
	}

	deviceName := c.GetHeader("User-Agent")
	res, err := h.svc.DemoLogin(c.Request.Context(), req.Persona, deviceName)
	if err != nil {
		sendError(c, http.StatusBadRequest, err.Error(), "BAD_REQUEST", "AUTH_400_01", nil)
		return
	}

	setRefreshTokenCookie(c, res.RefreshToken)

	sendSuccess(c, http.StatusOK, "Berhasil masuk ke LiveEuy (Demo Account)", AuthContractData{
		AccessToken:  res.AccessToken,
		TokenType:    "Bearer",
		ExpiresIn:    900,
		RefreshToken: res.RefreshToken,
		User:         ToUserContractResponse(res.User),
	})
}

// RefreshToken godoc
// @Summary Refresh access token
// @Description Rotate refresh token and generate new access token (from Cookie or JSON body)
// @Tags Authentication
// @Accept json
// @Produce json
// @Param request body refreshTokenReq false "Refresh Token Request (Optional if using Cookie)"
// @Success 200 {object} APIResponse{data=RefreshContractData} "Token akses berhasil diperbarui"
// @Failure 401 {object} APIErrorResponse "Refresh token tidak valid atau telah dicabut"
// @Router /api/v1/auth/refresh [post]
func (h *AuthHandler) RefreshToken(c *gin.Context) {
	var tokenStr string
	if cookie, err := c.Cookie("refreshToken"); err == nil && cookie != "" {
		tokenStr = cookie
	}

	if tokenStr == "" {
		var req refreshTokenReq
		if err := c.ShouldBindJSON(&req); err == nil {
			tokenStr = req.GetToken()
		}
	}

	if tokenStr == "" {
		sendError(c, http.StatusUnauthorized, "Refresh token tidak ditemukan pada Cookie maupun Body request.", "UNAUTHORIZED", "AUTH_401_03", nil)
		return
	}

	deviceName := c.GetHeader("User-Agent")
	_, newAccess, newRefresh, err := h.svc.RefreshToken(c.Request.Context(), tokenStr, deviceName)
	if err != nil {
		clearRefreshTokenCookie(c)
		sendError(c, http.StatusUnauthorized, "Refresh token tidak valid atau telah dicabut.", "UNAUTHORIZED", "AUTH_401_03", nil)
		return
	}

	setRefreshTokenCookie(c, newRefresh)

	sendSuccess(c, http.StatusOK, "Token akses berhasil diperbarui", RefreshContractData{
		AccessToken:  newAccess,
		TokenType:    "Bearer",
		ExpiresIn:    900,
		RefreshToken: newRefresh,
	})
}

// Logout godoc
// @Summary User logout (single device)
// @Description Invalidate the specified refresh token session and clear auth cookie
// @Tags Authentication
// @Accept json
// @Produce json
// @Param request body logoutReq false "Logout Request (Optional if using Cookie)"
// @Success 200 {object} APIResponse "Sesi berhasil diakhiri"
// @Router /api/v1/auth/logout [post]
func (h *AuthHandler) Logout(c *gin.Context) {
	var tokenStr string
	if cookie, err := c.Cookie("refreshToken"); err == nil && cookie != "" {
		tokenStr = cookie
	}

	var req logoutReq
	if err := c.ShouldBindJSON(&req); err == nil && req.GetToken() != "" {
		tokenStr = req.GetToken()
	}

	clearRefreshTokenCookie(c)

	if tokenStr != "" {
		_ = h.svc.Logout(c.Request.Context(), tokenStr)
	}

	sendSuccess(c, http.StatusOK, "Sesi berhasil diakhiri. Sampai jumpa kembali!", nil)
}

// LogoutAll godoc
// @Summary Logout all devices
// @Description Invalidate all active refresh tokens for the authenticated user
// @Tags Authentication
// @Produce json
// @Security BearerAuth
// @Success 200 {object} APIResponse "Sesi di seluruh perangkat berhasil diakhiri"
// @Failure 401 {object} APIErrorResponse "Unauthorized"
// @Router /api/v1/auth/logout-all [post]
func (h *AuthHandler) LogoutAll(c *gin.Context) {
	userID, exists := c.Get("owner_id")
	if !exists {
		sendError(c, http.StatusUnauthorized, "Access token tidak valid atau telah kedaluwarsa.", "UNAUTHORIZED", "AUTH_401_02", nil)
		return
	}

	clearRefreshTokenCookie(c)
	_ = h.svc.LogoutAll(c.Request.Context(), userID.(string))

	sendSuccess(c, http.StatusOK, "Sesi di seluruh perangkat berhasil diakhiri.", nil)
}

// Me godoc
// @Summary Get user profile
// @Description Retrieve current authenticated user profile
// @Tags Authentication
// @Produce json
// @Security BearerAuth
// @Success 200 {object} APIResponse{data=UserContractResponse} "Profil berhasil dimuat"
// @Failure 401 {object} APIErrorResponse "Unauthorized"
// @Failure 404 {object} APIErrorResponse "User not found"
// @Router /api/v1/auth/me [get]
func (h *AuthHandler) Me(c *gin.Context) {
	userID, exists := c.Get("owner_id")
	if !exists {
		sendError(c, http.StatusUnauthorized, "Access token tidak valid atau telah kedaluwarsa.", "UNAUTHORIZED", "AUTH_401_02", nil)
		return
	}

	u, err := h.svc.GetUserDataByID(userID.(string))
	if err != nil || u == nil {
		sendError(c, http.StatusNotFound, "Pengguna tidak ditemukan.", "NOT_FOUND", "AUTH_404_01", nil)
		return
	}

	sendSuccess(c, http.StatusOK, "Profil berhasil dimuat", ToUserContractResponse(u))
}

// UpdateProfile godoc
// @Summary Update user profile
// @Description Update authenticated user's name and avatar
// @Tags Authentication
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body profileUpdateReq true "Profile Update Request"
// @Success 200 {object} APIResponse{data=UserContractResponse} "Profil berhasil diperbarui"
// @Failure 400 {object} APIErrorResponse "Bad Request"
// @Failure 401 {object} APIErrorResponse "Unauthorized"
// @Router /api/v1/auth/profile [put]
func (h *AuthHandler) UpdateProfile(c *gin.Context) {
	var req profileUpdateReq
	if err := c.ShouldBindJSON(&req); err != nil {
		sendError(c, http.StatusBadRequest, "Format payload tidak valid.", "BAD_REQUEST", "AUTH_400_01", nil)
		return
	}

	userID, exists := c.Get("owner_id")
	if !exists {
		sendError(c, http.StatusUnauthorized, "Access token tidak valid.", "UNAUTHORIZED", "AUTH_401_02", nil)
		return
	}

	updatedUser, err := h.svc.UpdateProfile(userID.(string), req.Name, req.Avatar)
	if err != nil {
		sendError(c, http.StatusInternalServerError, "Gagal memperbarui profil.", "INTERNAL_ERROR", "AUTH_500_01", nil)
		return
	}

	sendSuccess(c, http.StatusOK, "Profil berhasil diperbarui", ToUserContractResponse(updatedUser))
}

// ChangePassword godoc
// @Summary Change user password
// @Description Change password with validation against current password
// @Tags Authentication
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body changePasswordReq true "Change Password Request"
// @Success 200 {object} APIResponse "Kata sandi berhasil diubah"
// @Failure 400 {object} APIErrorResponse "Bad Request"
// @Failure 401 {object} APIErrorResponse "Kata sandi saat ini salah"
// @Router /api/v1/auth/change-password [put]
func (h *AuthHandler) ChangePassword(c *gin.Context) {
	var req changePasswordReq
	if err := c.ShouldBindJSON(&req); err != nil {
		sendError(c, http.StatusBadRequest, "Kolom currentPassword dan newPassword wajib diisi (min 6 karakter).", "BAD_REQUEST", "AUTH_400_01", nil)
		return
	}

	userID, exists := c.Get("owner_id")
	if !exists {
		sendError(c, http.StatusUnauthorized, "Access token tidak valid.", "UNAUTHORIZED", "AUTH_401_02", nil)
		return
	}

	if err := h.svc.ChangePassword(userID.(string), req.CurrentPassword, req.NewPassword); err != nil {
		if errors.Is(err, service.ErrInvalidOldPassword) {
			sendError(c, http.StatusUnauthorized, "Kata sandi saat ini tidak cocok.", "UNAUTHORIZED", "AUTH_401_01", []ErrorDetail{
				{Field: "currentPassword", Message: "Kata sandi salah"},
			})
			return
		}
		sendError(c, http.StatusInternalServerError, "Gagal mengubah kata sandi.", "INTERNAL_ERROR", "AUTH_500_01", nil)
		return
	}

	sendSuccess(c, http.StatusOK, "Kata sandi berhasil diubah. Harap gunakan kata sandi baru untuk login berikutnya.", nil)
}

// ForgotPassword godoc
// @Summary Forgot password
// @Description Request password reset email
// @Tags Authentication
// @Accept json
// @Produce json
// @Param request body forgotPasswordReq true "Forgot Password Request"
// @Success 200 {object} APIResponse "Email pemulihan terkirim"
// @Router /api/v1/auth/forgot-password [post]
func (h *AuthHandler) ForgotPassword(c *gin.Context) {
	var req forgotPasswordReq
	if err := c.ShouldBindJSON(&req); err != nil {
		sendError(c, http.StatusBadRequest, "Format email tidak valid.", "BAD_REQUEST", "AUTH_400_01", nil)
		return
	}

	_ = h.svc.ForgotPassword(c.Request.Context(), req.Email)

	sendSuccess(c, http.StatusOK, "Jika email terdaftar, tautan pengaturan ulang kata sandi telah dikirimkan ke kotak masuk Anda.", nil)
}

// ResetPassword godoc
// @Summary Reset password
// @Description Reset password using received token
// @Tags Authentication
// @Accept json
// @Produce json
// @Param request body resetPasswordReq true "Reset Password Request"
// @Success 200 {object} APIResponse "Kata sandi berhasil direset"
// @Router /api/v1/auth/reset-password [post]
func (h *AuthHandler) ResetPassword(c *gin.Context) {
	var req resetPasswordReq
	if err := c.ShouldBindJSON(&req); err != nil {
		sendError(c, http.StatusBadRequest, "Format payload reset password tidak valid.", "BAD_REQUEST", "AUTH_400_01", nil)
		return
	}

	if err := h.svc.ResetPassword(c.Request.Context(), req.Token, req.NewPassword); err != nil {
		sendError(c, http.StatusBadRequest, "Token reset password tidak valid atau telah kedaluwarsa.", "BAD_REQUEST", "AUTH_400_01", nil)
		return
	}

	sendSuccess(c, http.StatusOK, "Kata sandi Anda telah berhasil direset. Silakan login kembali.", nil)
}

// UpdateName godoc (Legacy support)
func (h *AuthHandler) UpdateName(c *gin.Context) {
	var req updateNameReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": err.Error()})
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

// UpdatePassword godoc (Legacy support)
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

// HealthCheck godoc
// @Summary Health check
// @Description Service health status
// @Tags System
// @Produce json
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
// @Success 200 {object} BaseResponseData "Pong"
// @Router /api/ping [get]
func (h *AuthHandler) Ping(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "pong"})
}

// JWKS godoc
// @Summary JSON Web Key Set (Public Keys)
// @Description Exposes RSA public keys in RFC 7517 format for downstream microservices
// @Tags System
// @Produce json
// @Success 200 {object} map[string]interface{} "JSON Web Key Set"
// @Router /.well-known/jwks.json [get]
func (h *AuthHandler) JWKS(c *gin.Context) {
	if h.jwtMgr == nil {
		c.JSON(http.StatusOK, gin.H{"keys": []interface{}{}})
		return
	}
	c.Header("Cache-Control", "public, max-age=3600")
	c.JSON(http.StatusOK, h.jwtMgr.GetJWKS())
}

// PublicKeyPEM godoc
// @Summary RSA Public Key in PEM format
// @Description Exposes RSA public key in standard PEM format
// @Tags System
// @Produce text/plain
// @Success 200 {string} string "RSA Public Key PEM"
// @Router /api/v1/auth/public-key.pem [get]
func (h *AuthHandler) PublicKeyPEM(c *gin.Context) {
	if h.jwtMgr == nil {
		c.String(http.StatusNotFound, "")
		return
	}
	c.Header("Cache-Control", "public, max-age=3600")
	c.Header("Content-Type", "application/x-pem-file; charset=utf-8")
	c.String(http.StatusOK, h.jwtMgr.GetPublicKeyPEM())
}
