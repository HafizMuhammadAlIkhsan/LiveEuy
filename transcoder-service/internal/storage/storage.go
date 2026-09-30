package storage

import (
	"context"
	"io"
)

// Storage mendefinisikan interface abstraksi penyimpanan untuk file video mentah dan output HLS.
// Arsitektur ini memungkinkan pergantian tanpa mengubah business logic dari LocalStorage (docker/disk)
// ke Cloudflare R2 / AWS S3 Storage saat deployment produksi.
type Storage interface {
	// SaveUpload menyimpan file upload video mentah ke media penyimpanan.
	SaveUpload(ctx context.Context, jobID string, filename string, reader io.Reader) (string, error)

	// GetUploadFilePath mengembalikan path file upload untuk dibaca oleh FFmpeg.
	GetUploadFilePath(jobID string, filename string) string

	// GetHLSDir mengembalikan path direktori lokal tempat FFmpeg menulis potongan HLS (.m3u8 & .ts).
	GetHLSDir(jobID string) string

	// GetHLSFilePath mengembalikan path file tertentu di dalam folder HLS job.
	GetHLSFilePath(jobID string, filename string) string

	// OpenHLSFile membuka stream pembacaan file HLS untuk di-serve ke browser/player.
	OpenHLSFile(jobID string, filename string) (io.ReadCloser, string, int64, error)

	// HLSFileExists memeriksa apakah file HLS tertentu (playlist/ts) tersedia.
	HLSFileExists(jobID string, filename string) bool

	// DeleteJobFiles membersihkan file mentah dan artefak HLS saat job dibatalkan atau dihapus.
	DeleteJobFiles(ctx context.Context, jobID string) error

	// GetStreamURL menyusun URL publik HLS untuk pemutaran video.
	GetStreamURL(jobID string, filename string) string
}
