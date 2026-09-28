package domain

import (
	"context"
	"time"
)

type RefreshTokenSession struct {
	Token      string    `json:"token"`
	UserID     string    `json:"user_id"`
	ExpiresAt  time.Time `json:"expires_at"`
	IsRevoked  bool      `json:"is_revoked"`
	DeviceName string    `json:"device_name"`
}

type SessionRepository interface {
	Save(ctx context.Context, session *RefreshTokenSession) error
	Get(ctx context.Context, token string) (*RefreshTokenSession, error)
	Revoke(ctx context.Context, token string) error
	RevokeAllUserTokens(ctx context.Context, userID string) error
}
