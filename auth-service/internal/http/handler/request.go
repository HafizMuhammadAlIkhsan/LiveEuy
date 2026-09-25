package handler

type registerReq struct {
	Name     string `json:"name" binding:"required" example:"John Doe"`
	Email    string `json:"email" binding:"required,email" example:"john@example.com"`
	Password string `json:"password" binding:"required,min=6" example:"secret123"`
}

type loginReq struct {
	Email    string `json:"email" binding:"required,email" example:"john@example.com"`
	Password string `json:"password" binding:"required" example:"secret123"`
}

type refreshTokenReq struct {
	RefreshToken string `json:"refresh_token" binding:"required" example:"d0a5f9..."`
}

type updateNameReq struct {
	NewName string `json:"new_name" binding:"required" example:"John Smith"`
}

type updatePasswordReq struct {
	NewPassword string `json:"new_password" binding:"required,min=6" example:"newsecret123"`
}

type AuthResponseData struct {
	Success      bool         `json:"success" example:"true"`
	Message      string       `json:"message" example:"operation successful"`
	AccessToken  string       `json:"access_token,omitempty" example:"eyJhbGciOi..."`
	RefreshToken string       `json:"refresh_token,omitempty" example:"d0a5f9..."`
	User         UserResponse `json:"user,omitempty"`
}

type RefreshTokenResponseData struct {
	Success      bool   `json:"success" example:"true"`
	AccessToken  string `json:"access_token" example:"eyJhbGciOi..."`
	RefreshToken string `json:"refresh_token" example:"d0a5f9..."`
}

type UserProfileResponseData struct {
	Success bool         `json:"success" example:"true"`
	User    UserResponse `json:"user"`
}

type BaseResponseData struct {
	Success bool   `json:"success,omitempty" example:"true"`
	Message string `json:"message,omitempty" example:"operation successful"`
	Status  string `json:"status,omitempty" example:"healthy"`
	Error   string `json:"error,omitempty" example:"error description"`
}