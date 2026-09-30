package storage

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"mime/multipart"
	"path/filepath"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	awsconfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/aws/aws-sdk-go-v2/service/s3/types"
	"github.com/google/uuid"
)

// ─────────────────────────────────────────────────────────────────────────────
// Config & Client
// ─────────────────────────────────────────────────────────────────────────────

// R2Config menyimpan konfigurasi koneksi ke Cloudflare R2.
type R2Config struct {
	// AccountID dari Cloudflare Dashboard → R2 → Overview
	AccountID string
	// AccessKeyID dari Manage R2 API Tokens
	AccessKeyID string
	// SecretAccessKey dari Manage R2 API Tokens
	SecretAccessKey string
	// BucketName nama bucket R2 untuk auth-service (avatar, KTP, dll.)
	BucketName string
	// PublicURL custom domain publik (opsional). Contoh: https://cdn.liveeuy.com
	PublicURL string
}

// EndpointURL mengembalikan S3-compatible endpoint URL untuk R2.
func (c *R2Config) EndpointURL() string {
	return fmt.Sprintf("https://%s.r2.cloudflarestorage.com", c.AccountID)
}

// R2Client menyimpan AWS S3 client yang dikonfigurasi untuk Cloudflare R2.
type R2Client struct {
	client *s3.Client
	cfg    *R2Config
}

// NewR2Client membuat R2Client baru yang sudah terhubung ke Cloudflare R2.
// Panggil ini saat startup aplikasi (dalam dependency injection / main.go).
func NewR2Client(cfg *R2Config) (*R2Client, error) {
	customEndpoint := cfg.EndpointURL()

	awsCfg, err := awsconfig.LoadDefaultConfig(context.TODO(),
		awsconfig.WithRegion("auto"),
		awsconfig.WithCredentialsProvider(
			credentials.NewStaticCredentialsProvider(
				cfg.AccessKeyID,
				cfg.SecretAccessKey,
				"", // session token (tidak digunakan di R2)
			),
		),
		awsconfig.WithEndpointResolverWithOptions(
			aws.EndpointResolverWithOptionsFunc(func(service, region string, opts ...interface{}) (aws.Endpoint, error) {
				return aws.Endpoint{
					URL:               customEndpoint,
					HostnameImmutable: true,
					SigningRegion:     "auto",
				}, nil
			}),
		),
	)
	if err != nil {
		return nil, fmt.Errorf("gagal load AWS config untuk R2: %w", err)
	}

	client := s3.NewFromConfig(awsCfg, func(o *s3.Options) {
		// R2 membutuhkan path-style access (bukan virtual-hosted)
		o.UsePathStyle = true
	})

	return &R2Client{client: client, cfg: cfg}, nil
}

// ─────────────────────────────────────────────────────────────────────────────
// R2StorageService — interface dan implementasi
// ─────────────────────────────────────────────────────────────────────────────

// R2StorageService mendefinisikan operasi file storage yang dibutuhkan auth-service.
type R2StorageService interface {
	// UploadAvatar mengupload foto profil user dan mengembalikan URL publiknya.
	UploadAvatar(userID string, file multipart.File, header *multipart.FileHeader) (string, error)
	// DeleteFile menghapus file dari R2 berdasarkan object key.
	DeleteFile(objectKey string) error
	// GeneratePresignedDownloadURL membuat presigned URL untuk download sementara.
	GeneratePresignedDownloadURL(objectKey string, expiry time.Duration) (string, error)
	// BuildPublicURL membangun URL publik dari object key.
	BuildPublicURL(objectKey string) string
}

// r2StorageServiceImpl adalah implementasi konkret R2StorageService.
type r2StorageServiceImpl struct {
	r2 *R2Client
}

// NewR2StorageService membuat instance R2StorageService yang siap digunakan.
func NewR2StorageService(r2 *R2Client) R2StorageService {
	return &r2StorageServiceImpl{r2: r2}
}

// ─────────────────────────────────────────────────────────────────────────────
// Implementasi
// ─────────────────────────────────────────────────────────────────────────────

// UploadAvatar mengupload foto profil user ke folder "avatars/" di R2.
// Object key yang dibuat: avatars/<userID>/<uuid>.<ext>
// Mengembalikan URL publik file yang baru diupload.
func (s *r2StorageServiceImpl) UploadAvatar(userID string, file multipart.File, header *multipart.FileHeader) (string, error) {
	// Validasi tipe file
	ext := strings.ToLower(filepath.Ext(header.Filename))
	allowedExts := map[string]string{
		".jpg":  "image/jpeg",
		".jpeg": "image/jpeg",
		".png":  "image/png",
		".webp": "image/webp",
		".gif":  "image/gif",
	}
	contentType, ok := allowedExts[ext]
	if !ok {
		return "", fmt.Errorf("format file tidak didukung: %s (hanya jpg, png, webp, gif)", ext)
	}

	// Baca konten file ke buffer
	content, err := io.ReadAll(file)
	if err != nil {
		return "", fmt.Errorf("gagal membaca file avatar: %w", err)
	}

	// Batas ukuran: 5MB untuk avatar
	const maxAvatarSize = 5 * 1024 * 1024
	if int64(len(content)) > maxAvatarSize {
		return "", fmt.Errorf("ukuran file terlalu besar: maksimal 5MB untuk foto profil")
	}

	// Object key: avatars/<userID>/<uuid>.<ext>
	objectKey := fmt.Sprintf("avatars/%s/%s%s", userID, uuid.New().String(), ext)

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	_, err = s.r2.client.PutObject(ctx, &s3.PutObjectInput{
		Bucket:        aws.String(s.r2.cfg.BucketName),
		Key:           aws.String(objectKey),
		Body:          bytes.NewReader(content),
		ContentType:   aws.String(contentType),
		ContentLength: aws.Int64(int64(len(content))),
		// Cache-Control: avatar bisa di-cache browser selama 1 hari
		CacheControl: aws.String("public, max-age=86400"),
		// ACL: private karena akses via custom domain atau presigned URL
		ACL: types.ObjectCannedACLPrivate,
	})
	if err != nil {
		return "", fmt.Errorf("gagal upload avatar ke R2: %w", err)
	}

	return s.BuildPublicURL(objectKey), nil
}

// DeleteFile menghapus file dari R2. Tidak mengembalikan error jika file tidak ditemukan.
func (s *r2StorageServiceImpl) DeleteFile(objectKey string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	_, err := s.r2.client.DeleteObject(ctx, &s3.DeleteObjectInput{
		Bucket: aws.String(s.r2.cfg.BucketName),
		Key:    aws.String(objectKey),
	})
	if err != nil {
		// Log warning, tapi jangan panic — file mungkin sudah tidak ada
		return fmt.Errorf("gagal menghapus file dari R2 (key: %s): %w", objectKey, err)
	}
	return nil
}

// GeneratePresignedDownloadURL membuat presigned URL sementara untuk download file privat.
func (s *r2StorageServiceImpl) GeneratePresignedDownloadURL(objectKey string, expiry time.Duration) (string, error) {
	presignClient := s3.NewPresignClient(s.r2.client)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	req, err := presignClient.PresignGetObject(ctx, &s3.GetObjectInput{
		Bucket: aws.String(s.r2.cfg.BucketName),
		Key:    aws.String(objectKey),
	}, s3.WithPresignExpires(expiry))
	if err != nil {
		return "", fmt.Errorf("gagal membuat presigned URL: %w", err)
	}

	return req.URL, nil
}

// BuildPublicURL membangun URL publik dari object key.
// Jika PublicURL dikonfigurasi, gunakan domain tersebut.
// Jika tidak, fallback ke URL R2 langsung (perlu dikonfigurasi cors di bucket).
func (s *r2StorageServiceImpl) BuildPublicURL(objectKey string) string {
	if s.r2.cfg.PublicURL != "" {
		base := strings.TrimRight(s.r2.cfg.PublicURL, "/")
		return base + "/" + objectKey
	}
	// Fallback: URL R2 bucket langsung
	return fmt.Sprintf("%s/%s/%s",
		s.r2.cfg.EndpointURL(),
		s.r2.cfg.BucketName,
		objectKey,
	)
}
