package domain

import "context"

// OAuthProvider is the domain port for federated identity authentication.
type OAuthProvider interface {
	GetAuthURL(state string) string
	ExchangeCodeForUser(ctx context.Context, code string) (*OAuthUser, error)
}
