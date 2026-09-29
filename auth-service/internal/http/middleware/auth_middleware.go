package middleware

import (
	"net/http"
	"strings"
	"time"

	"github.com/DXR3IN/auth-service/internal/domain"
	"github.com/gin-gonic/gin"
)

func AuthRequired(jwtMgr domain.TokenManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		auth := c.GetHeader("Authorization")
		if auth == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"success":   false,
				"message":   "Access token tidak valid atau telah kedaluwarsa",
				"error":     "UNAUTHORIZED",
				"code":      "AUTH_401_02",
				"timestamp": time.Now().UTC().Format(time.RFC3339),
			})
			return
		}
		parts := strings.SplitN(auth, " ", 2)
		if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"success":   false,
				"message":   "Format header Authorization harus Bearer <token>",
				"error":     "UNAUTHORIZED",
				"code":      "AUTH_401_02",
				"timestamp": time.Now().UTC().Format(time.RFC3339),
			})
			return
		}

		token := parts[1]
		claims, err := jwtMgr.Verify(token)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"success":   false,
				"message":   "Access token tidak valid atau telah kedaluwarsa",
				"error":     "UNAUTHORIZED",
				"code":      "AUTH_401_02",
				"timestamp": time.Now().UTC().Format(time.RFC3339),
			})
			return
		}
		c.Set("owner_id", claims.Subject)
		c.Set("user_email", claims.Email)
		c.Set("user_name", claims.Name)
		c.Set("user_role", claims.Role)
		c.Set("user_tier", claims.Tier)
		c.Next()
	}
}
