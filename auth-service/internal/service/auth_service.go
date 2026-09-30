package service

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"time"

	models "github.com/DXR3IN/auth-service/internal/domain"
	"github.com/DXR3IN/auth-service/internal/utils"
	"github.com/DXR3IN/auth-service/pkg/logger"
)

var (
	ErrUserExists         = errors.New("email sudah terdaftar di sistem")
	ErrInvalidCredentials = errors.New("email atau kata sandi tidak cocok")
	ErrInvalidSubjectID   = errors.New("token subject is not a valid user ID")
	ErrUserNotFound       = errors.New("pengguna tidak ditemukan")
	ErrInvalidOldPassword = errors.New("kata sandi saat ini salah")
)

const (
	refreshTokenDuration = 30 * 24 * time.Hour
	defaultPicture       = models.DefaultPicture
)

type AuthService struct {
	repo        models.UserRepository
	jwt         models.TokenManager
	sessionRepo models.SessionRepository
}

type AuthResult struct {
	User         *models.User
	AccessToken  string
	RefreshToken string
}

func NewAuthService(r models.UserRepository, jwt models.TokenManager, sessionRepo models.SessionRepository) *AuthService {
	return &AuthService{repo: r, jwt: jwt, sessionRepo: sessionRepo}
}

func generateRefreshToken(userID string) (*models.RefreshTokenSession, error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return nil, err
	}

	tokenStr := hex.EncodeToString(b)
	return models.NewRefreshTokenSession(tokenStr, userID, "", refreshTokenDuration), nil
}

func (s *AuthService) Register(ctx context.Context, name, email, password, tier string, deviceName string) (*AuthResult, error) {
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

	subTier := models.ParseStageTier(tier)
	newUser, err := models.NewUser("", name, email, hashed, subTier, "local")
	if err != nil {
		return nil, err
	}

	if err := s.repo.Create(newUser); err != nil {
		return nil, err
	}

	token, err := s.jwt.GenerateAccessToken(newUser)
	if err != nil {
		return nil, err
	}
	refreshToken, err := generateRefreshToken(newUser.ID)
	if err != nil {
		return nil, err
	}
	refreshToken.DeviceName = deviceName

	_ = s.sessionRepo.EnforceMaxDevices(ctx, newUser.ID, newUser.MaxAllowedDevices())

	if err := s.sessionRepo.Save(ctx, refreshToken); err != nil {
		return nil, err
	}

	return &AuthResult{User: newUser, AccessToken: token, RefreshToken: refreshToken.Token}, nil
}

func (s *AuthService) Login(ctx context.Context, email, password string, deviceName string) (*AuthResult, error) {
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

	token, err := s.jwt.GenerateAccessToken(u)
	if err != nil {
		return nil, err
	}

	refreshToken, err := generateRefreshToken(u.ID)
	if err != nil {
		return nil, err
	}
	refreshToken.DeviceName = deviceName

	_ = s.sessionRepo.EnforceMaxDevices(ctx, u.ID, u.MaxAllowedDevices())

	if err := s.sessionRepo.Save(ctx, refreshToken); err != nil {
		return nil, err
	}

	return &AuthResult{User: u, AccessToken: token, RefreshToken: refreshToken.Token}, nil
}

func (s *AuthService) DemoLogin(ctx context.Context, persona string, deviceName string) (*AuthResult, error) {
	var (
		demoEmail  string
		demoName   string
		demoRole   string
		demoTier   string
		watchHours float64
	)

	switch persona {
	case "hafiz":
		demoEmail = "hafiz@liveeuy.id"
		demoName = "Hafiz Muhammad"
		demoRole = "admin"
		demoTier = "vip"
		watchHours = 48.5
	case "budi":
		demoEmail = "budi@liveeuy.id"
		demoName = "Budi Santoso"
		demoRole = "user"
		demoTier = "standard"
		watchHours = 12.0
	default:
		return nil, fmt.Errorf("persona '%s' tidak dikenali (gunakan 'hafiz' atau 'budi')", persona)
	}

	user, err := s.repo.FindByEmail(demoEmail)
	if err != nil {
		return nil, err
	}

	subTier := models.ParseStageTier(demoTier)
	if user == nil {
		hashed, _ := utils.HashPassword("LiveEuy#2026")
		newUser, err := models.NewUser("", demoName, demoEmail, hashed, subTier, "demo")
		if err != nil {
			return nil, err
		}
		newUser.Role = demoRole
		newUser.WatchHours = watchHours
		if err := s.repo.Create(newUser); err != nil {
			return nil, err
		}
		user = newUser
	} else {
		// Pastikan data role & tier persona terupdate
		user.Role = demoRole
		user.UpgradeTier(subTier)
		user.WatchHours = watchHours
		_ = s.repo.Update(user)
	}

	token, err := s.jwt.GenerateAccessToken(user)
	if err != nil {
		return nil, err
	}

	refreshToken, err := generateRefreshToken(user.ID)
	if err != nil {
		return nil, err
	}
	refreshToken.DeviceName = deviceName

	_ = s.sessionRepo.EnforceMaxDevices(ctx, user.ID, user.MaxAllowedDevices())

	if err := s.sessionRepo.Save(ctx, refreshToken); err != nil {
		return nil, err
	}

	return &AuthResult{User: user, AccessToken: token, RefreshToken: refreshToken.Token}, nil
}

func (s *AuthService) RefreshToken(ctx context.Context, oldRefreshToken string, deviceName string) (*models.User, string, string, error) {
	if oldRefreshToken == "" {
		return nil, "", "", errors.New("refresh token wajib disertakan")
	}

	session, err := s.sessionRepo.Get(ctx, oldRefreshToken)
	if err != nil {
		return nil, "", "", errors.New("refresh token tidak valid atau sudah kedaluwarsa")
	}

	if session.IsRevoked {
		_ = s.sessionRepo.Revoke(ctx, oldRefreshToken)
		return nil, "", "", errors.New("refresh token sudah dicabut")
	}

	if session.DeviceName != "" && deviceName != "" && session.DeviceName != deviceName {
		_ = s.sessionRepo.RevokeAllUserTokens(ctx, session.UserID)
	}

	if err := s.sessionRepo.Revoke(ctx, oldRefreshToken); err != nil {
		return nil, "", "", fmt.Errorf("gagal menghapus token lama: %w", err)
	}

	user, err := s.repo.FindByID(session.UserID)
	if err != nil || user == nil {
		return nil, "", "", errors.New("pengguna tidak ditemukan")
	}

	newAccessToken, err := s.jwt.GenerateAccessToken(user)
	if err != nil {
		return nil, "", "", err
	}

	newRefreshTokenSession, err := generateRefreshToken(user.ID)
	if err != nil {
		return nil, "", "", err
	}
	newRefreshTokenSession.DeviceName = deviceName

	if err := s.sessionRepo.Save(ctx, newRefreshTokenSession); err != nil {
		return nil, "", "", fmt.Errorf("gagal menyimpan token baru ke redis: %w", err)
	}

	return user, newAccessToken, newRefreshTokenSession.Token, nil
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

func (s *AuthService) UpdateProfile(userID, newName, newPicture string) (*models.User, error) {
	if err := s.repo.EditProfile(userID, newName, newPicture); err != nil {
		return nil, err
	}
	return s.repo.FindByID(userID)
}

func (s *AuthService) UpdateName(userID, newName string) error {
	return s.repo.EditNameByID(userID, newName)
}

func (s *AuthService) ChangePassword(userID, currentPassword, newPassword string) error {
	u, err := s.repo.FindByID(userID)
	if err != nil || u == nil {
		return ErrUserNotFound
	}

	if err := utils.CheckPasswordHash(currentPassword, u.Password); err != nil {
		return ErrInvalidOldPassword
	}

	hashed, err := utils.HashPassword(newPassword)
	if err != nil {
		return err
	}

	if err := u.ChangePassword(hashed); err != nil {
		return err
	}

	return s.repo.EditPasswordByID(userID, hashed)
}

func (s *AuthService) UpdatePassword(userID, newPassword string) error {
	hashed, err := utils.HashPassword(newPassword)
	if err != nil {
		return err
	}
	return s.repo.EditPasswordByID(userID, hashed)
}

func (s *AuthService) ForgotPassword(ctx context.Context, email string) error {
	// Sesuai prinsip keamanan kontrak: selalu sukses untuk cegah Account Enumeration
	user, err := s.repo.FindByEmail(email)
	if err != nil || user == nil {
		return nil
	}
	// Di sistem nyata: generate email reset token dan kirim link via email
	return nil
}

func (s *AuthService) ResetPassword(ctx context.Context, resetToken, newPassword string, userID string) error {
	if resetToken == "" {
		return errors.New("token reset tidak valid")
	}
	user, err := s.repo.FindByID(userID)
	if err != nil || user == nil {
		return nil
	}
	// Di masa depan: validasi token reset dari Redis / DB
	return nil
}

func (s *AuthService) Logout(ctx context.Context, refreshToken string) error {
	if refreshToken == "" {
		return errors.New("refresh token wajib disertakan")
	}

	session, err := s.sessionRepo.Get(ctx, refreshToken)
	if err != nil {
		return errors.New("refresh token tidak valid atau sudah kedaluwarsa")
	}

	if session.IsRevoked {
		return errors.New("refresh token sudah dicabut")
	}

	return s.sessionRepo.Revoke(ctx, refreshToken)
}

func (s *AuthService) LogoutAll(ctx context.Context, userID string) error {
	if userID == "" {
		return errors.New("user ID tidak valid")
	}
	return s.sessionRepo.RevokeAllUserTokens(ctx, userID)
}
