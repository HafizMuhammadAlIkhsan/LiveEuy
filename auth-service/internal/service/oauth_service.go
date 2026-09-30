package service

import (
	"context"
	"fmt"

	"github.com/DXR3IN/auth-service/internal/domain"
)

type OAuthService struct {
	oauthProvider domain.OAuthProvider
	userRepo      domain.UserRepository
	jwtUtil       domain.TokenManager
	sessionRepo   domain.SessionRepository
}

func NewOAuthService(oauthProvider domain.OAuthProvider, userRepo domain.UserRepository, jwtUtil domain.TokenManager, sessionRepo domain.SessionRepository) *OAuthService {
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
	if err != nil || user == nil {
		newUser, err := domain.NewOAuthUser("", googleUser.Name, googleUser.Email, googleUser.Picture, "google")
		if err != nil {
			return "", "", fmt.Errorf("gagal inisialisasi entitas user OAuth: %w", err)
		}

		err = s.userRepo.Create(newUser)
		if err != nil {
			return "", "", fmt.Errorf("gagal menyimpan user OAuth ke DB: %w", err)
		}
		user = newUser
	}

	accessToken, err := s.jwtUtil.GenerateAccessToken(user)
	if err != nil {
		return "", "", fmt.Errorf("gagal generate JWT token: %w", err)
	}

	refreshTokenSession, err := generateRefreshToken(user.ID)
	if err != nil {
		return "", "", fmt.Errorf("gagal generate refresh token: %w", err)
	}

	_ = s.sessionRepo.EnforceMaxDevices(ctx, user.ID, user.MaxAllowedDevices())

	if err := s.sessionRepo.Save(ctx, refreshTokenSession); err != nil {
		return "", "", fmt.Errorf("gagal menyimpan refresh token ke redis: %w", err)
	}

	return refreshTokenSession.Token, accessToken, nil
}