package domain

import "time"

// TokenClaims represents claims extracted from a verified authentication token.
// The domain model is decoupled from any specific token or signature implementation.
type TokenClaims struct {
	Subject   			string    	`json:"sub,omitempty"`
	Email     			string    	`json:"email,omitempty"`
	Name      			string    	`json:"name,omitempty"`
	Role      			string    	`json:"role,omitempty"`
	Stage 	  			string    	`json:"tier,omitempty"`
	MaxResolution		string	  	`json:"max_res,omitempty"`
	AdsEnabled			string	  	`json:"ads_enabled,omitempty"`
	WatchLimitSeconds	int		  	`json:"watch_limit_sec.omitempty"`
	Issuer    			string    	`json:"iss,omitempty"`
	IssuedAt  			time.Time 	`json:"iat,omitempty"`
	ExpiresAt 			time.Time 	`json:"exp,omitempty"`
}

// JWTClaims is maintained as an alias to TokenClaims for backward compatibility across layers.
type JWTClaims = TokenClaims

// TokenManager is the domain port for token issuance and cryptographic verification.
type TokenManager interface {
	GenerateAccessToken(user *User) (string, error)
	Verify(tokenStr string) (*TokenClaims, error)
	GetJWKS() map[string]interface{}
	GetPublicKeyPEM() string
}
