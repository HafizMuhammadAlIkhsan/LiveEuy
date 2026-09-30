package domain

import "time"

// DomainEvent is the common interface for domain events emitted by aggregates.
type DomainEvent interface {
	EventName() string
	OccurredAt() time.Time
}

// UserRegisteredEvent is dispatched when a new user finishes registration.
type UserRegisteredEvent struct {
	UserID     string    `json:"user_id"`
	Email      string    `json:"email"`
	Tier       string    `json:"tier"`
	Provider   string    `json:"provider"`
	DeviceName string    `json:"device_name"`
	Timestamp  time.Time `json:"timestamp"`
}

func (e UserRegisteredEvent) EventName() string   { return "UserRegistered" }
func (e UserRegisteredEvent) OccurredAt() time.Time { return e.Timestamp }

// UserLoggedInEvent is dispatched when a user successfully authenticates.
type UserLoggedInEvent struct {
	UserID     string    `json:"user_id"`
	Email      string    `json:"email"`
	DeviceName string    `json:"device_name"`
	Timestamp  time.Time `json:"timestamp"`
}

func (e UserLoggedInEvent) EventName() string   { return "UserLoggedIn" }
func (e UserLoggedInEvent) OccurredAt() time.Time { return e.Timestamp }

// PasswordChangedEvent is dispatched when a user updates their security credential.
type PasswordChangedEvent struct {
	UserID    string    `json:"user_id"`
	Timestamp time.Time `json:"timestamp"`
}

func (e PasswordChangedEvent) EventName() string   { return "PasswordChanged" }
func (e PasswordChangedEvent) OccurredAt() time.Time { return e.Timestamp }

// SessionRevokedEvent is dispatched when a token session is terminated.
type SessionRevokedEvent struct {
	UserID    string    `json:"user_id"`
	Token     string    `json:"token"`
	Timestamp time.Time `json:"timestamp"`
}

func (e SessionRevokedEvent) EventName() string   { return "SessionRevoked" }
func (e SessionRevokedEvent) OccurredAt() time.Time { return e.Timestamp }
