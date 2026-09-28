package handler

type registerReq struct {
	Name     string `json:"name" binding:"required" example:"Arga Pratama"`
	Email    string `json:"email" binding:"required,email" example:"arga@example.com"`
	Password string `json:"password" binding:"required,min=6" example:"PasswordSuper#2026"`
	Tier     string `json:"tier" example:"VIP Standard"`
}

type loginReq struct {
	Email      string `json:"email" binding:"required,email" example:"hafiz@liveeuy.id"`
	Password   string `json:"password" binding:"required" example:"LiveEuy#2026"`
	RememberMe bool   `json:"rememberMe" example:"true"`
}

type demoLoginReq struct {
	Persona string `json:"persona" binding:"required" example:"hafiz"`
}

type refreshTokenReq struct {
	RefreshToken      string `json:"refreshToken" example:"rfk-94a28f73b610c41d99e52e"`
	RefreshTokenSnake string `json:"refresh_token" example:"rfk-94a28f73b610c41d99e52e"`
}

func (r *refreshTokenReq) GetToken() string {
	if r.RefreshToken != "" {
		return r.RefreshToken
	}
	return r.RefreshTokenSnake
}

type logoutReq struct {
	RefreshToken      string `json:"refreshToken" example:"rfk-94a28f73b610c41d99e52e"`
	RefreshTokenSnake string `json:"refresh_token" example:"rfk-94a28f73b610c41d99e52e"`
}

func (r *logoutReq) GetToken() string {
	if r.RefreshToken != "" {
		return r.RefreshToken
	}
	return r.RefreshTokenSnake
}

type profileUpdateReq struct {
	Name   string `json:"name" example:"Hafiz Muhammad Al Ikhsan"`
	Avatar string `json:"avatar" example:"https://images.unsplash.com/photo-custom.jpg"`
}

type updateNameReq struct {
	NewName string `json:"new_name" binding:"required" example:"John Smith"`
}

type changePasswordReq struct {
	CurrentPassword string `json:"currentPassword" binding:"required" example:"LiveEuy#2026"`
	NewPassword     string `json:"newPassword" binding:"required,min=6" example:"LiveEuyUltra#2027"`
}

type updatePasswordReq struct {
	NewPassword string `json:"new_password" binding:"required,min=6" example:"newsecret123"`
}

type forgotPasswordReq struct {
	Email string `json:"email" binding:"required,email" example:"arga@example.com"`
}

type resetPasswordReq struct {
	Token       string `json:"token" binding:"required" example:"rst-tok-84729104857201"`
	NewPassword string `json:"newPassword" binding:"required,min=6" example:"NewSecurePassword#2026"`
}

// Swagger response structs
type AuthContractData struct {
	AccessToken  string               `json:"accessToken" example:"eyJhbGciOi..."`
	TokenType    string               `json:"tokenType" example:"Bearer"`
	ExpiresIn    int                  `json:"expiresIn" example:"900"`
	RefreshToken string               `json:"refreshToken" example:"rfk-94a28f73..."`
	User         UserContractResponse `json:"user"`
}

type RefreshContractData struct {
	AccessToken  string `json:"accessToken" example:"eyJhbGciOi..."`
	TokenType    string `json:"tokenType" example:"Bearer"`
	ExpiresIn    int    `json:"expiresIn" example:"900"`
	RefreshToken string `json:"refreshToken" example:"rfk-new-rotated..."`
}

type APIResponse struct {
	Success bool        `json:"success" example:"true"`
	Message string      `json:"message" example:"Operasi berhasil"`
	Data    interface{} `json:"data,omitempty"`
}

type ErrorDetail struct {
	Field   string `json:"field" example:"password"`
	Message string `json:"message" example:"Kata sandi salah"`
}

type APIErrorResponse struct {
	Success   bool          `json:"success" example:"false"`
	Message   string        `json:"message" example:"Email atau kata sandi tidak cocok."`
	Error     string        `json:"error" example:"UNAUTHORIZED"`
	Code      string        `json:"code" example:"AUTH_401_01"`
	Timestamp string        `json:"timestamp" example:"2026-09-25T09:30:00Z"`
	Details   []ErrorDetail `json:"details,omitempty"`
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