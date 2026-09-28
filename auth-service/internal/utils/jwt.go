package utils

import (
	"errors"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type JWTManager struct {
	secret string
	ttl    time.Duration
}

func NewJWTManager(secret string, ttlMins int) *JWTManager {
	return &JWTManager{secret: secret, ttl: time.Minute * time.Duration(ttlMins)}
}

func (j *JWTManager) GenerateAccessToken(userID string) (string, error) {
	now := time.Now()
	claims := &jwt.RegisteredClaims{
		Subject:   fmt.Sprintf("%v", userID),
		IssuedAt:  jwt.NewNumericDate(now),
		ExpiresAt: jwt.NewNumericDate(now.Add(j.ttl)),
		NotBefore: jwt.NewNumericDate(now),
		Issuer:    "auth-service",
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(j.secret))
}

func (j *JWTManager) Verify(tokenStr string) (*jwt.RegisteredClaims, error) {
	token, err := jwt.ParseWithClaims(tokenStr, &jwt.RegisteredClaims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return []byte(j.secret), nil
	})
	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*jwt.RegisteredClaims); ok && token.Valid {
		return claims, nil
	}
	return nil, errors.New("invalid token")
}

