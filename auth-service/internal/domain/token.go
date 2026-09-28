package domain

import "github.com/golang-jwt/jwt/v5"

type JWTClaims struct {
	jwt.RegisteredClaims
	Email string `json:"email,omitempty"`
	Name  string `json:"name,omitempty"`
	Role  string `json:"role,omitempty"`
	Tier  string `json:"tier,omitempty"`
}

type TokenManager interface {
	GenerateAccessToken(user *User) (string, error)
	Verify(tokenStr string) (*JWTClaims, error)
	GetJWKS() map[string]interface{}
	GetPublicKeyPEM() string
}
