package storage

import (
	"context"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"
)

type LocalStorage struct {
	baseDir       string
	streamBaseURL string
}

func NewLocalStorage(baseDir, streamBaseURL string) (*LocalStorage, error) {
	if baseDir == "" {
		baseDir = "./storage"
	}

	uploadsDir := filepath.Join(baseDir, "uploads")
	hlsDir := filepath.Join(baseDir, "hls")

	if err := os.MkdirAll(uploadsDir, 0755); err != nil {
		return nil, fmt.Errorf("gagal membuat direktori upload: %w", err)
	}
	if err := os.MkdirAll(hlsDir, 0755); err != nil {
		return nil, fmt.Errorf("gagal membuat direktori hls: %w", err)
	}

	return &LocalStorage{
		baseDir:       baseDir,
		streamBaseURL: strings.TrimRight(streamBaseURL, "/"),
	}, nil
}

func (s *LocalStorage) SaveUpload(ctx context.Context, jobID string, filename string, reader io.Reader) (string, error) {
	jobUploadDir := filepath.Join(s.baseDir, "uploads", jobID)
	if err := os.MkdirAll(jobUploadDir, 0755); err != nil {
		return "", fmt.Errorf("gagal membuat folder upload job: %w", err)
	}

	targetPath := filepath.Join(jobUploadDir, filename)
	file, err := os.Create(targetPath)
	if err != nil {
		return "", fmt.Errorf("gagal membuat file di disk: %w", err)
	}
	defer file.Close()

	if _, err := io.Copy(file, reader); err != nil {
		return "", fmt.Errorf("gagal menulis data video ke disk: %w", err)
	}

	return targetPath, nil
}

func (s *LocalStorage) GetUploadFilePath(jobID string, filename string) string {
	return filepath.Join(s.baseDir, "uploads", jobID, filename)
}

func (s *LocalStorage) GetHLSDir(jobID string) string {
	dir := filepath.Join(s.baseDir, "hls", jobID)
	_ = os.MkdirAll(dir, 0755)
	return dir
}

func (s *LocalStorage) GetHLSFilePath(jobID string, filename string) string {
	return filepath.Join(s.baseDir, "hls", jobID, filename)
}

func (s *LocalStorage) OpenHLSFile(jobID string, filename string) (io.ReadCloser, string, int64, error) {
	cleanFilename := filepath.Clean(filename)
	if strings.Contains(cleanFilename, "..") {
		return nil, "", 0, fmt.Errorf("invalid file path traversal")
	}

	filePath := filepath.Join(s.baseDir, "hls", jobID, cleanFilename)
	info, err := os.Stat(filePath)
	if err != nil {
		return nil, "", 0, err
	}

	file, err := os.Open(filePath)
	if err != nil {
		return nil, "", 0, err
	}

	contentType := detectMIMEType(cleanFilename)
	return file, contentType, info.Size(), nil
}

func (s *LocalStorage) HLSFileExists(jobID string, filename string) bool {
	filePath := filepath.Join(s.baseDir, "hls", jobID, filepath.Clean(filename))
	info, err := os.Stat(filePath)
	return err == nil && !info.IsDir()
}

func (s *LocalStorage) DeleteJobFiles(ctx context.Context, jobID string) error {
	uploadDir := filepath.Join(s.baseDir, "uploads", jobID)
	hlsDir := filepath.Join(s.baseDir, "hls", jobID)

	var errs []string
	if err := os.RemoveAll(uploadDir); err != nil {
		errs = append(errs, fmt.Sprintf("upload dir: %v", err))
	}
	if err := os.RemoveAll(hlsDir); err != nil {
		errs = append(errs, fmt.Sprintf("hls dir: %v", err))
	}

	if len(errs) > 0 {
		return fmt.Errorf("kesalahan saat menghapus file job: %s", strings.Join(errs, "; "))
	}
	return nil
}

func (s *LocalStorage) GetStreamURL(jobID string, filename string) string {
	return fmt.Sprintf("%s/%s/%s", s.streamBaseURL, jobID, filename)
}

func detectMIMEType(filename string) string {
	ext := strings.ToLower(filepath.Ext(filename))
	switch ext {
	case ".m3u8":
		return "application/vnd.apple.mpegurl"
	case ".ts":
		return "video/MP2T"
	case ".jpg", ".jpeg":
		return "image/jpeg"
	case ".png":
		return "image/png"
	case ".mp4":
		return "video/mp4"
	default:
		return "application/octet-stream"
	}
}
