package services

import (
	"context"
	"log"
	"math"
	"time"

	"github.com/redis/go-redis/v9"
)

const (
	WeightMomentum   = 0.5
	WeightPopularity = 0.3
	WeightRecency    = 0.2
	MinViews24h      = 100
	Epsilon          = 1.0
	LambdaAge        = 0.5
)

type RawMetrics struct {
	MediaID    string
	Views24h   float64
	Views7d    float64
	TotalViews float64
	AgeDays    float64
}

type ScoreComponents struct {
	MediaID    string
	Momentum   float64
	Popularity float64
	Recency    float64
	FinalScore float64
}

func StartTrendingWorker(redisClient *redis.Client) {
	ticker := time.NewTicker(15 * time.Minute)
	go func() {
		for range ticker.C {
			log.Println("⚙️ [WORKER] Memulai kalkulasi algoritma Trending...")
			processTrending(context.Background(), redisClient)
		}
	}()
}

func processTrending(ctx context.Context, rdb *redis.Client) {
	mediaIDs, err := rdb.SMembers(ctx, "media:active_set").Result()
	if err != nil || len(mediaIDs) == 0 {
		return
	}

	today := time.Now().Format("2006-01-02")
	var rawData []RawMetrics

	for _, id := range mediaIDs {
		v24, _ := rdb.Get(ctx, "views:daily:"+today+":"+id).Float64()
		
		if v24 < MinViews24h {
			continue
		}

		vTotal, _ := rdb.Get(ctx, "views:total:"+id).Float64()
		
		var v7d float64
		for i := 0; i < 7; i++ {
			dateKey := time.Now().AddDate(0, 0, -i).Format("2006-01-02")
			val, _ := rdb.Get(ctx, "views:daily:"+dateKey+":"+id).Float64()
			v7d += val
		}

		ageDays := 30.0 

		rawData = append(rawData, RawMetrics{
			MediaID:    id,
			Views24h:   v24,
			Views7d:    v7d,
			TotalViews: vTotal,
			AgeDays:    ageDays,
		})
	}

	var scores []ScoreComponents
	var maxM, maxP, maxR float64

	for _, metric := range rawData {
		avg7d := metric.Views7d / 7.0
		m := metric.Views24h / (avg7d + Epsilon)

		p := math.Log10(1 + metric.TotalViews)

		r := 1.0 / (1.0 + LambdaAge*math.Log10(1+metric.AgeDays))

		maxM = math.Max(maxM, m)
		maxP = math.Max(maxP, p)
		maxR = math.Max(maxR, r)

		scores = append(scores, ScoreComponents{
			MediaID: metric.MediaID, Momentum: m, Popularity: p, Recency: r,
		})
	}

	for _, s := range scores {
		normM := s.Momentum
		if maxM > 0 { normM = s.Momentum / maxM }
		
		normP := s.Popularity
		if maxP > 0 { normP = s.Popularity / maxP }
		
		normR := s.Recency
		if maxR > 0 { normR = s.Recency / maxR }

		finalScore := (WeightMomentum * normM) + (WeightPopularity * normP) + (WeightRecency * normR)

		rdb.ZAdd(ctx, "trending:global", redis.Z{
			Score:  finalScore,
			Member: s.MediaID,
		})
	}
	log.Println("✅ [WORKER] Selesai memproses dan mengurutkan Trending.")
}