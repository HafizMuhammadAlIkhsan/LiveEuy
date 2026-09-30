package middleware

import (
	"crypto/rand"
	"crypto/rsa"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/stretchr/testify/assert"
)

func generateTestRSAKey(t *testing.T) (*rsa.PrivateKey, *rsa.PublicKey) {
	privKey, err := rsa.GenerateKey(rand.Reader, 2048)
	assert.NoError(t, err)
	return privKey, &privKey.PublicKey
}

func createTestToken(t *testing.T, privKey *rsa.PrivateKey, kid, role, email, issuer string, expired bool) string {
	now := time.Now()
	exp := now.Add(1 * time.Hour)
	if expired {
		exp = now.Add(-1 * time.Hour)
	}

	claims := &JWTClaims{
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   "user-test-123",
			Issuer:    issuer,
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(exp),
		},
		Email: email,
		Role:  role,
	}

	token := jwt.NewWithClaims(jwt.SigningMethodRS256, claims)
	token.Header["kid"] = kid

	signed, err := token.SignedString(privKey)
	assert.NoError(t, err)
	return signed
}

func setupTestRouter(jwksMgr *JWKSManager, expectedIssuer string) *gin.Engine {
	gin.SetMode(gin.TestMode)
	r := gin.New()
	r.Use(AdminAuthRequired(jwksMgr, expectedIssuer))
	r.GET("/admin-only", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok", "user": c.GetString("user_email")})
	})
	return r
}

func TestAdminAuthRequired_NoToken(t *testing.T) {
	jwksMgr := &JWKSManager{cachedKeys: make(map[string]*rsa.PublicKey)}
	r := setupTestRouter(jwksMgr, "liveeuy-auth-service")

	req, _ := http.NewRequest(http.MethodGet, "/admin-only", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusUnauthorized, w.Code)
	assert.Contains(t, w.Body.String(), "TRANSCODER_401_MISSING_TOKEN")
}

func TestAdminAuthRequired_ForbiddenForUserRole(t *testing.T) {
	privKey, pubKey := generateTestRSAKey(t)
	kid := "test-key-1"

	jwksMgr := &JWKSManager{
		cachedKeys:  map[string]*rsa.PublicKey{kid: pubKey},
		lastFetched: time.Now(),
		cacheTTL:    10 * time.Minute,
	}
	r := setupTestRouter(jwksMgr, "liveeuy-auth-service")

	// Token dengan role 'user'
	token := createTestToken(t, privKey, kid, "user", "budi@liveeuy.id", "liveeuy-auth-service", false)

	req, _ := http.NewRequest(http.MethodGet, "/admin-only", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusForbidden, w.Code)
	assert.Contains(t, w.Body.String(), "TRANSCODER_403_ADMIN_ONLY")
	assert.Contains(t, w.Body.String(), "Akses ditolak: Hanya administrator")
}

func TestAdminAuthRequired_SuccessForAdminRole(t *testing.T) {
	privKey, pubKey := generateTestRSAKey(t)
	kid := "test-key-1"

	jwksMgr := &JWKSManager{
		cachedKeys:  map[string]*rsa.PublicKey{kid: pubKey},
		lastFetched: time.Now(),
		cacheTTL:    10 * time.Minute,
	}
	r := setupTestRouter(jwksMgr, "liveeuy-auth-service")

	// Token dengan role 'admin'
	token := createTestToken(t, privKey, kid, "admin", "hafiz@liveeuy.id", "liveeuy-auth-service", false)

	req, _ := http.NewRequest(http.MethodGet, "/admin-only", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	assert.Contains(t, w.Body.String(), "hafiz@liveeuy.id")
}

func TestAdminAuthRequired_ExpiredToken(t *testing.T) {
	privKey, pubKey := generateTestRSAKey(t)
	kid := "test-key-1"

	jwksMgr := &JWKSManager{
		cachedKeys:  map[string]*rsa.PublicKey{kid: pubKey},
		lastFetched: time.Now(),
		cacheTTL:    10 * time.Minute,
	}
	r := setupTestRouter(jwksMgr, "liveeuy-auth-service")

	// Token expired
	token := createTestToken(t, privKey, kid, "admin", "hafiz@liveeuy.id", "liveeuy-auth-service", true)

	req, _ := http.NewRequest(http.MethodGet, "/admin-only", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusUnauthorized, w.Code)
	assert.Contains(t, w.Body.String(), "TRANSCODER_401_INVALID_TOKEN")
}
