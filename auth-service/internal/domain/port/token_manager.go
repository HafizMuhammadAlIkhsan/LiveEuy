package port

import "github.com/DXR3IN/auth-service/internal/domain"

// TokenManager adalah port untuk manajemen JWT token.
type TokenManager interface {
	GenerateAccessToken(user *domain.User) (string, error)
	Verify(tokenStr string) (*domain.JWTClaims, error)
	GetJWKS() map[string]interface{}
	GetPublicKeyPEM() string
}
