package domain

import (
	"errors"
	"strings"

	"github.com/DXR3IN/auth-service/internal/config"
)

// SubscriptionTier is a Value Object representing the streaming membership tier.
type AuthStage string


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
	case string(config.USER_STANDARD):
		return config.USER_STANDARD
	case string(config.USER_VIP):
		return config.USER_VIP
	default:
		return config.USER_GUEST
	}
}

// String returns the string representation of the tier.
func (t AuthStage) String() string {
	if t == "" {
		return string(config.USER_GUEST)
	}
	return string(t)
}

func (t AuthStage) MaxDevices() int {
	switch t {
		case config.USER_GUEST:
			return config.USER_GUEST_MAX_DEVICE
		case config.USER_STANDARD:
			return config.USER_STANDARD_MAX_DEVICE
		case config.USER_VIP:
			return config.USER_VIP_MAX_DEVICE
		default:
			return config.USER_GUEST_MAX_DEVICE
	
	}
}

func (t AuthStage) Entitlements() Entitlements {
	switch t {
		case config.USER_STANDARD:
			return Entitlements{
				Stage: config.USER_STANDARD,
				MaxWatchSeconds: 0,
				MaxResolution: config.USER_STANDARD_MAX_RESOLUTION,
				AdsEnabled: true,
				MaxDevices: t.MaxDevices(),
				CanDownload: false,
				ExclusiveAccess: false,
			}
		case config.USER_VIP:
			return Entitlements{
				Stage: config.USER_VIP,
				MaxWatchSeconds: 0,
				MaxResolution: config.USER_VIP_MAX_RESOLUTION,
				AdsEnabled: true,
				MaxDevices: t.MaxDevices(),
				CanDownload: true,
				ExclusiveAccess: true,
			}
		default:
			return Entitlements{
				Stage: config.USER_GUEST,
				MaxWatchSeconds: 1800,
				MaxResolution: config.USER_GUEST_MAX_RESOLUTION,
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
	case config.USER_GUEST, config.USER_STANDARD, config.USER_VIP:
		return true
	default:
		return false
	}
}

// UserRole is a Value Object representing authorization role in the domain.
type UserRole string

// ParseUserRole converts raw string to UserRole.
func ParseUserRole(s string) UserRole {
	switch strings.ToLower(strings.TrimSpace(s)) {
	case string(config.ADMIN_ROLE):
		return config.ADMIN_ROLE
	default:
		return config.USER_ROLE
	}
}

// String returns the string representation of UserRole.
func (r UserRole) String() string {
	if r == "" {
		return string(config.USER_ROLE)
	}
	return string(r)
}

// IsAdmin returns true if the role has admin privileges.
func (r UserRole) IsAdmin() bool {
	return r == config.ADMIN_ROLE
}

// EmailAddress is an immutable Value Object encapsulating email validation and normalization.
type EmailAddress string

// NewEmailAddress validates and normalizes an email address.
func NewEmailAddress(raw string) (EmailAddress, error) {
	cleaned := strings.ToLower(strings.TrimSpace(raw))
	if cleaned == "" {
		return "", errors.New(config.ERR_EMPTY_USER_EMAIL)
	}
	if !config.EMAIL_REGEX.MatchString(cleaned) {
		return "", errors.New(config.ERR_INVALID_EMAIL_FORMAT)
	}
	return EmailAddress(cleaned), nil
}

// String returns the email string.
func (e EmailAddress) String() string {
	return string(e)
}
