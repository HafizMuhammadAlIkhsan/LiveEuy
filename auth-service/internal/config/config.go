package config

import (
	"os"
	"strconv"
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
	Secret string
	TTL    int
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

	redisData := Redis{
		URL:   getEnv("UPSTASH_REDIS_REST_URL", ""),
		Token: getEnv("UPSTASH_REDIS_REST_TOKEN", ""),
	}

	jwtTTL := 60
	if v := getEnv("JWT_EXPIRATION_MS", ""); v != "" {
		if n, err := strconv.Atoi(v); err == nil {
			jwtTTL = n / 60000
		}
	}

	jwtConfig := JWT{
		Secret: getEnv("JWT_SECRET", "secret"),
		TTL:    jwtTTL,
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
		return v
	}
	return fallback
}
