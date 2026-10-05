package domain

import (
	"errors"
	"strings"
	"time"

	"github.com/DXR3IN/auth-service/internal/config"
	"github.com/google/uuid"
)

// Invariant errors for User Aggregate.
var (
	ErrEmptyUserName      = errors.New(config.ERR_EMPTY_USER_NAME)
	ErrEmptyUserEmail     = errors.New(config.ERR_EMPTY_USER_EMAIL)
	ErrInvalidEmailFormat = errors.New(config.ERR_INVALID_EMAIL_FORMAT)
	ErrEmptyPasswordHash  = errors.New(config.ERR_EMPTY_PASS_HASH)
)

// User represents the User Aggregate Root in the Auth & Identity Domain.
type User struct {
	ID         	string    `json:"id"`
	Name       	string    `json:"name"`
	Email      	string    `json:"email"`
	Password   	string    `json:"-"`
	Picture    	string    `json:"picture,omitempty"`
	Role       	string    `json:"role"`
	Stage       string    `json:"stage"`
	IsVerified	bool	  `json:"is_verified"`
	Provider   	string    `json:"provider"`
	WatchHours 	float64   `json:"watchHours"`
	Devices    	int       `json:"devices"`
	CreatedAt  	time.Time `json:"createdAt"`
	UpdatedAt  	time.Time `json:"updatedAt"`
}

// NewUser creates a new User aggregate root enforcing domain invariants and default configurations.
func NewUser(id, name, email, passwordHash string, stage AuthStage, provider string) (*User, error) {
	name = strings.TrimSpace(name)
	if name == "" {
		return nil, ErrEmptyUserName
	}

	emailVO, err := NewEmailAddress(email)
	if err != nil {
		return nil, err
	}

	if id == "" {
		id = uuid.New().String()
	}

	if provider == "" {
		provider = config.PROVIDER_LOCAL
	}

	if !stage.IsValid() {
		stage = config.USER_STANDARD
	}

	now := time.Now()
	return &User{
		ID:         id,
		Name:       name,
		Email:      emailVO.String(),
		Password:   passwordHash,
		Picture:    config.DEFAULT_PICTURE_IMAGE_LINK,
		Role:       config.USER_ROLE,
		Stage:      stage.String(),
		IsVerified: false,
		Provider:   provider,
		WatchHours: 0.0,
		Devices:    stage.MaxDevices(),
		CreatedAt:  now,
		UpdatedAt:  now,
	}, nil
}

// NewOAuthUser creates a User aggregate root from a third-party OAuth provider.
func NewOAuthUser(id, name, email, picture, provider string) (*User, error) {
	name = strings.TrimSpace(name)
	if name == "" {
		name = "Pengguna " + strings.Title(provider)
	}

	emailVO, err := NewEmailAddress(email)
	if err != nil {
		return nil, err
	}

	if id == "" {
		id = uuid.New().String()
	}

	if picture == "" {
		picture = config.DEFAULT_PICTURE_IMAGE_LINK
	}

	if provider == "" {
		provider = config.PROVIDER_OAUTH
	}

	stage := config.USER_GUEST
	now := time.Now()

	return &User{
		ID:         id,
		Name:       name,
		Email:      emailVO.String(),
		Password:   "",
		Picture:    picture,
		Role:       string(config.USER_ROLE),
		Stage:      stage,
		Provider:   provider,
		IsVerified: true,
		WatchHours: 0.0,
		Devices:    config.USER_STANDARD_MAX_DEVICE,
		CreatedAt:  now,
		UpdatedAt:  now,
	}, nil
}

// MaxAllowedDevices returns the maximum allowed concurrent devices based on user's tier.
func (u *User) MaxAllowedDevices() int {
	tier := ParseStageTier(u.Stage)
	maxByTier := tier.MaxDevices()
	if u.Devices > maxByTier {
		return u.Devices
	}
	if u.Devices > 0 {
		return u.Devices
	}
	return maxByTier
}

// CanAddDevice evaluates whether a new device session can be granted.
func (u *User) CanAddDevice(activeSessionsCount int) bool {
	return activeSessionsCount < u.MaxAllowedDevices()
}

// UpgradeTier updates the subscription tier and synchronizes the allowed device count.
func (u *User) UpgradeTier(newStage AuthStage) {
	if !newStage.IsValid() {
		return
	}
	u.Stage = newStage.String()
	u.Devices = newStage.MaxDevices()
	u.UpdatedAt = time.Now()
}

// ChangePassword updates the security password hash.
func (u *User) ChangePassword(newPasswordHash string) error {
	newPasswordHash = strings.TrimSpace(newPasswordHash)
	if newPasswordHash == "" {
		return ErrEmptyPasswordHash
	}
	u.Password = newPasswordHash
	u.UpdatedAt = time.Now()
	return nil
}

// UpdateProfile updates the profile attributes of the user.
func (u *User) UpdateProfile(name, picture string) error {
	name = strings.TrimSpace(name)
	if name == "" {
		return ErrEmptyUserName
	}
	u.Name = name
	if picture != "" {
		u.Picture = picture
	}
	u.UpdatedAt = time.Now()
	return nil
}

// GetAvatar returns avatar picture or the default avatar if empty.
func (u *User) GetAvatar() string {
	if u.Picture != "" {
		return u.Picture
	}
	return config.DEFAULT_PICTURE_IMAGE_LINK
}

// GetMemberSince formats the creation date into a human readable Indonesian month and year.
func (u *User) GetMemberSince() string {
	if u.CreatedAt.IsZero() {
		return "September 2026"
	}
	
	monthIdx := int(u.CreatedAt.Month()) - 1
	if monthIdx >= 0 && monthIdx < 12 {
		return config.MONTH[monthIdx] + " " + u.CreatedAt.Format("2006")
	}
	return u.CreatedAt.Format("January 2006")
}

// VerifiedAccount change the IsVerified into true
func (u *User) VerifiedAccount() bool {
	if !u.IsVerified {
		return true
	}
	return u.IsVerified
}

// UserRepository defines the Port for User Aggregate persistence, owned by the Domain.
type UserRepository interface {
	Create(u *User) error
	FindByEmail(email string) (*User, error)
	FindByID(id string) (*User, error)
	EditPasswordByID(id, newPassword string) error
	EditNameByID(id, newName string) error
	EditProfile(id, name, picture string) error
	Update(u *User) error
}
