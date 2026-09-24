package handler

import "time"

type UserResponse struct {
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	Picture   string    `json:"picture,omitempty"`
	CreatedAt time.Time `json:"created_at"`
}