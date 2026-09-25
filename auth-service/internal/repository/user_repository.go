package repository

import (
	"errors"
	"time"

	models "github.com/DXR3IN/auth-service/internal/domain"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type User struct {
	ID        string    `gorm:"type:uuid;primaryKey" json:"id"`
	Name      string    `gorm:"not null" json:"name"`
	Email     string    `gorm:"uniqueIndex;not null" json:"email"`
	Password  string    `json:"-"` 
	Provider  string    `gorm:"default:'local'" json:"provider"`
	Picture   string    `json:"picture"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt time.Time `gorm:"autoUpdateTime" json:"updated_at"`
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
		ID:        u.ID,
		Name:      u.Name,
		Email:     u.Email,
		Password:  u.Password,
		Provider:  u.Provider,
		Picture:   u.Picture,
		CreatedAt: u.CreatedAt,
		UpdatedAt: u.UpdatedAt,
	}
}

type UserRepository interface {
	Create(u *models.User) error
	FindByEmail(email string) (*models.User, error)
	FindByID(id string) (*models.User, error)
	EditPasswordByID(ID, newPassword string) error
	EditNameByID(ID, newName string) error
}

type userRepo struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) UserRepository {
	return &userRepo{db: db}
}

func (r *userRepo) Create(u *models.User) error {
	return r.db.Create(u).Error
}

func (r *userRepo) EditPasswordByID(ID, newPassword string) error {
	return r.db.Model(&User{}).Where("id = ?", ID).Update("password", newPassword).Error
}

func (r *userRepo) EditNameByID(ID, newName string) error {
	return r.db.Model(&User{}).Where("id = ?", ID).Update("name", newName).Error
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