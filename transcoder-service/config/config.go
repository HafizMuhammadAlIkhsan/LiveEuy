package config

import (
	"log"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	Port                string
	JWKSetURI           string
	JWTIssuer           string
	CatalogServiceURL   string
	StorageType         string
	StorageLocalDir     string
	MaxConcurrentJobs   int
	MaxUploadSizeBytes  int64
	PublicStreamBaseURL string
}

func LoadConfig() *Config {
	if err := godotenv.Load(); err != nil {
		// Log note if .env is missing (e.g. running in Docker or Production env)
		log.Println("ℹ️ File .env tidak ditemukan, menggunakan variabel environment sistem / default")
	}

	port := getEnv("PORT", "8082")
	jwkSetURI := getEnv("JWK_SET_URI", "http://auth-service:8080/.well-known/jwks.json")
	jwtIssuer := getEnv("JWT_ISSUER", "liveeuy-auth-service")
	catalogURL := getEnv("CATALOG_SERVICE_URL", "http://catalog-service:8081/api/v1")
	storageType := getEnv("STORAGE_TYPE", "local")
	storageDir := getEnv("STORAGE_LOCAL_DIR", "./storage")
	publicStreamURL := getEnv("PUBLIC_STREAM_BASE_URL", "http://localhost/api/v1/transcoder/stream")

	maxJobsStr := getEnv("MAX_CONCURRENT_JOBS", "2")
	maxJobs, err := strconv.Atoi(maxJobsStr)
	if err != nil || maxJobs <= 0 {
		maxJobs = 2
	}

	maxUploadStr := getEnv("MAX_UPLOAD_SIZE_BYTES", "2147483648") // 2 GB
	maxUpload, err := strconv.ParseInt(maxUploadStr, 10, 64)
	if err != nil || maxUpload <= 0 {
		maxUpload = 2147483648
	}

	return &Config{
		Port:                port,
		JWKSetURI:           jwkSetURI,
		JWTIssuer:           jwtIssuer,
		CatalogServiceURL:   catalogURL,
		StorageType:         storageType,
		StorageLocalDir:     storageDir,
		MaxConcurrentJobs:   maxJobs,
		MaxUploadSizeBytes:  maxUpload,
		PublicStreamBaseURL: publicStreamURL,
	}
}

func getEnv(key, defaultVal string) string {
	if val, ok := os.LookupEnv(key); ok && val != "" {
		return val
	}
	return defaultVal
}
