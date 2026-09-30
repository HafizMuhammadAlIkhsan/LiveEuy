package port

import "github.com/DXR3IN/auth-service/internal/domain"

// UserRepository adalah port (abstraksi) untuk penyimpanan data User.
// Implementasi ada di infrastructure/persistence.
type UserRepository interface {
	Create(u *domain.User) error
	FindByEmail(email string) (*domain.User, error)
	FindByID(id string) (*domain.User, error)
	EditPasswordByID(id, newPassword string) error
	EditNameByID(id, newName string) error
	EditProfile(id, name, picture string) error
	Update(u *domain.User) error
}
