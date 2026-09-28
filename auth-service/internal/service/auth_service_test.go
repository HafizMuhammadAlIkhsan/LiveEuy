package service

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/DXR3IN/auth-service/internal/domain"
	"github.com/DXR3IN/auth-service/internal/utils"
)

type mockUserRepository struct {
	createFunc           func(u *domain.User) error
	findByEmailFunc      func(email string) (*domain.User, error)
	findByIDFunc         func(id string) (*domain.User, error)
	editPasswordByIDFunc func(id, newPassword string) error
	editNameByIDFunc     func(id, newName string) error
	editProfileFunc      func(id, name, avatar string) error
	updateFunc           func(u *domain.User) error
}

func (m *mockUserRepository) Create(u *domain.User) error {
	if m.createFunc != nil {
		return m.createFunc(u)
	}
	u.ID = "user-123"
	return nil
}

func (m *mockUserRepository) FindByEmail(email string) (*domain.User, error) {
	if m.findByEmailFunc != nil {
		return m.findByEmailFunc(email)
	}
	return nil, nil
}

func (m *mockUserRepository) FindByID(id string) (*domain.User, error) {
	if m.findByIDFunc != nil {
		return m.findByIDFunc(id)
	}
	return nil, nil
}

func (m *mockUserRepository) EditPasswordByID(id, newPassword string) error {
	if m.editPasswordByIDFunc != nil {
		return m.editPasswordByIDFunc(id, newPassword)
	}
	return nil
}

func (m *mockUserRepository) EditNameByID(id, newName string) error {
	if m.editNameByIDFunc != nil {
		return m.editNameByIDFunc(id, newName)
	}
	return nil
}

func (m *mockUserRepository) EditProfile(id, name, avatar string) error {
	if m.editProfileFunc != nil {
		return m.editProfileFunc(id, name, avatar)
	}
	return nil
}

func (m *mockUserRepository) Update(u *domain.User) error {
	if m.updateFunc != nil {
		return m.updateFunc(u)
	}
	return nil
}

type mockTokenManager struct {
	generateAccessTokenFunc func(user *domain.User) (string, error)
	verifyFunc              func(tokenStr string) (*domain.JWTClaims, error)
}

func (m *mockTokenManager) GenerateAccessToken(user *domain.User) (string, error) {
	if m.generateAccessTokenFunc != nil {
		return m.generateAccessTokenFunc(user)
	}
	return "mock-access-token", nil
}

func (m *mockTokenManager) Verify(tokenStr string) (*domain.JWTClaims, error) {
	if m.verifyFunc != nil {
		return m.verifyFunc(tokenStr)
	}
	return &domain.JWTClaims{
		Email: "hafiz@liveeuy.id",
		Role:  "admin",
		Tier:  "VIP Cinema Ultra",
	}, nil
}

type mockSessionRepository struct {
	saveFunc                func(ctx context.Context, session *domain.RefreshTokenSession) error
	getFunc                 func(ctx context.Context, token string) (*domain.RefreshTokenSession, error)
	revokeFunc              func(ctx context.Context, token string) error
	revokeAllUserTokensFunc func(ctx context.Context, userID string) error
	getActiveSessionsFunc   func(ctx context.Context, userID string) ([]*domain.RefreshTokenSession, error)
	enforceMaxDevicesFunc   func(ctx context.Context, userID string, maxDevices int) error
}

func (m *mockSessionRepository) Save(ctx context.Context, session *domain.RefreshTokenSession) error {
	if m.saveFunc != nil {
		return m.saveFunc(ctx, session)
	}
	return nil
}

func (m *mockSessionRepository) Get(ctx context.Context, token string) (*domain.RefreshTokenSession, error) {
	if m.getFunc != nil {
		return m.getFunc(ctx, token)
	}
	return nil, nil
}

func (m *mockSessionRepository) Revoke(ctx context.Context, token string) error {
	if m.revokeFunc != nil {
		return m.revokeFunc(ctx, token)
	}
	return nil
}

func (m *mockSessionRepository) RevokeAllUserTokens(ctx context.Context, userID string) error {
	if m.revokeAllUserTokensFunc != nil {
		return m.revokeAllUserTokensFunc(ctx, userID)
	}
	return nil
}

func (m *mockSessionRepository) GetActiveSessions(ctx context.Context, userID string) ([]*domain.RefreshTokenSession, error) {
	if m.getActiveSessionsFunc != nil {
		return m.getActiveSessionsFunc(ctx, userID)
	}
	return nil, nil
}

func (m *mockSessionRepository) EnforceMaxDevices(ctx context.Context, userID string, maxDevices int) error {
	if m.enforceMaxDevicesFunc != nil {
		return m.enforceMaxDevicesFunc(ctx, userID, maxDevices)
	}
	return nil
}

func TestAuthService_DemoLogin(t *testing.T) {
	ctx := context.Background()

	t.Run("success hafiz persona", func(t *testing.T) {
		userRepo := &mockUserRepository{}
		jwtMgr := &mockTokenManager{}
		sessionRepo := &mockSessionRepository{}

		svc := NewAuthService(userRepo, jwtMgr, sessionRepo)
		res, err := svc.DemoLogin(ctx, "hafiz", "test-agent")
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}
		if res.User.Email != "hafiz@liveeuy.id" {
			t.Fatalf("expected hafiz@liveeuy.id, got %s", res.User.Email)
		}
		if res.User.Role != "admin" {
			t.Fatalf("expected role admin, got %s", res.User.Role)
		}
	})

	t.Run("success budi persona", func(t *testing.T) {
		userRepo := &mockUserRepository{}
		jwtMgr := &mockTokenManager{}
		sessionRepo := &mockSessionRepository{}

		svc := NewAuthService(userRepo, jwtMgr, sessionRepo)
		res, err := svc.DemoLogin(ctx, "budi", "test-agent")
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}
		if res.User.Email != "budi@liveeuy.id" {
			t.Fatalf("expected budi@liveeuy.id, got %s", res.User.Email)
		}
		if res.User.Role != "user" {
			t.Fatalf("expected role user, got %s", res.User.Role)
		}
	})

	t.Run("invalid persona", func(t *testing.T) {
		svc := NewAuthService(&mockUserRepository{}, &mockTokenManager{}, &mockSessionRepository{})
		_, err := svc.DemoLogin(ctx, "unknown_persona", "test-agent")
		if err == nil {
			t.Fatalf("expected error for unknown persona, got nil")
		}
	})
}

func TestAuthService_RegisterAndLogin(t *testing.T) {
	ctx := context.Background()
	hashedPwd, _ := utils.HashPassword("secret123")

	t.Run("success register with device enforcement", func(t *testing.T) {
		enforced := false
		userRepo := &mockUserRepository{}
		jwtMgr := &mockTokenManager{}
		sessionRepo := &mockSessionRepository{
			enforceMaxDevicesFunc: func(ctx context.Context, userID string, maxDevices int) error {
				enforced = true
				if maxDevices != 4 {
					t.Fatalf("expected maxDevices 4 for VIP Cinema Ultra, got %d", maxDevices)
				}
				return nil
			},
		}

		svc := NewAuthService(userRepo, jwtMgr, sessionRepo)
		res, err := svc.Register(ctx, "John", "john@example.com", "secret123", "VIP Cinema Ultra", "agent")
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}
		if res.User.Tier != "VIP Cinema Ultra" {
			t.Fatalf("expected tier VIP Cinema Ultra, got %s", res.User.Tier)
		}
		if !enforced {
			t.Fatalf("expected EnforceMaxDevices to be called")
		}
	})

	t.Run("success login with FIFO eviction", func(t *testing.T) {
		enforced := false
		userRepo := &mockUserRepository{
			findByEmailFunc: func(email string) (*domain.User, error) {
				return &domain.User{
					ID:       "usr-1",
					Name:     "John",
					Email:    email,
					Password: hashedPwd,
					Role:     "user",
					Tier:     "VIP Standard",
					Devices:  2,
				}, nil
			},
		}
		jwtMgr := &mockTokenManager{}
		sessionRepo := &mockSessionRepository{
			enforceMaxDevicesFunc: func(ctx context.Context, userID string, maxDevices int) error {
				enforced = true
				if maxDevices != 2 {
					t.Fatalf("expected maxDevices 2, got %d", maxDevices)
				}
				return nil
			},
		}

		svc := NewAuthService(userRepo, jwtMgr, sessionRepo)
		res, err := svc.Login(ctx, "john@example.com", "secret123", "agent")
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}
		if res.AccessToken == "" || res.RefreshToken == "" {
			t.Fatalf("expected tokens returned")
		}
		if !enforced {
			t.Fatalf("expected EnforceMaxDevices to be called during login")
		}
	})
}

func TestAuthService_ChangePassword(t *testing.T) {
	hashedPwd, _ := utils.HashPassword("OldPassword123")
	userRepo := &mockUserRepository{
		findByIDFunc: func(id string) (*domain.User, error) {
			return &domain.User{
				ID:       id,
				Password: hashedPwd,
			}, nil
		},
		editPasswordByIDFunc: func(id, newPassword string) error {
			return nil
		},
	}

	svc := NewAuthService(userRepo, &mockTokenManager{}, &mockSessionRepository{})

	t.Run("success change password", func(t *testing.T) {
		err := svc.ChangePassword("user-1", "OldPassword123", "NewPassword123")
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}
	})

	t.Run("wrong current password", func(t *testing.T) {
		err := svc.ChangePassword("user-1", "WrongOldPassword", "NewPassword123")
		if !errors.Is(err, ErrInvalidOldPassword) {
			t.Fatalf("expected ErrInvalidOldPassword, got %v", err)
		}
	})
}

func TestAuthService_Logout(t *testing.T) {
	ctx := context.Background()

	t.Run("success single logout", func(t *testing.T) {
		revoked := false
		sessionRepo := &mockSessionRepository{
			getFunc: func(ctx context.Context, token string) (*domain.RefreshTokenSession, error) {
				return &domain.RefreshTokenSession{
					Token:     token,
					UserID:    "user-1",
					ExpiresAt: time.Now().Add(1 * time.Hour),
					IsRevoked: false,
				}, nil
			},
			revokeFunc: func(ctx context.Context, token string) error {
				revoked = true
				return nil
			},
		}

		svc := NewAuthService(&mockUserRepository{}, &mockTokenManager{}, sessionRepo)
		err := svc.Logout(ctx, "valid-token")
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}
		if !revoked {
			t.Fatalf("expected token to be revoked")
		}
	})

	t.Run("error token not found", func(t *testing.T) {
		sessionRepo := &mockSessionRepository{
			getFunc: func(ctx context.Context, token string) (*domain.RefreshTokenSession, error) {
				return nil, errors.New("not found")
			},
		}

		svc := NewAuthService(&mockUserRepository{}, &mockTokenManager{}, sessionRepo)
		err := svc.Logout(ctx, "nonexistent-token")
		if err == nil {
			t.Fatalf("expected error, got nil")
		}
	})
}

func TestAuthService_LogoutAll(t *testing.T) {
	ctx := context.Background()

	t.Run("success logout all", func(t *testing.T) {
		revokedAll := false
		sessionRepo := &mockSessionRepository{
			revokeAllUserTokensFunc: func(ctx context.Context, userID string) error {
				if userID == "user-123" {
					revokedAll = true
					return nil
				}
				return errors.New("unexpected user ID")
			},
		}

		svc := NewAuthService(&mockUserRepository{}, &mockTokenManager{}, sessionRepo)
		err := svc.LogoutAll(ctx, "user-123")
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}
		if !revokedAll {
			t.Fatalf("expected all user tokens to be revoked")
		}
	})
}
