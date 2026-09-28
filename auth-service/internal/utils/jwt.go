package utils

import (
	"crypto/rsa"
	"errors"
	"fmt"
	"time"

	"github.com/DXR3IN/auth-service/internal/domain"
	"github.com/golang-jwt/jwt/v5"
)

type JWTManager struct {
	privateKey *rsa.PrivateKey
	publicKey  *rsa.PublicKey
	keyID      string
	ttl        time.Duration
}

func NewJWTManager(privateKey *rsa.PrivateKey, publicKey *rsa.PublicKey, keyID string, ttlMins int) *JWTManager {
	if keyID == "" {
		keyID = "liveeuy-auth-key-1"
	}
	return &JWTManager{
		privateKey: privateKey,
		publicKey:  publicKey,
		keyID:      keyID,
		ttl:        time.Minute * time.Duration(ttlMins),
	}
}

func (j *JWTManager) GenerateAccessToken(user *domain.User) (string, error) {
	if j.privateKey == nil {
		return "", errors.New("RSA private key is not configured for signing")
	}

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

	token := jwt.NewWithClaims(jwt.SigningMethodRS256, claims)
	token.Header["kid"] = j.keyID

	return token.SignedString(j.privateKey)
}

func (j *JWTManager) Verify(tokenStr string) (*domain.JWTClaims, error) {
	if j.publicKey == nil {
		return nil, errors.New("RSA public key is not configured for verification")
	}

	token, err := jwt.ParseWithClaims(tokenStr, &domain.JWTClaims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodRSA); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v (expected RS256)", token.Header["alg"])
		}
		return j.publicKey, nil
	})
	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*domain.JWTClaims); ok && token.Valid {
		return claims, nil
	}
	return nil, errors.New("invalid token")
}

func (j *JWTManager) GetJWKS() map[string]interface{} {
	if j.publicKey == nil {
		return map[string]interface{}{
			"keys": []interface{}{},
		}
	}
	jwk := RSAPublicKeyToJWK(j.publicKey, j.keyID)
	return map[string]interface{}{
		"keys": []interface{}{jwk},
	}
}

func (j *JWTManager) GetPublicKeyPEM() string {
	if j.publicKey == nil {
		return ""
	}
	pemBytes, err := EncodeRSAPublicKeyToPEM(j.publicKey)
	if err != nil {
		return ""
	}
	return string(pemBytes)
}
