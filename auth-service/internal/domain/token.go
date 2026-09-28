package domain

import "github.com/golang-jwt/jwt/v5"

type TokenManager interface {
	GenerateAccessToken(userID string) (string, error)
	Verify(tokenStr string) (*jwt.RegisteredClaims, error)
}
