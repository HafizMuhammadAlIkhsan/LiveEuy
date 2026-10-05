package domain

import (
	"context"
	"time"

	"github.com/DXR3IN/auth-service/internal/config"
)

// RefreshTokenSession represents an active session grant bound to a device.
type RefreshTokenSession struct {
	Token      	string    	`json:"token"`
	UserID     	string    	`json:"user_id"`
	CreatedAt  	time.Time 	`json:"created_at"`
	ExpiresAt  	time.Time 	`json:"expires_at"`
	IsRevoked  	bool      	`json:"is_revoked"`
	DeviceName 	string    	`json:"device_name"`
}

type GuestSession struct {
	GuestID				string		`json:"guest_id"`
	DeviceFingerprint	string		`json:"device_fingerprint"`
	SecondsWatched		int			`json:"second_watched"`
	MaxSeconds 			int 		`json:"max_seconds"`
	CreatedAt			time.Time	`json:"created_at"`
	ExpiresAt			time.Time	`json:"expires_at"`
}

type PinType string

const (
	PinRegister			PinType		=	config.PIN_TYPE_REGISTER
	PinForgotPassword	PinType		=	config.PIN_TYPE_FORGOT_PASS
)

type PinSession struct {
	Email				string		`json:"email"`
	CreatedAt			time.Time	`json:"created_at"`
	ExpiresAt			time.Time	`json:"expires_at"`
	Pin 				int16		`json:"pin"`
	PinType				PinType		`json:"pin_type"`	
}

// NewRefreshTokenSession constructs a new RefreshTokenSession.
func NewRefreshTokenSession(token, userID, deviceName string, ttl time.Duration) *RefreshTokenSession {
	now := time.Now()
	return &RefreshTokenSession{
		Token:      token,
		UserID:     userID,
		CreatedAt:  now,
		ExpiresAt:  now.Add(ttl),
		IsRevoked:  false,
		DeviceName: deviceName,
	}
}

func NewPinSession(email string, pin int16) *PinSession {
	now := time.Now()
	return &PinSession{
		Email: email,
		CreatedAt: time.Now(),
		ExpiresAt: now.Add(15*time.Minute),
		Pin: pin,
	}
}

// IsExpired returns true if the session has passed its expiration time.
func (s *RefreshTokenSession) IsExpired() bool {
	return time.Now().After(s.ExpiresAt)
}

// IsValid returns true if the session is currently active and not revoked.
func (s *RefreshTokenSession) IsValid() bool {
	return !s.IsRevoked && !s.IsExpired()
}

// Revoke terminates the validity of this session.
func (s *RefreshTokenSession) Revoke() {
	s.IsRevoked = true
}

func (g *GuestSession) HasRemainingWatchTime() bool {
	if g.MaxSeconds <= 0 {
		return true
	}
	return g.SecondsWatched < g.MaxSeconds
}

func (g *GuestSession) RemainingSeconds() int {
	if g.MaxSeconds <= 0 {
		return -1
	}
	rem := g.MaxSeconds - g.SecondsWatched
	if rem < 0 {
		return 0
	}

	return rem
}

// SessionRepository is the Domain Port for storing and querying active sessions.
type SessionRepository interface {
	Save(ctx context.Context, session *RefreshTokenSession) error	
	Get(ctx context.Context, token string) (*RefreshTokenSession, error)
	Revoke(ctx context.Context, token string) error
	RevokeAllUserTokens(ctx context.Context, userID string) error
	GetActiveSessions(ctx context.Context, userID string) ([]*RefreshTokenSession, error)
	EnforceMaxDevices(ctx context.Context, userID string, maxDevices int) error
}

type PinSessionRepository interface {
	SavePinOtp(ctx context.Context, pin *PinSession) error
}

// GuestSession is
type GuestSessionRepository interface {
	GetGuestWatchTime(ctx context.Context, guestID string) (int, error)
	IncrementGuestWatchTime(ctx context.Context, guestID string, deltaSeconds int, ttl time.Duration) (int, error)
	SaveGuestSession(ctx context.Context, session *GuestSession, ttl time.Duration) error
}


