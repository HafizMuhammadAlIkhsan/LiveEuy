package domain

// OAuthUser represents normalized user identity attributes obtained from a federated OAuth provider.
type OAuthUser struct {
	ID            string `json:"id"`
	Email         string `json:"email"`
	VerifiedEmail bool   `json:"verified_email"`
	Name          string `json:"name"`
	Picture       string `json:"picture"`
}

// GoogleUser is maintained as an alias to OAuthUser for backward compatibility.
type GoogleUser = OAuthUser