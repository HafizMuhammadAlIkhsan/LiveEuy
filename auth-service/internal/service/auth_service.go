package service

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"time"

	models "github.com/DXR3IN/auth-service/internal/domain"
	"github.com/DXR3IN/auth-service/internal/repository"
	"github.com/DXR3IN/auth-service/internal/utils"
	"github.com/DXR3IN/auth-service/pkg/logger"
)

var (
	ErrUserExists         = errors.New("user already exists")
	ErrInvalidCredentials = errors.New("invalid credentials")
	ErrInvalidSubjectID   = errors.New("token subject is not a valid user ID")
)

const refreshTokenDuration = 7 * 24 * time.Hour

type AuthService struct {
	repo        repository.UserRepository
	jwt         models.TokenManager
	sessionRepo models.SessionRepository
}

type authResponse struct {
	AccessToken  string
	RefreshToken string
	Name         string
	Email        string
	CreatedAt    time.Time
}

func NewAuthService(r repository.UserRepository, jwt models.TokenManager, sessionRepo models.SessionRepository) *AuthService {
	return &AuthService{repo: r, jwt: jwt, sessionRepo: sessionRepo}
}

func generateRefreshToken(userID string) (*models.RefreshTokenSession, error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return nil, err
	}

	tokenStr := hex.EncodeToString(b)

	session := &models.RefreshTokenSession{
		Token:     tokenStr,
		UserID:    userID,
		ExpiresAt: time.Now().Add(refreshTokenDuration),
		IsRevoked: false,
	}

	return session, nil
}

func (s *AuthService) Register(ctx context.Context, name, email, password string, deviceName string) (*authResponse, error) {
	ex, err := s.repo.FindByEmail(email)
	if err != nil {
		return nil, err
	}
	if ex != nil {
		return nil, ErrUserExists
	}

	hashed, err := utils.HashPassword(password)
	if err != nil {
		return nil, err
	}

	u := &repository.User{Name: name, Email: email, Password: hashed}
	if err := s.repo.Create(u.ToDomain()); err != nil {
		return nil, err
	}

	token, err := s.jwt.GenerateAccessToken(u.ID)
	if err != nil {
		return nil, err
	}
	refreshToken, err := generateRefreshToken(u.ID)
	if err != nil {
		return nil, err
	}
	refreshToken.DeviceName = deviceName

	if err := s.sessionRepo.Save(ctx, refreshToken); err != nil {
		return nil, err
	}

	return &authResponse{AccessToken: token, RefreshToken: refreshToken.Token, Name: u.Name, Email: u.Email, CreatedAt: u.CreatedAt}, nil
}

func (s *AuthService) Login(ctx context.Context, email, password string, deviceName string) (*authResponse, error) {
	u, err := s.repo.FindByEmail(email)
	if err != nil {
		return nil, err
	}
	if u == nil {
		return nil, ErrInvalidCredentials
	}

	if err := utils.CheckPasswordHash(password, u.Password); err != nil {
		return nil, ErrInvalidCredentials
	}

	token, err := s.jwt.GenerateAccessToken(u.ID)
	if err != nil {
		return nil, err
	}

	refreshToken, err := generateRefreshToken(u.ID)
	if err != nil {
		return nil, err
	}
	refreshToken.DeviceName = deviceName

	if err := s.sessionRepo.Save(ctx, refreshToken); err != nil {
		return nil, err
	}

	return &authResponse{AccessToken: token, RefreshToken: refreshToken.Token, Name: u.Name, Email: u.Email, CreatedAt: u.CreatedAt}, nil
}

func (s *AuthService) RefreshToken(ctx context.Context, oldRefreshToken string, deviceName string) (string, string, error) {
	session, err := s.sessionRepo.Get(ctx, oldRefreshToken)
	if err != nil {
		return "", "", err
	}

	if session.IsRevoked {
		_ = s.sessionRepo.Revoke(ctx, oldRefreshToken)
		return "", "", errors.New("refresh token sudah dicabut")
	}

	if session.DeviceName != deviceName {
		_ = s.sessionRepo.RevokeAllUserTokens(ctx, session.UserID)
	}

	if err := s.sessionRepo.Revoke(ctx, oldRefreshToken); err != nil {
		return "", "", fmt.Errorf("gagal menghapus token lama: %w", err)
	}

	newAccessToken, err := s.jwt.GenerateAccessToken(session.UserID)
	if err != nil {
		return "", "", err
	}

	newRefreshTokenSession, err := generateRefreshToken(session.UserID)
	if err != nil {
		return "", "", err
	}
	newRefreshTokenSession.DeviceName = deviceName

	if err := s.sessionRepo.Save(ctx, newRefreshTokenSession); err != nil {
		return "", "", fmt.Errorf("gagal menyimpan token baru ke redis: %w", err)
	}

	return newAccessToken, newRefreshTokenSession.Token, nil
}

func (s *AuthService) GetUserDataByID(userID string) (*models.User, error) {
	u, err := s.repo.FindByID(userID)
	if err != nil {
		logger.ErrorLogger(err)
		return nil, err
	}
	return u, nil
}

func (s *AuthService) VerifyToken(token string) (string, error) {
	claims, err := s.jwt.Verify(token)
	if err != nil {
		return "", err
	}

	return claims.Subject, nil
}

func (s *AuthService) UpdateName(userID, newName string) error {
	return s.repo.EditNameByID(userID, newName)
}

func (s *AuthService) UpdatePassword(userID, newPassword string) error {
	hashed, err := utils.HashPassword(newPassword)
	if err != nil {
		return err
	}
	return s.repo.EditPasswordByID(userID, hashed)
}
