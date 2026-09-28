package middleware

import (
	"net/http"
	"strings"

	"github.com/DXR3IN/auth-service/internal/domain"
	"github.com/gin-gonic/gin"
)

func AuthRequired(jwtMgr domain.TokenManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		auth := c.GetHeader("Authorization")
		if auth == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"success": false, "error": "missing authorization header"})
			return
		}
		parts := strings.SplitN(auth, " ", 2)
		if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"success": false, "error": "invalid authorization header"})
			return
		}

		token := parts[1]
		claims, err := jwtMgr.Verify(token)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"success": false, "error": "invalid token"})
			return
		}
		c.Set("owner_id", claims.Subject)
		c.Next()
	}
}
