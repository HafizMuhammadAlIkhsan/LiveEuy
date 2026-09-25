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

func (h *OAuthHandler) GoogleLogin(c *gin.Context) {
	state, err := generateStateToken(16)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to generate state token"})
		return
	}

	c.SetCookie("oauth_state", state, 600, "/", "", false, true)

	url := h.svc.GetGoogleAuthURL(state)

	c.Redirect(http.StatusTemporaryRedirect, url)
}

func (h *OAuthHandler) GoogleCallback(c *gin.Context) {
	stateQuery := c.Query("state")
	code := c.Query("code")

	stateCookie, err := c.Cookie("oauth_state")
	if err != nil || stateCookie == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid or expired oauth state session"})
		return
	}

	c.SetCookie("oauth_state", "", -1, "/", "", false, true)

	if stateQuery != stateCookie {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "csrf state mismatch"})
		return
	}

	if code == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "authorization code is required"})
		return
	}

	token, err := h.svc.HandleGoogleCallback(c.Request.Context(), code)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "google login successful",
		"token":   token,
	})
}

