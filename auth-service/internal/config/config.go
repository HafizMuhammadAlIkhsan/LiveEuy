package config

import (
	"os"
	"strconv"
	"strings"
)

type WebOAuth struct {
	GoogleClientID     string
	GoogleClientSecret string
	GoogleRedirectURL  string
}

type Redis struct {
	URL   string
	Token string
}

type JWT struct {
	PrivateKeyPath string
	PublicKeyPath  string
	PrivateKey     string
	PublicKey      string
	KeyID          string
	TTL            int
}

type Config struct {
	Port      string
	DBURL     string
	WebOAuth  WebOAuth
	RedisData Redis
	JWTConfig JWT
}

func NewConfigFromEnv() *Config {
	webOAuth := WebOAuth{
		GoogleClientID:     getEnv("WEB_OAUTH_GOOGLE_CLIENT_ID", "Tidak Ada"),
		GoogleClientSecret: getEnv("WEB_OAUTH_GOOGLE_CLIENT_SECRET", "Tidak Ada"),
		GoogleRedirectURL:  getEnv("WEB_OAUTH_GOOGLE_REDIRECT_URL", "Tidak Ada"),
	}

	redisURL := getEnv("REDIS_URL", "")
	if redisURL == "" {
		redisURL = getEnv("UPSTASH_REDIS_REST_URL", "")
	}

	redisData := Redis{
		URL:   redisURL,
		Token: getEnv("UPSTASH_REDIS_REST_TOKEN", ""),
	}

	jwtTTL := 15 // Default 15 minutes as per contract
	if v := getEnv("JWT_EXPIRATION_MS", ""); v != "" {
		if n, err := strconv.Atoi(v); err == nil && n > 0 {
			jwtTTL = n / 60000
		}
	}

	jwtConfig := JWT{
		PrivateKeyPath: getEnv("JWT_PRIVATE_KEY_PATH", "certs/private.pem"),
		PublicKeyPath:  getEnv("JWT_PUBLIC_KEY_PATH", "certs/public.pem"),
		PrivateKey:     getEnv("JWT_PRIVATE_KEY", ""),
		PublicKey:      getEnv("JWT_PUBLIC_KEY", ""),
		KeyID:          getEnv("JWT_KEY_ID", "liveeuy-auth-key-1"),
		TTL:            jwtTTL,
	}

	return &Config{
		Port:      getEnv("PORT", "8080"),
		DBURL:     getEnv("DATABASE_URL", "postgres://postgres:postgres@localhost:5432/authdb?sslmode=disable"),
		WebOAuth:  webOAuth,
		RedisData: redisData,
		JWTConfig: jwtConfig,
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return strings.Trim(v, "\"'")
	}
	return fallback
}
