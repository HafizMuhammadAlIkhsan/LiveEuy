package handler

import (
	"crypto/rand"
	"encoding/hex"
	"net/http"

	"github.com/DXR3IN/auth-service/internal/service"
	"github.com/gin-gonic/gin"
)

func generateStateToken(length int) (string, error) {
	bytes := make([]byte, length)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}

type OAuthHandler struct {
	svc *service.OAuthService
}

func NewOAuthHandler(svc *service.OAuthService) *OAuthHandler {
	return &OAuthHandler{svc: svc}
}

// GoogleLogin godoc
// @Summary Initiate Google OAuth login
// @Description Redirects the user to Google OAuth consent page
// @Tags OAuth
// @Success 307 {string} string "Redirect to Google OAuth consent URL"
// @Failure 500 {object} BaseResponseData "Internal server error"
// @Router /api/v1/auth/google/login [get]
func (h *OAuthHandler) GoogleLogin(c *gin.Context) {
	state, err := generateStateToken(16)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "failed to generate state token"})
		return
	}

	c.SetCookie("oauth_state", state, 600, "/", "", false, true)

	url := h.svc.GetGoogleAuthURL(state)

	c.Redirect(http.StatusTemporaryRedirect, url)
}

// GoogleCallback godoc
// @Summary Google OAuth callback
// @Description Handles OAuth callback from Google, authenticates the user and returns access and refresh tokens
// @Tags OAuth
// @Produce json
// @Param state query string true "OAuth State parameter"
// @Param code query string true "OAuth Authorization Code"
// @Success 200 {object} RefreshTokenResponseData "Google login successful"
// @Failure 400 {object} BaseResponseData "Missing authorization code"
// @Failure 401 {object} BaseResponseData "CSRF state mismatch or invalid session"
// @Failure 500 {object} BaseResponseData "Internal server error"
// @Router /api/v1/auth/google/callback [get]
func (h *OAuthHandler) GoogleCallback(c *gin.Context) {
	stateQuery := c.Query("state")
	code := c.Query("code")

	stateCookie, err := c.Cookie("oauth_state")
	if err != nil || stateCookie == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "error": "invalid or expired oauth state session"})
		return
	}

	c.SetCookie("oauth_state", "", -1, "/", "", false, true)

	if stateQuery != stateCookie {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "error": "csrf state mismatch"})
		return
	}

	if code == "" {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "authorization code is required"})
		return
	}

	refreshToken, accessToken, err := h.svc.HandleGoogleCallback(c.Request.Context(), code)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success":       true,
		"message":       "google login successful",
		"access_token":  accessToken,
		"refresh_token": refreshToken,
	})
}

