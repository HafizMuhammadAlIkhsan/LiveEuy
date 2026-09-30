package repository

import (
	"errors"
	"time"

	models "github.com/DXR3IN/auth-service/internal/domain"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type User struct {
	ID         string    `gorm:"type:uuid;primaryKey" json:"id"`
	Name       string    `gorm:"not null" json:"name"`
	Email      string    `gorm:"uniqueIndex;not null" json:"email"`
	Password   string    `json:"-"`
	Provider   string    `gorm:"default:'local'" json:"provider"`
	Picture    string    `gorm:"column:picture" json:"picture"`
	Role       string    `gorm:"default:'user'" json:"role"`
	Stage       string    `gorm:"default:'guest'" json:"stage"`
	WatchHours float64   `gorm:"default:0.0" json:"watch_hours"`
	Devices    int       `gorm:"default:2" json:"devices"`
	CreatedAt  time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt  time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}

func (User) TableName() string {
	return "users"
}

func (u *User) BeforeCreate(tx *gorm.DB) error {
	if u.ID == "" {
		u.ID = uuid.New().String()
	}
	if u.Provider == "" {
		u.Provider = "local"
	}
	if u.Role == "" {
		u.Role = "user"
	}
	if u.Stage == "" {
		u.Stage = "VIP Standard"
	}
	if u.Devices == 0 {
		u.Devices = 2
	}
	return nil
}

func (u *User) BeforeUpdate(tx *gorm.DB) error {
	u.UpdatedAt = time.Now()
	return nil
}

func (u *User) ToDomain() *models.User {
	if u == nil {
		return nil
	}

	return &models.User{
		ID:         u.ID,
		Name:       u.Name,
		Email:      u.Email,
		Password:   u.Password,
		Provider:   u.Provider,
		Picture:    u.Picture,
		Role:       u.Role,
		Stage:       u.Stage,
		WatchHours: u.WatchHours,
		Devices:    u.Devices,
		CreatedAt:  u.CreatedAt,
		UpdatedAt:  u.UpdatedAt,
	}
}

// UserRepository is an alias to the Domain Port domain.UserRepository for backward compatibility.
type UserRepository = models.UserRepository

type userRepo struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) UserRepository {
	return &userRepo{db: db}
}

func (r *userRepo) Create(u *models.User) error {
	repoUser := &User{
		ID:         u.ID,
		Name:       u.Name,
		Email:      u.Email,
		Password:   u.Password,
		Provider:   u.Provider,
		Picture:    u.Picture,
		Role:       u.Role,
		Stage:       u.Stage,
		WatchHours: u.WatchHours,
		Devices:    u.Devices,
		CreatedAt:  u.CreatedAt,
		UpdatedAt:  u.UpdatedAt,
	}
	if err := r.db.Create(repoUser).Error; err != nil {
		return err
	}
	u.ID = repoUser.ID
	u.CreatedAt = repoUser.CreatedAt
	u.UpdatedAt = repoUser.UpdatedAt
	return nil
}

func (r *userRepo) EditPasswordByID(ID, newPassword string) error {
	return r.db.Model(&User{}).Where("id = ?", ID).Update("password", newPassword).Error
}

func (r *userRepo) EditNameByID(ID, newName string) error {
	return r.db.Model(&User{}).Where("id = ?", ID).Update("name", newName).Error
}

func (r *userRepo) EditProfile(ID, name, picture string) error {
	updates := map[string]interface{}{}
	if name != "" {
		updates["name"] = name
	}
	if picture != "" {
		updates["picture"] = picture
	}
	return r.db.Model(&User{}).Where("id = ?", ID).Updates(updates).Error
}

func (r *userRepo) Update(u *models.User) error {
	return r.db.Model(&User{}).Where("id = ?", u.ID).Updates(map[string]interface{}{
		"name":        u.Name,
		"email":       u.Email,
		"password":    u.Password,
		"provider":    u.Provider,

		"picture":     u.Picture,
		"role":        u.Role,
		"stage":        u.Stage,
		"watch_hours": u.WatchHours,
		"devices":     u.Devices,
	}).Error
}

func (r *userRepo) FindByEmail(email string) (*models.User, error) {
	var u User
	if err := r.db.Where("email = ?", email).First(&u).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return u.ToDomain(), nil
}

func (r *userRepo) FindByID(id string) (*models.User, error) {
	var u User
	if err := r.db.Where("id = ?", id).First(&u).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return u.ToDomain(), nil
}