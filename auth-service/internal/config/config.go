package config

import (
	"os"
)

type WebOAuth struct {
	GoogleClientID string
	GoogleClientSecret string
	GoogleRedirectURL string
}

type Config struct {
	Port       string
	DBURL	   string
	WebOAuth WebOAuth
}

func NewConfigFromEnv() *Config {

	webOAuth := WebOAuth{
		GoogleClientID: getEnv("WEB_OAUTH_GOOGLE_CLIENT_ID", "Tidak Ada"),
		GoogleClientSecret: getEnv("WEB_OAUTH_GOOGLE_CLIENT_SECRET", "Tidak Ada"),
		GoogleRedirectURL: getEnv("WEB_OAUTH_GOOGLE_REDIRECT_URL", "Tidak Ada"),
	}

	return &Config{
		Port:       getEnv("PORT", "8080"),
		DBURL:      getEnv("DATABASE_URL", "postgres://postgres:postgres@localhost:5432/authdb?sslmode=disable"),
		WebOAuth: webOAuth,
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
