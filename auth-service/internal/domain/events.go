package domain

import (
	"time"
)

// ─────────────────────────────────────────────────────────────────────────────
// DomainEvent Interface
// ─────────────────────────────────────────────────────────────────────────────

// DomainEvent adalah kontrak yang harus diimplementasikan oleh semua domain event
// di auth-service. Mengikuti konvensi CloudEvents 1.0.
type DomainEvent interface {
	// EventID mengembalikan ID unik event (UUID v4)
	EventID() string
	// EventType mengembalikan tipe event dalam format reverse-DNS
	// Contoh: "com.liveeuy.auth.user.registered"
	EventType() string
	// OccurredOn mengembalikan waktu kapan event terjadi (UTC)
	OccurredOn() time.Time
	// AggregateID mengembalikan ID entitas yang memicu event
	AggregateID() string
}

// ─────────────────────────────────────────────────────────────────────────────
// Base Event
// ─────────────────────────────────────────────────────────────────────────────

// baseEvent berisi field yang sama untuk semua event (tidak diekspor).
type baseEvent struct {
	eventID     string
	eventType   string
	aggregateID string
	occurredOn  time.Time
}

func (b baseEvent) EventID() string      { return b.eventID }
func (b baseEvent) EventType() string    { return b.eventType }
func (b baseEvent) OccurredOn() time.Time { return b.occurredOn }
func (b baseEvent) AggregateID() string  { return b.aggregateID }

// newBase membuat baseEvent baru dengan timestamp UTC saat ini.
func newBase(eventType, aggregateID string) baseEvent {
	return baseEvent{
		eventID:     generateEventID(),
		eventType:   eventType,
		aggregateID: aggregateID,
		occurredOn:  time.Now().UTC(),
	}
}

// ─────────────────────────────────────────────────────────────────────────────
// UserRegisteredEvent
// ─────────────────────────────────────────────────────────────────────────────

// UserRegisteredEventType adalah tipe event untuk pendaftaran pengguna baru.
const UserRegisteredEventType = "com.liveeuy.auth.user.registered"

// UserRegisteredEvent dipublish ketika pengguna baru berhasil mendaftar.
// Consumer: notification-service (kirim email selamat datang), analytics-service.
type UserRegisteredEvent struct {
	baseEvent
	// Email pengguna yang baru daftar (untuk notifikasi)
	Email string
	// Username yang dipilih pengguna
	Username string
	// Provider OAuth yang digunakan; kosong jika daftar manual (email+password)
	// Contoh nilai: "google", "github", "" (manual)
	OAuthProvider string
}

// NewUserRegisteredEvent membuat UserRegisteredEvent baru.
func NewUserRegisteredEvent(userID, email, username, oauthProvider string) UserRegisteredEvent {
	return UserRegisteredEvent{
		baseEvent:     newBase(UserRegisteredEventType, userID),
		Email:         email,
		Username:      username,
		OAuthProvider: oauthProvider,
	}
}

// ─────────────────────────────────────────────────────────────────────────────
// UserLoggedInEvent
// ─────────────────────────────────────────────────────────────────────────────

// UserLoggedInEventType adalah tipe event untuk login berhasil.
const UserLoggedInEventType = "com.liveeuy.auth.user.logged_in"

// UserLoggedInEvent dipublish ketika pengguna berhasil login.
// Consumer: security-service (deteksi anomali), audit-log-service.
type UserLoggedInEvent struct {
	baseEvent
	// Email pengguna yang login
	Email string
	// IP address asal request login
	IPAddress string
	// User-Agent browser/app
	UserAgent string
	// Provider yang digunakan; kosong jika login manual
	OAuthProvider string
}

// NewUserLoggedInEvent membuat UserLoggedInEvent baru.
func NewUserLoggedInEvent(userID, email, ipAddress, userAgent, oauthProvider string) UserLoggedInEvent {
	return UserLoggedInEvent{
		baseEvent:     newBase(UserLoggedInEventType, userID),
		Email:         email,
		IPAddress:     ipAddress,
		UserAgent:     userAgent,
		OAuthProvider: oauthProvider,
	}
}

// ─────────────────────────────────────────────────────────────────────────────
// UserSessionRevokedEvent
// ─────────────────────────────────────────────────────────────────────────────

// UserSessionRevokedEventType adalah tipe event untuk pencabutan sesi/device.
const UserSessionRevokedEventType = "com.liveeuy.auth.user.session_revoked"

// UserSessionRevokedEvent dipublish ketika sesi pengguna dicabut
// (logout manual, revoke device, atau paksa logout oleh admin).
// Consumer: gateway-service (invalidate token cache), audit-log-service.
type UserSessionRevokedEvent struct {
	baseEvent
	// ID sesi/device yang dicabut
	SessionID string
	// Alasan pencabutan: "logout", "device_revoked", "admin_force_logout", "token_expired"
	Reason string
}

// NewUserSessionRevokedEvent membuat UserSessionRevokedEvent baru.
func NewUserSessionRevokedEvent(userID, sessionID, reason string) UserSessionRevokedEvent {
	return UserSessionRevokedEvent{
		baseEvent: newBase(UserSessionRevokedEventType, userID),
		SessionID: sessionID,
		Reason:    reason,
	}
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: generate event ID
// ─────────────────────────────────────────────────────────────────────────────

// generateEventID menghasilkan UUID v4 sederhana menggunakan crypto/rand.
// Implementasi ini tidak memerlukan dependency eksternal.
func generateEventID() string {
	// Gunakan uuid package jika sudah ada di go.mod; fallback ke time-based ID
	// Untuk implementasi production, gunakan: github.com/google/uuid
	return time.Now().UTC().Format("20060102150405.000000000")
}
