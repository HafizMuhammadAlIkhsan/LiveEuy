package service

import (
	"context"
	"fmt"

	"github.com/DXR3IN/auth-service/internal/domain"
	"github.com/DXR3IN/auth-service/internal/repository"
)

type OAuthService struct {
	oauthProvider domain.OAuthProvider
	userRepo      repository.UserRepository
	jwtUtil       domain.TokenManager
	sessionRepo   domain.SessionRepository
}

func NewOAuthService(oauthProvider domain.OAuthProvider, userRepo repository.UserRepository, jwtUtil domain.TokenManager, sessionRepo domain.SessionRepository) *OAuthService {
	return &OAuthService{
		oauthProvider: oauthProvider,
		userRepo:      userRepo,
		jwtUtil:       jwtUtil,
		sessionRepo:   sessionRepo,
	}
}

func (s *OAuthService) GetGoogleAuthURL(state string) string {
	return s.oauthProvider.GetAuthURL(state)
}

func (s *OAuthService) HandleGoogleCallback(ctx context.Context, code string) (string, string, error) {
	googleUser, err := s.oauthProvider.ExchangeCodeForUser(ctx, code)
	if err != nil {
		return "", "", fmt.Errorf("gagal mendapatkan profil oauth: %w", err)
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
			return "", "", fmt.Errorf("gagal menyimpar user OAuth ke DB: %w", err)
		}
		user = newUser
	}

	accessToken, err := s.jwtUtil.GenerateAccessToken(user.ID)
	if err != nil {
		return "", "", fmt.Errorf("gagal generate JWT token: %w", err)
	}

	refreshTokenSession, err := generateRefreshToken(user.ID)
	if err != nil {
		return "", "", fmt.Errorf("gagal generate refresh token: %w", err)
	}
	
	if err := s.sessionRepo.Save(ctx, refreshTokenSession); err != nil {
		return "", "", fmt.Errorf("gagal menyimpan refresh token ke redis: %w", err)
	}

	return refreshTokenSession.Token, accessToken, nil
}