package utils

import (
	"crypto/rand"
	"crypto/rsa"
	"crypto/x509"
	"encoding/base64"
	"encoding/pem"
	"errors"
	"fmt"
	"math/big"
	"os"
	"path/filepath"
)

// LoadOrGenerateRSAKeys loads RSA private and public keys from file paths or env strings.
// If the key files do not exist, it automatically generates a new 2048-bit RSA keypair and saves them.
func LoadOrGenerateRSAKeys(privatePath, publicPath, privateStr, publicStr string) (*rsa.PrivateKey, *rsa.PublicKey, error) {
	// 1. Try loading from raw PEM strings (if provided in env)
	if privateStr != "" && publicStr != "" {
		privKey, err := ParseRSAPrivateKeyFromPEM([]byte(privateStr))
		if err != nil {
			return nil, nil, fmt.Errorf("failed to parse private key from string: %w", err)
		}
		pubKey, err := ParseRSAPublicKeyFromPEM([]byte(publicStr))
		if err != nil {
			return nil, nil, fmt.Errorf("failed to parse public key from string: %w", err)
		}
		return privKey, pubKey, nil
	}

	// 2. Set default file paths if empty
	if privatePath == "" {
		privatePath = filepath.Join("certs", "private.pem")
	}
	if publicPath == "" {
		publicPath = filepath.Join("certs", "public.pem")
	}

	// 3. Try loading from files on disk
	if fileExists(privatePath) && fileExists(publicPath) {
		privBytes, err := os.ReadFile(privatePath)
		if err != nil {
			return nil, nil, fmt.Errorf("failed to read private key file: %w", err)
		}
		pubBytes, err := os.ReadFile(publicPath)
		if err != nil {
			return nil, nil, fmt.Errorf("failed to read public key file: %w", err)
		}

		privKey, err := ParseRSAPrivateKeyFromPEM(privBytes)
		if err != nil {
			return nil, nil, fmt.Errorf("failed to parse private key file: %w", err)
		}
		pubKey, err := ParseRSAPublicKeyFromPEM(pubBytes)
		if err != nil {
			return nil, nil, fmt.Errorf("failed to parse public key file: %w", err)
		}
		return privKey, pubKey, nil
	}

	// 4. Auto-generate new 2048-bit RSA keypair and save to disk
	privKey, err := rsa.GenerateKey(rand.Reader, 2048)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to generate RSA keypair: %w", err)
	}
	pubKey := &privKey.PublicKey

	// Create directory if not exists
	_ = os.MkdirAll(filepath.Dir(privatePath), 0755)
	_ = os.MkdirAll(filepath.Dir(publicPath), 0755)

	privPEM := EncodeRSAPrivateKeyToPEM(privKey)
	pubPEM, err := EncodeRSAPublicKeyToPEM(pubKey)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to encode generated public key: %w", err)
	}

	if err := os.WriteFile(privatePath, privPEM, 0600); err != nil {
		return nil, nil, fmt.Errorf("failed to save generated private key: %w", err)
	}
	if err := os.WriteFile(publicPath, pubPEM, 0644); err != nil {
		return nil, nil, fmt.Errorf("failed to save generated public key: %w", err)
	}

	return privKey, pubKey, nil
}

func ParseRSAPrivateKeyFromPEM(pemBytes []byte) (*rsa.PrivateKey, error) {
	block, _ := pem.Decode(pemBytes)
	if block == nil {
		return nil, errors.New("invalid PEM block for private key")
	}

	// Try PKCS#1
	if key, err := x509.ParsePKCS1PrivateKey(block.Bytes); err == nil {
		return key, nil
	}

	// Try PKCS#8
	key, err := x509.ParsePKCS8PrivateKey(block.Bytes)
	if err != nil {
		return nil, err
	}
	rsaKey, ok := key.(*rsa.PrivateKey)
	if !ok {
		return nil, errors.New("key is not an RSA private key")
	}
	return rsaKey, nil
}

func ParseRSAPublicKeyFromPEM(pemBytes []byte) (*rsa.PublicKey, error) {
	block, _ := pem.Decode(pemBytes)
	if block == nil {
		return nil, errors.New("invalid PEM block for public key")
	}

	// Try PKIX
	if pub, err := x509.ParsePKIXPublicKey(block.Bytes); err == nil {
		if rsaPub, ok := pub.(*rsa.PublicKey); ok {
			return rsaPub, nil
		}
	}

	// Try PKCS#1
	return x509.ParsePKCS1PublicKey(block.Bytes)
}

func EncodeRSAPrivateKeyToPEM(key *rsa.PrivateKey) []byte {
	return pem.EncodeToMemory(&pem.Block{
		Type:  "RSA PRIVATE KEY",
		Bytes: x509.MarshalPKCS1PrivateKey(key),
	})
}

func EncodeRSAPublicKeyToPEM(key *rsa.PublicKey) ([]byte, error) {
	bytes, err := x509.MarshalPKIXPublicKey(key)
	if err != nil {
		return nil, err
	}
	return pem.EncodeToMemory(&pem.Block{
		Type:  "PUBLIC KEY",
		Bytes: bytes,
	}), nil
}

// RSAPublicKeyToJWK converts an RSA public key into an RFC 7517 JSON Web Key map
func RSAPublicKeyToJWK(pubKey *rsa.PublicKey, keyID string) map[string]interface{} {
	nBytes := pubKey.N.Bytes()
	eBytes := big.NewInt(int64(pubKey.E)).Bytes()

	return map[string]interface{}{
		"kty": "RSA",
		"use": "sig",
		"alg": "RS256",
		"kid": keyID,
		"n":   base64.RawURLEncoding.EncodeToString(nBytes),
		"e":   base64.RawURLEncoding.EncodeToString(eBytes),
	}
}

func fileExists(path string) bool {
	info, err := os.Stat(path)
	if err != nil {
		return false
	}
	return !info.IsDir()
}
