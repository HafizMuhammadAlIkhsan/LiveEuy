package middleware

import (
	"crypto/rsa"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"math/big"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

type JWTClaims struct {
	jwt.RegisteredClaims
	Email string `json:"email,omitempty"`
	Name  string `json:"name,omitempty"`
	Role  string `json:"role,omitempty"`
	Tier  string `json:"tier,omitempty"`
}

type JWKKey struct {
	Kty string `json:"kty"`
	Use string `json:"use"`
	Kid string `json:"kid"`
	Alg string `json:"alg"`
	N   string `json:"n"`
	E   string `json:"e"`
}

type JWKSResponse struct {
	Keys []JWKKey `json:"keys"`
}

type JWKSManager struct {
	jwksURI     string
	mu          sync.RWMutex
	cachedKeys  map[string]*rsa.PublicKey
	lastFetched time.Time
	cacheTTL    time.Duration
	httpClient  *http.Client
}

func NewJWKSManager(jwksURI string) *JWKSManager {
	return &JWKSManager{
		jwksURI:    jwksURI,
		cachedKeys: make(map[string]*rsa.PublicKey),
		cacheTTL:   10 * time.Minute,
		httpClient: &http.Client{Timeout: 5 * time.Second},
	}
}

func (m *JWKSManager) GetPublicKey(kid string) (*rsa.PublicKey, error) {
	m.mu.RLock()
	key, exists := m.cachedKeys[kid]
	recent := time.Since(m.lastFetched) < m.cacheTTL
	m.mu.RUnlock()

	if exists && recent {
		return key, nil
	}

	if err := m.refreshKeys(); err != nil {
		if exists {
			return key, nil // Fallback to stale key if network fails
		}
		return nil, err
	}

	m.mu.RLock()
	defer m.mu.RUnlock()
	if key, found := m.cachedKeys[kid]; found {
		return key, nil
	}

	// Jika kid tidak ditentukan, kembalikan key pertama yang tersedia
	if kid == "" {
		for _, k := range m.cachedKeys {
			return k, nil
		}
	}

	return nil, fmt.Errorf("public key untuk kid '%s' tidak ditemukan dalam JWKS", kid)
}

func (m *JWKSManager) refreshKeys() error {
	m.mu.Lock()
	defer m.mu.Unlock()

	resp, err := m.httpClient.Get(m.jwksURI)
	if err != nil {
		return fmt.Errorf("gagal mengambil JWKS dari %s: %w", m.jwksURI, err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("JWKS endpoint merespons dengan status: %d", resp.StatusCode)
	}

	var jwks JWKSResponse
	if err := json.NewDecoder(resp.Body).Decode(&jwks); err != nil {
		return fmt.Errorf("gagal decode respon JWKS: %w", err)
	}

	newKeys := make(map[string]*rsa.PublicKey)
	for _, k := range jwks.Keys {
		if k.Kty != "RSA" {
			continue
		}
		pubKey, err := parseRSAPublicKeyFromJWK(k)
		if err != nil {
			continue
		}
		newKeys[k.Kid] = pubKey
	}

	m.cachedKeys = newKeys
	m.lastFetched = time.Now()
	return nil
}

func parseRSAPublicKeyFromJWK(key JWKKey) (*rsa.PublicKey, error) {
	nBytes, err := base64.RawURLEncoding.DecodeString(key.N)
	if err != nil {
		return nil, fmt.Errorf("gagal decode modulus 'n': %w", err)
	}

	eBytes, err := base64.RawURLEncoding.DecodeString(key.E)
	if err != nil {
		return nil, fmt.Errorf("gagal decode exponent 'e': %w", err)
	}

	var eInt int
	for _, b := range eBytes {
		eInt = (eInt << 8) | int(b)
	}

	return &rsa.PublicKey{
		N: new(big.Int).SetBytes(nBytes),
		E: eInt,
	}, nil
}

// AdminAuthRequired adalah middleware yang menegakkan hak akses ADMIN secara mutlak.
func AdminAuthRequired(jwksMgr *JWKSManager, expectedIssuer string) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": "Autentikasi gagal: Token akses Bearer wajib disertakan",
				"error":   "UNAUTHORIZED",
				"code":    "TRANSCODER_401_MISSING_TOKEN",
			})
			return
		}

		tokenStr := strings.TrimPrefix(authHeader, "Bearer ")

		// Parse token dengan key resolver JWKS
		claims := &JWTClaims{}
		token, err := jwt.ParseWithClaims(tokenStr, claims, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodRSA); !ok {
				return nil, fmt.Errorf("metode signing tidak valid: %v (diharapkan RS256)", token.Header["alg"])
			}

			kid, _ := token.Header["kid"].(string)
			return jwksMgr.GetPublicKey(kid)
		})

		if err != nil || !token.Valid {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": fmt.Sprintf("Autentikasi gagal: Token tidak valid (%v)", err),
				"error":   "UNAUTHORIZED",
				"code":    "TRANSCODER_401_INVALID_TOKEN",
			})
			return
		}

		if expectedIssuer != "" && claims.Issuer != "" && claims.Issuer != expectedIssuer {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": "Autentikasi gagal: Issuer token tidak sesuai",
				"error":   "UNAUTHORIZED",
				"code":    "TRANSCODER_401_INVALID_ISSUER",
			})
			return
		}

		// PENEGAKAN HAK AKSES ADMIN
		role := strings.ToLower(strings.TrimSpace(claims.Role))
		if role != "admin" {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
				"success": false,
				"message": "Akses ditolak: Hanya administrator yang dapat melakukan operasi transkoding",
				"error":   "FORBIDDEN",
				"code":    "TRANSCODER_403_ADMIN_ONLY",
			})
			return
		}

		// Set data sesi pengguna di Context Gin
		c.Set("claims", claims)
		c.Set("user_id", claims.Subject)
		c.Set("user_email", claims.Email)
		c.Set("user_role", claims.Role)

		c.Next()
	}
}
