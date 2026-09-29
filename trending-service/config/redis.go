package config

import (
	"context"
	"log"
	"os"

	"github.com/redis/go-redis/v9"
)

func ConnectRedis() *redis.Client {
	redisURL := os.Getenv("REDIS_URL")
	if redisURL == "" {
		log.Fatal("REDIS_URL tidak ditemukan di environment variables")
	}

	opt, err := redis.ParseURL(redisURL)
	if err != nil {
		log.Fatalf("Gagal mem-parsing REDIS_URL: %v", err)
	}

	client := redis.NewClient(opt)

	ctx := context.Background()
	if err := client.Ping(ctx).Err(); err != nil {
		log.Fatalf("Gagal terhubung ke Upstash Redis: %v", err)
	}

	log.Println("Berhasil terhubung ke Upstash Redis")
	return client
}
