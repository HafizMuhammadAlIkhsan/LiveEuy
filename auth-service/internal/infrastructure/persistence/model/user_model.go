package model

import (
	"time"

	"github.com/DXR3IN/auth-service/internal/domain"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// UserModel adalah GORM model untuk tabel users.
// Terpisah dari domain.User agar domain tidak bergantung ke ORM.
type UserModel struct {
	ID         string    `gorm:"type:uuid;primaryKey" json:"id"`
	Name       string    `gorm:"not null" json:"name"`
	Email      string    `gorm:"uniqueIndex;not null" json:"email"`
	Password   string    `json:"-"`
	Provider   string    `gorm:"default:'local'" json:"provider"`
	Picture    string    `gorm:"column:picture" json:"picture"`
	Role       string    `gorm:"default:'user'" json:"role"`
	Tier       string    `gorm:"default:'VIP Standard'" json:"tier"`
	WatchHours float64   `gorm:"default:0.0" json:"watch_hours"`
	Devices    int       `gorm:"default:2" json:"devices"`
	CreatedAt  time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt  time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}

func (UserModel) TableName() string { return "users" }

func (u *UserModel) BeforeCreate(tx *gorm.DB) error {
	if u.ID == "" {
		u.ID = uuid.New().String()
	}
	if u.Provider == "" { u.Provider = "local" }
	if u.Role == "" { u.Role = "user" }
	if u.Tier == "" { u.Tier = "VIP Standard" }
	if u.Devices == 0 { u.Devices = 2 }
	return nil
}

func (u *UserModel) BeforeUpdate(tx *gorm.DB) error {
	u.UpdatedAt = time.Now()
	return nil
}

// ToDomain mengkonversi UserModel ke domain.User.
func (u *UserModel) ToDomain() *domain.User {
	if u == nil { return nil }
	return &domain.User{
		ID:         u.ID,
		Name:       u.Name,
		Email:      u.Email,
		Password:   u.Password,
		Provider:   u.Provider,
		Picture:    u.Picture,
		Role:       u.Role,
		Tier:       u.Tier,
		WatchHours: u.WatchHours,
		Devices:    u.Devices,
		CreatedAt:  u.CreatedAt,
		UpdatedAt:  u.UpdatedAt,
	}
}

// FromDomain mengkonversi domain.User ke UserModel.
func FromDomain(u *domain.User) *UserModel {
	return &UserModel{
		ID:         u.ID,
		Name:       u.Name,
		Email:      u.Email,
		Password:   u.Password,
		Provider:   u.Provider,
		Picture:    u.Picture,
		Role:       u.Role,
		Tier:       u.Tier,
		WatchHours: u.WatchHours,
		Devices:    u.Devices,
		CreatedAt:  u.CreatedAt,
		UpdatedAt:  u.UpdatedAt,
	}
}
