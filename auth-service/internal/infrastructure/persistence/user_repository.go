package persistence

import (
	"errors"

	"github.com/DXR3IN/auth-service/internal/domain"
	"github.com/DXR3IN/auth-service/internal/domain/port"
	"github.com/DXR3IN/auth-service/internal/infrastructure/persistence/model"
	"gorm.io/gorm"
)

type userRepository struct {
	db *gorm.DB
}

// NewUserRepository membuat UserRepository baru menggunakan GORM.
func NewUserRepository(db *gorm.DB) port.UserRepository {
	return &userRepository{db: db}
}

func (r *userRepository) Create(u *domain.User) error {
	m := model.FromDomain(u)
	if err := r.db.Create(m).Error; err != nil {
		return err
	}
	u.ID = m.ID
	u.CreatedAt = m.CreatedAt
	u.UpdatedAt = m.UpdatedAt
	return nil
}

func (r *userRepository) FindByEmail(email string) (*domain.User, error) {
	var m model.UserModel
	if err := r.db.Where("email = ?", email).First(&m).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return m.ToDomain(), nil
}

func (r *userRepository) FindByID(id string) (*domain.User, error) {
	var m model.UserModel
	if err := r.db.Where("id = ?", id).First(&m).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return m.ToDomain(), nil
}

func (r *userRepository) EditPasswordByID(id, newPassword string) error {
	return r.db.Model(&model.UserModel{}).Where("id = ?", id).Update("password", newPassword).Error
}

func (r *userRepository) EditNameByID(id, newName string) error {
	return r.db.Model(&model.UserModel{}).Where("id = ?", id).Update("name", newName).Error
}

func (r *userRepository) EditProfile(id, name, picture string) error {
	updates := map[string]interface{}{}
	if name != "" { updates["name"] = name }
	if picture != "" { updates["picture"] = picture }
	return r.db.Model(&model.UserModel{}).Where("id = ?", id).Updates(updates).Error
}

func (r *userRepository) Update(u *domain.User) error {
	return r.db.Model(&model.UserModel{}).Where("id = ?", u.ID).Updates(map[string]interface{}{
		"name": u.Name, "email": u.Email, "password": u.Password,
		"provider": u.Provider, "picture": u.Picture, "role": u.Role,
		"tier": u.Tier, "watch_hours": u.WatchHours, "devices": u.Devices,
	}).Error
}
