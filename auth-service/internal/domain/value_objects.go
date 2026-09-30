package domain

import (
	"errors"
	"regexp"
	"strings"
)

// SubscriptionTier is a Value Object representing the streaming membership tier.
type AuthStage string

const (
	StageGuest      AuthStage = "guest"
	StageStandard       AuthStage = "standard"
	StageVIP    	   AuthStage = "vip"
)

type Entitlements struct {
	Stage 				AuthStage	`json:"stage"`
	MaxWatchSeconds		int			`json:"maxWatchSeconds"`
	MaxResolution		string		`json:"maxResolution"`
	AdsEnabled			bool		`json:"adsEnables"`
	MaxDevices			int			`json:"maxDevices"`
	CanDownload			bool		`json:"canDownload"`
	ExclusiveAccess		bool		`json:"exclusiveAccess"`
}

// ParseSubscriptionTier converts a raw string into a valid SubscriptionTier with fallback.
func ParseStageTier(s string) AuthStage {
	switch strings.TrimSpace(s) {
	case string(StageGuest):
		return StageGuest
	case string(StageStandard):
		return StageStandard
	case string(StageVIP):
		return StageVIP
	default:
		return StageGuest
	}
}

// String returns the string representation of the tier.
func (t AuthStage) String() string {
	if t == "" {
		return string(StageGuest)
	}
	return string(t)
}

func (t AuthStage) MaxDevices() int {
	switch t {
		case StageGuest:
			return 1
		case StageStandard:
			return 2
		case StageVIP:
			return 4
		default:
			return 1
	
	}
}

func (t AuthStage) Entitlements() Entitlements {
	switch t {
		case StageGuest:
			return Entitlements{
				Stage: StageGuest,
				MaxWatchSeconds: 1800,
				MaxResolution: "480p",
				AdsEnabled: true,
				MaxDevices: t.MaxDevices(),
				CanDownload: false,
				ExclusiveAccess: false,
			}
		case StageStandard:
			return Entitlements{
				Stage: StageStandard,
				MaxWatchSeconds: 0,
				MaxResolution: "720p",
				AdsEnabled: true,
				MaxDevices: t.MaxDevices(),
				CanDownload: false,
				ExclusiveAccess: false,
			}
		case StageVIP:
			return Entitlements{
				Stage: StageVIP,
				MaxWatchSeconds: 0,
				MaxResolution: "1080p",
				AdsEnabled: true,
				MaxDevices: t.MaxDevices(),
				CanDownload: true,
				ExclusiveAccess: true,
			}
		default:
			return Entitlements{
				Stage: StageGuest,
				MaxWatchSeconds: 1800,
				MaxResolution: "480p",
				AdsEnabled: true,
				MaxDevices: t.MaxDevices(),
				CanDownload: false,
				ExclusiveAccess: false,
			}
	}
}

// IsValid checks if the tier is an official supported subscription plan.
func (t AuthStage) IsValid() bool {
	switch t {
	case StageGuest, StageStandard, StageVIP:
		return true
	default:
		return false
	}
}

// UserRole is a Value Object representing authorization role in the domain.
type UserRole string

const (
	RoleUser  UserRole = "user"
	RoleAdmin UserRole = "admin"
)

// ParseUserRole converts raw string to UserRole.
func ParseUserRole(s string) UserRole {
	switch strings.ToLower(strings.TrimSpace(s)) {
	case string(RoleAdmin):
		return RoleAdmin
	default:
		return RoleUser
	}
}

// String returns the string representation of UserRole.
func (r UserRole) String() string {
	if r == "" {
		return string(RoleUser)
	}
	return string(r)
}

// IsAdmin returns true if the role has admin privileges.
func (r UserRole) IsAdmin() bool {
	return r == RoleAdmin
}

// EmailAddress is an immutable Value Object encapsulating email validation and normalization.
type EmailAddress string

var emailRegex = regexp.MustCompile(`^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$`)

// NewEmailAddress validates and normalizes an email address.
func NewEmailAddress(raw string) (EmailAddress, error) {
	cleaned := strings.ToLower(strings.TrimSpace(raw))
	if cleaned == "" {
		return "", errors.New("email tidak boleh kosong")
	}
	if !emailRegex.MatchString(cleaned) {
		return "", errors.New("format email tidak valid")
	}
	return EmailAddress(cleaned), nil
}

// String returns the email string.
func (e EmailAddress) String() string {
	return string(e)
}
