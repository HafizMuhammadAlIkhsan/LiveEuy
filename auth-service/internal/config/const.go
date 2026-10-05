package config

import "regexp"

const (
	// ENV key
	KEY_WEB_OAUTH_GOOGLE_CLIENT_ID			=	"WEB_OAUTH_GOOGLE_CLIENT_ID"
	KEY_WEB_OAUTH_GOOGLE_CLIENT_SECRET		=	"WEB_OAUTH_GOOGLE_CLIENT_SECRET"
	KEY_WEB_OAUTH_GOOGLE_REDIRECT_URL		=	"WEB_OAUTH_GOOGLE_REDIRECT_URL"
	KEY_R_URL								= 	"REDIS_URL"
	KEY_2_R_URL								=	"UPSTASH_REDIS_REST_URL"
	KEY_R_TOKEN								=	"UPSTASH_REDIS_REST_TOKEN"
	KEY_JWT_EXP								=	"JWT_EXPIRATION_MS"
	KEY_JWT_PRIVATE_KEY_PATH				=	"JWT_PRIVATE_KEY_PATH"
	KEY_JWT_PUBLIC_KEY_PATH					=	"JWT_PUBLIC_KEY_PATH"
	KEY_JWT_PRIVATE_KEY						=	"JWT_PRIVATE_KEY"
	KEY_JWT_PUBLIC_KEY						=	"JWT_PUBLIC_KEY"
	KEY_JWT_KEY_ID							=	"JWT_KEY_ID"
	KEY_PORT								=	"PORT"
	KEY_DB_URL								=	"DATABASE_URL"
	ENV_NOT_FOUND							= 	"NOT FOUND"

	// Path endpoint
	

	// Pin Type (location: internal/domain)
	PIN_TYPE_REGISTER    = "register"
	PIN_TYPE_FORGOT_PASS = "forgot_password"

	// (Location: internal/domain/events)
	USER_REGISTERED_EVENT_NAME       = "UserRegistered"
	USER_LOGGED_IN_EVENT_NAME        = "UserLoggedIn"
	USER_PASSWORD_CHANGED_EVENT_NAME = "PasswordChanged"
	USER_SESSION_REVOKED_EVENT_NAME  = "SessionRevoked"

	// Type of USER 
	USER_GUEST						=	"guest"
	USER_STANDARD					=	"standard"
	USER_VIP						=	"vip"
	USER_GUEST_MAX_DEVICE			=	1
	USER_STANDARD_MAX_DEVICE		=	2
	USER_VIP_MAX_DEVICE				=	4
	USER_GUEST_MAX_RESOLUTION		=	"420p"
	USER_STANDARD_MAX_RESOLUTION	=	"720p"
	USER_VIP_MAX_RESOLUTION			= 	"1080p"

	// Type of ROLE
	USER_ROLE						=	"admin"
	ADMIN_ROLE						=	"user"

	// Default Picture
	DEFAULT_PICTURE_IMAGE_LINK		=	"https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160&auto=format&fit=crop&q=80"

	// Auth Error
	ERR_EMPTY_USER_NAME				=	"nama pengguna tidak boleh kosong"
	ERR_EMPTY_USER_EMAIL			=	"email pengguna tidak boleh kosong"
	ERR_INVALID_EMAIL_FORMAT		=	"format email tidak valid"
	ERR_EMPTY_PASS_HASH				=	"hash kata sandi tidak boleh kosong"

	// provider
	PROVIDER_LOCAL					=	"local"
	PROVIDER_OAUTH					=	"oauth"
	URL_USER_INFO_GOOGLE			=	"https://www.googleapis.com/oauth2/v2/userinfo"
)

var (
	// Regex
	EMAIL_REGEX						= regexp.MustCompile(`^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$`)

	// Array data
	MONTH = []string{
        "Januari", "Februari", "Maret", "April", "Mei", "Juni", 
        "Juli", "Agustus", "September", "Oktober", "November", "Desember",
    }
	GOOGLE_OAUTH = []string{
			"https://www.googleapis.com/auth/userinfo.email",
			"https://www.googleapis.com/auth/userinfo.profile",
		}
)