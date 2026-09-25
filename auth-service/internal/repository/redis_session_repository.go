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

type RedisSessionRepository struct {
	rdb *redis.Client
}

func NewRedisSessionRepository(rdb *redis.Client) *RedisSessionRepository {
	return &RedisSessionRepository{rdb: rdb}
}

func redisRefreshTokenKey(token string) string {
	return fmt.Sprintf("refresh_token:%s", token)
}

func redisUserTokensKey(userID string) string {
	return fmt.Sprintf("user_tokens:%s", userID)
}

func (r *RedisSessionRepository) Save(ctx context.Context, session *domain.RefreshTokenSession) error {
	data, err := json.Marshal(session)
	if err != nil {
		return err
	}

	ttl := time.Until(session.ExpiresAt)
	if ttl <= 0 {
		return errors.New("token sudah kedaluwarsa")
	}

	pipe := r.rdb.TxPipeline()

	pipe.Set(ctx, redisRefreshTokenKey(session.Token), data, ttl)
	pipe.SAdd(ctx, redisUserTokensKey(session.UserID), session.Token)
	pipe.Expire(ctx, redisUserTokensKey(session.UserID), ttl)

	_, err = pipe.Exec(ctx)
	return err
}

func (r *RedisSessionRepository) Get(ctx context.Context, tokenStr string) (*domain.RefreshTokenSession, error) {
	val, err := r.rdb.Get(ctx, redisRefreshTokenKey(tokenStr)).Result()
	if errors.Is(err, redis.Nil) {
		return nil, errors.New("refresh token tidak valid atau sudah kedaluwarsa")
	} else if err != nil {
		return nil, err
	}

	var session domain.RefreshTokenSession
	if err := json.Unmarshal([]byte(val), &session); err != nil {
		return nil, err
	}

	return &session, nil
}

func (r *RedisSessionRepository) Revoke(ctx context.Context, tokenStr string) error {
	session, err := r.Get(ctx, tokenStr)
	if err != nil {
		return err
	}

	session.IsRevoked = true

	data, err := json.Marshal(session)
	if err != nil {
		return err
	}

	ttl := r.rdb.TTL(ctx, redisRefreshTokenKey(tokenStr)).Val()
	if ttl <= 0 {
		return nil
	}

	return r.rdb.Set(ctx, redisRefreshTokenKey(tokenStr), data, ttl).Err()
}

func (r *RedisSessionRepository) RevokeAllUserTokens(ctx context.Context, userID string) error {
	userKey := redisUserTokensKey(userID)

	tokens, err := r.rdb.SMembers(ctx, userKey).Result()
	if err != nil {
		return fmt.Errorf("gagal mengambil token user: %w", err)
	}

	if len(tokens) == 0 {
		return nil
	}

	pipe := r.rdb.TxPipeline()
	for _, tokenStr := range tokens {
		session, err := r.Get(ctx, tokenStr)
		if err == nil {
			session.IsRevoked = true
			data, _ := json.Marshal(session)

			ttl := r.rdb.TTL(ctx, redisRefreshTokenKey(tokenStr)).Val()
			if ttl > 0 {
				pipe.Set(ctx, redisRefreshTokenKey(tokenStr), data, ttl)
			}
		}
	}

	pipe.Del(ctx, userKey)

	_, err = pipe.Exec(ctx)
	if err != nil {
		return fmt.Errorf("gagal mengeksekusi pencabutan massal: %w", err)
	}

	return nil
}
