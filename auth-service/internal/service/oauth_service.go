package service

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"

	"github.com/DXR3IN/auth-service/internal/config"
	"github.com/DXR3IN/auth-service/internal/domain"
	"github.com/DXR3IN/auth-service/internal/repository"
	"github.com/DXR3IN/auth-service/internal/utils"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

type OAuthService struct {
	googleConfig *oauth2.Config
	userRepo     repository.UserRepository 
	jwtUtil      *utils.JWTManager         
}

func NewOAuthService(cfg *config.Config, userRepo repository.UserRepository, jwtUtil *utils.JWTManager) *OAuthService {
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

	return &OAuthService{
		googleConfig: oauthConfig,
		userRepo:     userRepo,
		jwtUtil:      jwtUtil,
	}
}

func (s *OAuthService) GetGoogleAuthURL(state string) string {
	return s.googleConfig.AuthCodeURL(state, oauth2.AccessTypeOffline)
}

func (s *OAuthService) HandleGoogleCallback(ctx context.Context, code string) (string, error) {
	token, err := s.googleConfig.Exchange(ctx,code)
	if err != nil {
		return "", fmt.Errorf("Gagal menukar code: %w", err)
	}

	client := s.googleConfig.Client(ctx, token)

	resp, err := client.Get("https://www.googleapis.com/oauth2/v2/userinfo")
	if err != nil {
		return "", fmt.Errorf("gagal mengambil profil user: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", errors.New("respons dari server google tidak sukses")
	}

	var googleUser domain.GoogleUser
	if err := json.NewDecoder(resp.Body).Decode(&googleUser); err != nil {
		return "", fmt.Errorf("gagal decode json user: %w", err)
	}

	
	user, err := s.userRepo.FindByEmail(googleUser.Email)
	if err != nil {
		newUser := &domain.User{
			Email:    googleUser.Email,
			Name:     googleUser.Name,
			Picture:  googleUser.Picture,
			Provider: "google",
		}
		
		err = s.userRepo.Create(newUser)
		if err != nil {
			return "", fmt.Errorf("gagal menyimpar user OAuth ke DB: %w", err)
		}
	}

	accessToken, err := s.jwtUtil.Generate(user.ID)
	if err != nil {
		return "", fmt.Errorf("gagal generate JWT token: %w", err)
	}

	return accessToken, nil
}