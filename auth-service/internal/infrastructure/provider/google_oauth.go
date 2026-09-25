package provider

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"

	"github.com/DXR3IN/auth-service/internal/config"
	"github.com/DXR3IN/auth-service/internal/domain"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

type GoogleOAuthProvider struct {
	googleConfig *oauth2.Config
}

func NewGoogleOAuthProvider(cfg *config.Config) *GoogleOAuthProvider {
	oauthConfig := &oauth2.Config{
		ClientID:     cfg.WebOAuth.GoogleClientID,
		ClientSecret: cfg.WebOAuth.GoogleClientSecret,
		RedirectURL:  cfg.WebOAuth.GoogleRedirectURL,
		Scopes: []string{
			"https://www.googleapis.com/auth/userinfo.email",
			"https://www.googleapis.com/auth/userinfo.profile",
		},
		Endpoint: google.Endpoint,
	}

	return &GoogleOAuthProvider{
		googleConfig: oauthConfig,
	}
}

func (p *GoogleOAuthProvider) GetAuthURL(state string) string {
	return p.googleConfig.AuthCodeURL(state, oauth2.AccessTypeOffline)
}

func (p *GoogleOAuthProvider) ExchangeCodeForUser(ctx context.Context, code string) (*domain.GoogleUser, error) {
	token, err := p.googleConfig.Exchange(ctx, code)
	if err != nil {
		return nil, fmt.Errorf("Gagal menukar code: %w", err)
	}

	client := p.googleConfig.Client(ctx, token)

	resp, err := client.Get("https://www.googleapis.com/oauth2/v2/userinfo")
	if err != nil {
		return nil, fmt.Errorf("gagal mengambil profil user: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, errors.New("respons dari server google tidak sukses")
	}

	var googleUser domain.GoogleUser
	if err := json.NewDecoder(resp.Body).Decode(&googleUser); err != nil {
		return nil, fmt.Errorf("gagal decode json user: %w", err)
	}

	return &googleUser, nil
}
