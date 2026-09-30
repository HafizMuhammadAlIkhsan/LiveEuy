package handler

import (
	"time"

	"github.com/DXR3IN/auth-service/internal/domain"
)

type UserResponse struct {
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	Picture   string    `json:"picture,omitempty"`
	CreatedAt time.Time `json:"created_at"`
}

type UserContractResponse struct {
	ID          string  `json:"id"`
	Name        string  `json:"name"`
	Email       string  `json:"email"`
	Picture      string  `json:"picture"`
	Stage        string  `json:"stage"`
	Role        string  `json:"role"`
	MemberSince string  `json:"memberSince"`
	WatchHours  float64 `json:"watchHours"`
	Devices     int     `json:"devices"`
	CreatedAt   string  `json:"createdAt,omitempty"`
}

func ToUserContractResponse(u *domain.User) UserContractResponse {
	if u == nil {
		return UserContractResponse{}
	}
	role := u.Role
	if role == "" {
		role = "user"
	}
	stage := u.Stage
	if stage == "" {
		stage = "guest"
	}
	devices := u.Devices
	if devices == 0 {
		devices = 2
	}
	return UserContractResponse{
		ID:          u.ID,
		Name:        u.Name,
		Email:       u.Email,

		Stage:        stage,
		Role:        role,
		MemberSince: u.GetMemberSince(),
		WatchHours:  u.WatchHours,
		Devices:     devices,
		CreatedAt:   u.CreatedAt.Format(time.RFC3339),
	}
}