package services

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"
	"trending-service/models"

	"github.com/go-resty/resty/v2"
	"github.com/redis/go-redis/v9"

	"encoding/json"
)

type TrendingService interface {
	TrackInteraction(ctx context.Context, req models.InteractionRequest) error
	GetTrendingMedia(ctx context.Context, limit int64) ([]models.MediaResponse, error)
}

type trendingServiceImpl struct {
	redisClient *redis.Client
	httpClient  *resty.Client
}

func NewTrendingService(redis *redis.Client) TrendingService {
	return &trendingServiceImpl{
		redisClient: redis,
		httpClient:  resty.New(),
	}
}

const redisKey = "global_trending_leaderboard"

func (s *trendingServiceImpl) TrackInteraction(ctx context.Context, req models.InteractionRequest) error {
	var score float64

	switch req.Action {
	case "CLICK":
		score = 1.0
	case "WATCH":
		score = 3.0
	case "LIKE":
		score = 5.0
	default:
		return fmt.Errorf("aksi tidak valid: %s", req.Action)
	}

	err := s.redisClient.ZIncrBy(ctx, redisKey, score, req.MediaID).Err()
	if err != nil {
		log.Printf("Gagal update Redis: %v", err)
		return err
	}
	return nil
}

func (s *trendingServiceImpl) GetTrendingMedia(ctx context.Context, limit int64) ([]models.MediaResponse, error) {
	mediaIDs, err := s.redisClient.ZRevRange(ctx, "trending:global", 0, limit-1).Result()
	if err != nil || len(mediaIDs) == 0 {
		return []models.MediaResponse{}, nil
	}

	var catalogResp models.CatalogBatchResponse
	catalogURL := os.Getenv("CATALOG_SERVICE_URL")

	resp, err := s.httpClient.R().
		SetHeader("Content-Type", "application/json").
		SetBody(mediaIDs).
		SetResult(&catalogResp).
		Post(catalogURL)

	if err != nil || resp.IsError() {
		log.Printf("⚠️ Java Catalog Service bermasalah. Mencoba menggunakan Fallback Cache...")

		cachedData, cacheErr := s.redisClient.Get(ctx, "fallback:trending_metadata").Result()
		if cacheErr == nil {
			var fallbackResponse []models.MediaResponse
			json.Unmarshal([]byte(cachedData), &fallbackResponse)
			return fallbackResponse, nil
		}

		return nil, fmt.Errorf("layanan metadata tidak tersedia")
	}

	jsonData, _ := json.Marshal(catalogResp.Data)
	s.redisClient.Set(ctx, "fallback:trending_metadata", jsonData, 1*time.Hour)

	return catalogResp.Data, nil
}