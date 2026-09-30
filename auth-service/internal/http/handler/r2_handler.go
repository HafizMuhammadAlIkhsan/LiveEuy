package handler

import (
	"fmt"
	"net/http"
	"path/filepath"
	"strings"
	"time"

	"github.com/DXR3IN/auth-service/internal/storage"
	"github.com/gin-gonic/gin"
)

// R2UploadHandler menangani endpoint upload file ke Cloudflare R2.
type R2UploadHandler struct {
	storageSvc storage.R2StorageService
}

// NewR2UploadHandler membuat handler R2 baru.
func NewR2UploadHandler(storageSvc storage.R2StorageService) *R2UploadHandler {
	return &R2UploadHandler{storageSvc: storageSvc}
}

// UploadAvatar menangani upload foto profil user.
//
// Method: POST /api/v1/auth/me/avatar
// Auth:   Bearer token (wajib)
// Form:   multipart/form-data dengan field "avatar"
//
// Response sukses (200):
//
//	{
//	  "success": true,
//	  "message": "Foto profil berhasil diupload",
//	  "data": { "avatarUrl": "https://cdn.liveeuy.com/avatars/user-id/abc123.jpg" }
//	}
func (h *R2UploadHandler) UploadAvatar(c *gin.Context) {
	if h.storageSvc == nil {
		sendError(c, http.StatusServiceUnavailable,
			"Fitur upload avatar tidak tersedia (R2 belum dikonfigurasi di server)",
			"SERVICE_UNAVAILABLE", "R2_NOT_CONFIGURED", nil)
		return
	}

	// Ambil userID dari JWT claims (diset oleh AuthRequired middleware)
	userID, exists := c.Get("user_id")
	if !exists {
		sendError(c, http.StatusUnauthorized, "Unauthorized", "UNAUTHORIZED", "AUTH_REQUIRED", nil)
		return
	}

	// Parse multipart form (maks 5MB)
	if err := c.Request.ParseMultipartForm(5 << 20); err != nil {
		sendError(c, http.StatusBadRequest, "Gagal memproses form data", "BAD_REQUEST", "FORM_PARSE_ERROR", []ErrorDetail{
			{Field: "avatar", Message: "Ukuran file maksimal 5MB"},
		})
		return
	}

	file, header, err := c.Request.FormFile("avatar")
	if err != nil {
		sendError(c, http.StatusBadRequest, "File avatar tidak ditemukan dalam request", "BAD_REQUEST", "FILE_MISSING", []ErrorDetail{
			{Field: "avatar", Message: "Sertakan file dengan field name 'avatar'"},
		})
		return
	}
	defer file.Close()

	// Validasi ekstensi file di layer handler (double-check sebelum masuk service)
	ext := strings.ToLower(filepath.Ext(header.Filename))
	allowedExts := map[string]bool{".jpg": true, ".jpeg": true, ".png": true, ".webp": true, ".gif": true}
	if !allowedExts[ext] {
		sendError(c, http.StatusBadRequest, "Format file tidak didukung", "BAD_REQUEST", "INVALID_FILE_TYPE", []ErrorDetail{
			{Field: "avatar", Message: "Hanya format JPG, PNG, WebP, atau GIF yang diizinkan"},
		})
		return
	}

	// Upload ke R2
	avatarUrl, err := h.storageSvc.UploadAvatar(userID.(string), file, header)
	if err != nil {
		sendError(c, http.StatusInternalServerError, err.Error(), "STORAGE_ERROR", "UPLOAD_FAILED", nil)
		return
	}

	sendSuccess(c, http.StatusOK, "Foto profil berhasil diupload", gin.H{
		"avatarUrl": avatarUrl,
	})
}

// DeleteAvatar menangani penghapusan foto profil user.
//
// Method: DELETE /api/v1/auth/me/avatar
// Auth:   Bearer token (wajib)
// Query:  ?key=avatars/user-id/abc123.jpg
func (h *R2UploadHandler) DeleteAvatar(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		sendError(c, http.StatusUnauthorized, "Unauthorized", "UNAUTHORIZED", "AUTH_REQUIRED", nil)
		return
	}

	objectKey := c.Query("key")
	if objectKey == "" {
		sendError(c, http.StatusBadRequest, "Parameter 'key' wajib diisi", "BAD_REQUEST", "MISSING_PARAM", nil)
		return
	}

	// Validasi keamanan: pastikan objectKey milik user ini
	// Format yang valid: avatars/<userID>/...
	expectedPrefix := "avatars/" + userID.(string) + "/"
	if !strings.HasPrefix(objectKey, expectedPrefix) {
		sendError(c, http.StatusForbidden, "Anda tidak diizinkan menghapus file ini", "FORBIDDEN", "ACCESS_DENIED", nil)
		return
	}

	if err := h.storageSvc.DeleteFile(objectKey); err != nil {
		sendError(c, http.StatusInternalServerError, err.Error(), "STORAGE_ERROR", "DELETE_FAILED", nil)
		return
	}

	sendSuccess(c, http.StatusOK, "Foto profil berhasil dihapus", nil)
}

// GetPresignedDownloadURL membuat presigned URL untuk download file sementara.
//
// Method: GET /api/v1/auth/storage/presign
// Auth:   Bearer token (wajib)
// Query:  ?key=<objectKey>&expiry=60 (menit)
func (h *R2UploadHandler) GetPresignedDownloadURL(c *gin.Context) {
	objectKey := c.Query("key")
	if objectKey == "" {
		sendError(c, http.StatusBadRequest, "Parameter 'key' wajib diisi", "BAD_REQUEST", "MISSING_PARAM", nil)
		return
	}

	// Default expiry: 60 menit
	expiry := 60
	if v := c.Query("expiry"); v != "" {
		if n, err := parsePositiveInt(v); err == nil && n > 0 && n <= 1440 {
			expiry = n
		}
	}

	presignedURL, err := h.storageSvc.GeneratePresignedDownloadURL(objectKey, minutesToDuration(expiry))
	if err != nil {
		sendError(c, http.StatusInternalServerError, err.Error(), "STORAGE_ERROR", "PRESIGN_FAILED", nil)
		return
	}

	sendSuccess(c, http.StatusOK, "Presigned URL berhasil dibuat", gin.H{
		"url":           presignedURL,
		"objectKey":     objectKey,
		"expiryMinutes": expiry,
	})
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

func parsePositiveInt(s string) (int, error) {
	var n int
	_, err := fmt.Sscanf(s, "%d", &n)
	return n, err
}

func minutesToDuration(minutes int) time.Duration {
	return time.Duration(minutes) * time.Minute
}
