package repository

import (
    "context"
    "encoding/json"
    "errors"
    "fmt"
    "time"

    "github.com/DXR3IN/auth-service/internal/domain"
    "github.com/redis/go-redis/v9"
)

type RedisPinRepository struct {
    rdb *redis.Client
}

func NewRedisPinRepository(rdb *redis.Client) *RedisPinRepository {
    return &RedisPinRepository{rdb: rdb}
}

func redisPinOtpKey(email string) string {
    return fmt.Sprintf("pin:%s", email)
}

func (r *RedisPinRepository) SavePinOtp(ctx context.Context, pinSession *domain.PinSession) error {
    if pinSession.CreatedAt.IsZero() {
        pinSession.CreatedAt = time.Now()
    }

    data, err := json.Marshal(pinSession)
    if err != nil {
        return err
    }

    ttl := time.Until(pinSession.ExpiresAt)
    if ttl < 0 {
        return errors.New("pin sudah kedaluarsa")
    }

    key := redisPinOtpKey(pinSession.Email)
    err = r.rdb.Set(ctx, key, data, ttl).Err()
    if err != nil {
        return fmt.Errorf("gagal menyimpan PIN ke redis: %w", err)
    }

    return nil
}

func (r *RedisPinRepository) GetPinOtp(ctx context.Context, email string) (*domain.PinSession, error) {
    val, err := r.rdb.Get(ctx, redisPinOtpKey(email)).Result()
    if errors.Is(err, redis.Nil) {
        return nil, errors.New("pin sudah tidak valid atau kedaluwarsa")
    } else if err != nil {
        return nil, err
    }

    var pinSession domain.PinSession
    if err := json.Unmarshal([]byte(val), &pinSession); err != nil {
        return nil, err
    }

    return &pinSession, nil
}