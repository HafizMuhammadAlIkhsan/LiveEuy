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
		GoogleClientID:     getEnv(KEY_WEB_OAUTH_GOOGLE_CLIENT_ID, ENV_NOT_FOUND),
		GoogleClientSecret: getEnv(KEY_WEB_OAUTH_GOOGLE_CLIENT_SECRET, ENV_NOT_FOUND),
		GoogleRedirectURL:  getEnv(KEY_WEB_OAUTH_GOOGLE_REDIRECT_URL, ENV_NOT_FOUND),
	}

	redisURL := getEnv(KEY_R_URL, ENV_NOT_FOUND)
	if redisURL == "" {
		redisURL = getEnv(KEY_2_R_URL, ENV_NOT_FOUND)
	}

	redisData := Redis{
		URL:   redisURL,
		Token: getEnv(KEY_R_TOKEN, ENV_NOT_FOUND),
	}

	jwtTTL := 15 
	if v := getEnv(KEY_JWT_EXP, ENV_NOT_FOUND); v != "" {
		if n, err := strconv.Atoi(v); err == nil && n > 0 {
			jwtTTL = n / 60000
		}
	}

	jwtConfig := JWT{
		PrivateKeyPath: getEnv(KEY_JWT_PRIVATE_KEY_PATH, ""),
		PublicKeyPath:  getEnv(KEY_JWT_PUBLIC_KEY_PATH, ""),
		PrivateKey:     getEnv(KEY_JWT_PRIVATE_KEY, ""),
		PublicKey:      getEnv(KEY_JWT_PUBLIC_KEY, ""),
		KeyID:          getEnv(KEY_JWT_KEY_ID, ""),
		TTL:            jwtTTL,
	}

	return &Config{
		Port:      getEnv(KEY_PORT, ENV_NOT_FOUND),
		DBURL:     getEnv(KEY_DB_URL, ENV_NOT_FOUND),
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
