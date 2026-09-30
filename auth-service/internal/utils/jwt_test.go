package utils

import (
	"crypto/rand"
	"crypto/rsa"
	"testing"

	"github.com/DXR3IN/auth-service/internal/domain"
)

func TestRSALoadAndGenerate(t *testing.T) {
	privKey, pubKey, err := LoadOrGenerateRSAKeys("", "", "", "")
	if err != nil {
		t.Fatalf("failed to load/generate RSA keys: %v", err)
	}
	if privKey == nil || pubKey == nil {
		t.Fatalf("expected non-nil RSA keys")
	}
}

func TestJWTManager_RS256(t *testing.T) {
	privKey, err := rsa.GenerateKey(rand.Reader, 2048)
	if err != nil {
		t.Fatalf("failed to generate RSA key: %v", err)
	}
	pubKey := &privKey.PublicKey

	jwtMgr := NewJWTManager(privKey, pubKey, "test-kid-1", 15)

	user := &domain.User{
		ID:    "usr-12345",
		Email: "hafiz@liveeuy.id",
		Name:  "Hafiz Muhammad",
		Role:  "admin",
		Stage:  "vip",
	}

	tokenStr, err := jwtMgr.GenerateAccessToken(user)
	if err != nil {
		t.Fatalf("failed to generate access token: %v", err)
	}

	claims, err := jwtMgr.Verify(tokenStr)
	if err != nil {
		t.Fatalf("failed to verify access token: %v", err)
	}

	if claims.Subject != "usr-12345" {
		t.Fatalf("expected sub 'usr-12345', got %s", claims.Subject)
	}
	if claims.Role != "admin" {
		t.Fatalf("expected role 'admin', got %s", claims.Role)
	}
	if claims.Stage != "vip" {
		t.Fatalf("expected tier 'vip', got %s", claims.Stage)
	}

	// Test JWKS
	jwks := jwtMgr.GetJWKS()
	keys, ok := jwks["keys"].([]interface{})
	if !ok || len(keys) != 1 {
		t.Fatalf("expected 1 key in JWKS, got %v", jwks)
	}
	keyMap, ok := keys[0].(map[string]interface{})
	if !ok {
		t.Fatalf("expected key map in JWKS")
	}
	if keyMap["kty"] != "RSA" || keyMap["alg"] != "RS256" || keyMap["kid"] != "test-kid-1" {
		t.Fatalf("unexpected JWK fields: %v", keyMap)
	}

	// Test PEM export
	pemStr := jwtMgr.GetPublicKeyPEM()
	if pemStr == "" {
		t.Fatalf("expected non-empty PEM string")
	}
}
