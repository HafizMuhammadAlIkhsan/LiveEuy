package port

import (
	"mime/multipart"
	"time"
)

// StorageService adalah port untuk operasi file storage.
// Implementasi ada di infrastructure/storage (Cloudflare R2).
type StorageService interface {
	// UploadAvatar mengupload foto profil user dan mengembalikan URL publik.
	UploadAvatar(userID string, file multipart.File, header *multipart.FileHeader) (string, error)
	// DeleteFile menghapus file berdasarkan object key.
	DeleteFile(objectKey string) error
	// GeneratePresignedDownloadURL membuat presigned URL untuk download sementara.
	GeneratePresignedDownloadURL(objectKey string, expiry time.Duration) (string, error)
	// BuildPublicURL membangun URL publik dari object key.
	BuildPublicURL(objectKey string) string
}
