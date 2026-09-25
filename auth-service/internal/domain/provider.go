package domain

import "context"

type OAuthProvider interface {
	GetAuthURL(state string) string
	ExchangeCodeForUser(ctx context.Context, code string) (*GoogleUser, error)
}
