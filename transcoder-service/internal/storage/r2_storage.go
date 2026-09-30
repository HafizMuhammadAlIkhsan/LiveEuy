package storage

import (
	"context"
	"fmt"
	"io"
)

// R2Storage adalah template implementasi Storage Interface berbasis Cloudflare R2 (S3-compatible API).
// Siap diaktifkan ketika aplikasi akan dideploy ke lingkungan cloud produksi menggunakan AWS SDK Go v2.
type R2Storage struct {
	bucketName    string
	publicBaseURL string
	localStorage  *LocalStorage // Local scratch space sebelum diupload ke R2
}

func NewR2Storage(bucketName, publicBaseURL string, scratchDir string) (*R2Storage, error) {
	local, err := NewLocalStorage(scratchDir, publicBaseURL)
	if err != nil {
		return nil, err
	}

	return &R2Storage{
		bucketName:    bucketName,
		publicBaseURL: publicBaseURL,
		localStorage:  local,
	}, nil
}

func (s *R2Storage) SaveUpload(ctx context.Context, jobID string, filename string, reader io.Reader) (string, error) {
	// 1. Simpan ke local scratch disk untuk diproses FFmpeg
	return s.localStorage.SaveUpload(ctx, jobID, filename, reader)
}

func (s *R2Storage) GetUploadFilePath(jobID string, filename string) string {
	return s.localStorage.GetUploadFilePath(jobID, filename)
}

func (s *R2Storage) GetHLSDir(jobID string) string {
	return s.localStorage.GetHLSDir(jobID)
}

func (s *R2Storage) GetHLSFilePath(jobID string, filename string) string {
	return s.localStorage.GetHLSFilePath(jobID, filename)
}

func (s *R2Storage) OpenHLSFile(jobID string, filename string) (io.ReadCloser, string, int64, error) {
	// Pada R2, file dapat langsung di-redirect ke URL publik CDN Cloudflare R2
	return s.localStorage.OpenHLSFile(jobID, filename)
}

func (s *R2Storage) HLSFileExists(jobID string, filename string) bool {
	return s.localStorage.HLSFileExists(jobID, filename)
}

func (s *R2Storage) DeleteJobFiles(ctx context.Context, jobID string) error {
	// Hapus file scratch lokal & panggil DeleteObjects S3 API
	return s.localStorage.DeleteJobFiles(ctx, jobID)
}

func (s *R2Storage) GetStreamURL(jobID string, filename string) string {
	if s.publicBaseURL != "" {
		return fmt.Sprintf("%s/%s/%s", s.publicBaseURL, jobID, filename)
	}
	return s.localStorage.GetStreamURL(jobID, filename)
}
