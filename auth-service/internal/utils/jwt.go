package utils

import (
	"errors"
	"fmt"
	"time"

	"github.com/DXR3IN/auth-service/internal/domain"
	"github.com/golang-jwt/jwt/v5"
)

type JWTManager struct {
	secret string
	ttl    time.Duration
}

func NewJWTManager(secret string, ttlMins int) *JWTManager {
	return &JWTManager{secret: secret, ttl: time.Minute * time.Duration(ttlMins)}
}

func (j *JWTManager) GenerateAccessToken(user *domain.User) (string, error) {
	now := time.Now()
	role := user.Role
	if role == "" {
		role = "user"
	}
	tier := user.Tier
	if tier == "" {
		tier = "VIP Standard"
	}

	claims := &domain.JWTClaims{
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   fmt.Sprintf("%v", user.ID),
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(now.Add(j.ttl)),
			NotBefore: jwt.NewNumericDate(now),
			Issuer:    "liveeuy-auth-service",
		},
		Email: user.Email,
		Name:  user.Name,
		Role:  role,
		Tier:  tier,
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(j.secret))
}

func (j *JWTManager) Verify(tokenStr string) (*domain.JWTClaims, error) {
	token, err := jwt.ParseWithClaims(tokenStr, &domain.JWTClaims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return []byte(j.secret), nil
	})
	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*domain.JWTClaims); ok && token.Valid {
		return claims, nil
	}
	return nil, errors.New("invalid token")
}

