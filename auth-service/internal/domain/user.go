package domain

import "time"

type User struct {
	ID         string    `json:"id"`
	Name       string    `json:"name"`
	Email      string    `json:"email"`
	Password   string    `json:"-"`
	Picture    string    `json:"picture,omitempty"`
	Role       string    `json:"role"`
	Tier       string    `json:"tier"`
	Provider   string    `json:"provider"`
	WatchHours float64   `json:"watchHours"`
	Devices    int       `json:"devices"`
	CreatedAt  time.Time `json:"createdAt"`
	UpdatedAt  time.Time `json:"updatedAt"`
}

func (u *User) GetAvatar() string {

	if u.Picture != "" {
		return u.Picture
	}
	return "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160&auto=format&fit=crop&q=80"
}

func (u *User) GetMemberSince() string {
	if u.CreatedAt.IsZero() {
		return "September 2026"
	}
	months := []string{"Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"}
	monthIdx := int(u.CreatedAt.Month()) - 1
	if monthIdx >= 0 && monthIdx < 12 {
		return months[monthIdx] + " " + time.Now().Format("2006")
	}
	return u.CreatedAt.Format("January 2006")
}
