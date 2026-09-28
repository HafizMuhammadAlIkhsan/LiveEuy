package repository

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"sort"
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
	if session.CreatedAt.IsZero() {
		session.CreatedAt = time.Now()
	}

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

	pipe := r.rdb.TxPipeline()
	pipe.Set(ctx, redisRefreshTokenKey(tokenStr), data, ttl)
	pipe.SRem(ctx, redisUserTokensKey(session.UserID), tokenStr)

	_, err = pipe.Exec(ctx)
	return err
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

func (r *RedisSessionRepository) GetActiveSessions(ctx context.Context, userID string) ([]*domain.RefreshTokenSession, error) {
	userKey := redisUserTokensKey(userID)
	tokens, err := r.rdb.SMembers(ctx, userKey).Result()
	if err != nil {
		return nil, fmt.Errorf("gagal mengambil daftar token aktif: %w", err)
	}

	var activeSessions []*domain.RefreshTokenSession
	now := time.Now()

	for _, tokenStr := range tokens {
		session, err := r.Get(ctx, tokenStr)
		if err != nil || session == nil || session.IsRevoked || now.After(session.ExpiresAt) {
			// Bersihkan token basi / revoked dari set user
			_ = r.rdb.SRem(ctx, userKey, tokenStr).Err()
			continue
		}
		activeSessions = append(activeSessions, session)
	}

	// Sortir sesi dari yang paling lama dibuat (FIFO)
	sort.Slice(activeSessions, func(i, j int) bool {
		if activeSessions[i].CreatedAt.IsZero() {
			return true
		}
		if activeSessions[j].CreatedAt.IsZero() {
			return false
		}
		return activeSessions[i].CreatedAt.Before(activeSessions[j].CreatedAt)
	})

	return activeSessions, nil
}

func (r *RedisSessionRepository) EnforceMaxDevices(ctx context.Context, userID string, maxDevices int) error {
	if maxDevices <= 0 {
		return nil
	}

	activeSessions, err := r.GetActiveSessions(ctx, userID)
	if err != nil {
		return err
	}

	// Jika kuota aktif sudah mencapai / melebihi maxDevices, evict sesi tertua (FIFO)
	if len(activeSessions) >= maxDevices {
		numToEvict := len(activeSessions) - maxDevices + 1
		for i := 0; i < numToEvict && i < len(activeSessions); i++ {
			_ = r.Revoke(ctx, activeSessions[i].Token)
		}
	}

	return nil
}
