package port

import (
	"context"
	"github.com/DXR3IN/auth-service/internal/domain"
)

// SessionRepository adalah port untuk penyimpanan sesi refresh token.
type SessionRepository interface {
	Save(ctx context.Context, session *domain.RefreshTokenSession) error
	Get(ctx context.Context, token string) (*domain.RefreshTokenSession, error)
	Revoke(ctx context.Context, token string) error
	RevokeAllUserTokens(ctx context.Context, userID string) error
	GetActiveSessions(ctx context.Context, userID string) ([]*domain.RefreshTokenSession, error)
	EnforceMaxDevices(ctx context.Context, userID string, maxDevices int) error
}
