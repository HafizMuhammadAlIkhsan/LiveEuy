package port

import (
	"context"

	"github.com/DXR3IN/auth-service/internal/domain"
)

// OAuthProvider adalah port untuk integrasi OAuth pihak ketiga.
type OAuthProvider interface {
	GetAuthURL(state string) string
	ExchangeCodeForUser(ctx context.Context, code string) (*domain.GoogleUser, error)
}
