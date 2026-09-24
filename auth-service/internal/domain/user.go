package domain

import "time"

type User struct {
	Name      string   `json:"name"`
	ID        string    `json:"id"`
	Email     string    `json:"email"`
	Provider  string    `json:"provider"`
	Picture   string	`json:"picture"`
	Password  string    `json:"-"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
