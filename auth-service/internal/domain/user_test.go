package domain_test

import (
	"testing"
	"time"

	"github.com/DXR3IN/auth-service/internal/domain"
)

func TestStageTier_MaxDevices(t *testing.T) {
	tests := []struct {
		name     string
		rawTier  string
		expected int
	}{
		{"Free Guest has 1 device", "guest", 1},
		{"VIP has 4 devices", "vip", 4},
		{"Empty fallback to VIP Standard (2 devices)", "standard", 2},
		{"Unknown fallback to VIP Standard (2 devices)", "standard", 2},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			tier := domain.ParseStageTier(tt.rawTier)
			if tier.MaxDevices() != tt.expected {
				t.Errorf("expected max devices %d, got %d for tier '%s'", tt.expected, tier.MaxDevices(), tt.rawTier)
			}
		})
	}
}

func TestEmailAddress_Validation(t *testing.T) {
	tests := []struct {
		name      string
		raw       string
		expectErr bool
		expected  string
	}{
		{"Valid email", "user@liveeuy.id", false, "user@liveeuy.id"},
		{"Uppercase and whitespace normalized", "  Hafiz@LiveEuy.ID  ", false, "hafiz@liveeuy.id"},
		{"Missing @", "userliveeuy.id", true, ""},
		{"Missing domain extension", "user@liveeuy", true, ""},
		{"Empty email", "  ", true, ""},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			emailVO, err := domain.NewEmailAddress(tt.raw)
			if (err != nil) != tt.expectErr {
				t.Fatalf("expected error: %v, got: %v", tt.expectErr, err)
			}
			if !tt.expectErr && emailVO.String() != tt.expected {
				t.Errorf("expected %s, got %s", tt.expected, emailVO.String())
			}
		})
	}
}

func TestUserRole_Behavior(t *testing.T) {
	adminRole := domain.ParseUserRole("admin")
	if !adminRole.IsAdmin() {
		t.Errorf("expected admin role to return true for IsAdmin()")
	}

	userRole := domain.ParseUserRole("user")
	if userRole.IsAdmin() {
		t.Errorf("expected standard user role to return false for IsAdmin()")
	}

	fallbackRole := domain.ParseUserRole("unknown")
	if fallbackRole.String() != "user" {
		t.Errorf("expected unknown role to fallback to 'user', got '%s'", fallbackRole.String())
	}
}

func TestNewUser_AggregateFactory(t *testing.T) {
	t.Run("Valid User Creation", func(t *testing.T) {
		u, err := domain.NewUser("", "Hafiz Muhammad", "Hafiz@LiveEuy.ID", "$2a$10$hashedpass", domain.StageVIP, "local")
		if err != nil {
			t.Fatalf("unexpected error creating user: %v", err)
		}

		if u.ID == "" {
			t.Errorf("expected non-empty UUID")
		}
		if u.Name != "Hafiz Muhammad" {
			t.Errorf("expected name 'Hafiz Muhammad', got '%s'", u.Name)
		}
		if u.Email != "hafiz@liveeuy.id" {
			t.Errorf("expected normalized email 'hafiz@liveeuy.id', got '%s'", u.Email)
		}
		if u.Stage != "vip" {
			t.Errorf("expected tier 'VIP Cinema Ultra', got '%s'", u.Stage)
		}
		if u.Devices != 4 {
			t.Errorf("expected 4 devices for VIP Cinema Ultra, got %d", u.Devices)
		}
		if u.Picture != domain.DefaultPicture {
			t.Errorf("expected default picture, got '%s'", u.Picture)
		}
	})

	t.Run("Empty Name Rejected", func(t *testing.T) {
		_, err := domain.NewUser("", "   ", "valid@email.com", "hash", domain.StageStandard, "local")
		if err == nil {
			t.Fatal("expected error for empty name, got nil")
		}
	})

	t.Run("Invalid Email Rejected", func(t *testing.T) {
		_, err := domain.NewUser("", "Budi", "invalid-email", "hash", domain.StageStandard, "local")
		if err == nil {
			t.Fatal("expected error for invalid email, got nil")
		}
	})
}

func TestUser_AggregateMethods(t *testing.T) {
	u, err := domain.NewUser("usr-1", "Budi Santoso", "budi@liveeuy.id", "$2a$10$oldhash", domain.StageStandard, "local")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	// 1. Initial State: Free Guest allows 1 device
	if u.MaxAllowedDevices() != 1 {
		t.Errorf("expected 1 max device, got %d", u.MaxAllowedDevices())
	}
	if !u.CanAddDevice(0) {
		t.Errorf("expected CanAddDevice(0) to be true for max 1")
	}
	if u.CanAddDevice(1) {
		t.Errorf("expected CanAddDevice(1) to be false when 1 session already exists")
	}

	// 2. Upgrade Tier to vip
	u.UpgradeTier(domain.StageGuest)
	if u.Stage != "vip" {
		t.Errorf("expected updated tier 'vip', got '%s'", u.Stage)
	}
	if u.MaxAllowedDevices() != 4 {
		t.Errorf("expected updated max devices 4, got %d", u.MaxAllowedDevices())
	}
	if !u.CanAddDevice(3) {
		t.Errorf("expected CanAddDevice(3) to be true for max 4")
	}

	// 3. Change Password Invariant
	if err := u.ChangePassword(""); err == nil {
		t.Errorf("expected error when setting empty password hash")
	}
	if err := u.ChangePassword("$2a$10$newhash"); err != nil {
		t.Fatalf("unexpected error changing password: %v", err)
	}
	if u.Password != "$2a$10$newhash" {
		t.Errorf("expected password updated to '$2a$10$newhash'")
	}

	// 4. Update Profile
	if err := u.UpdateProfile("", "new-pic.jpg"); err == nil {
		t.Errorf("expected error updating empty name")
	}
	if err := u.UpdateProfile("Budi S.", "new-pic.jpg"); err != nil {
		t.Fatalf("unexpected error updating profile: %v", err)
	}
	if u.Name != "Budi S." || u.Picture != "new-pic.jpg" {
		t.Errorf("expected updated name and picture")
	}
}

func TestRefreshTokenSession_Lifecycle(t *testing.T) {
	ttl := 10 * time.Minute
	session := domain.NewRefreshTokenSession("token-xyz", "usr-1", "Chrome Windows", ttl)

	if !session.IsValid() {
		t.Errorf("expected newly created session to be valid")
	}
	if session.IsExpired() {
		t.Errorf("expected newly created session not to be expired")
	}

	// Revoke
	session.Revoke()
	if session.IsValid() {
		t.Errorf("expected revoked session to be invalid")
	}

	// Expired session test
	expiredSession := domain.NewRefreshTokenSession("token-exp", "usr-1", "Firefox", -1*time.Minute)
	if !expiredSession.IsExpired() {
		t.Errorf("expected session with negative ttl to be expired")
	}
	if expiredSession.IsValid() {
		t.Errorf("expected expired session to be invalid")
	}
}
