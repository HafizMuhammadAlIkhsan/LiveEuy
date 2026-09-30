package storage

import (
	"context"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestLocalStorage_SaveUploadAndHLS(t *testing.T) {
	tempDir, err := os.MkdirTemp("", "transcoder_test_*")
	assert.NoError(t, err)
	defer os.RemoveAll(tempDir)

	storage, err := NewLocalStorage(tempDir, "http://localhost/api/v1/transcoder/stream")
	assert.NoError(t, err)

	ctx := context.Background()
	jobID := "job-test-123"

	// 1. Test SaveUpload
	uploadContent := "Dummy video raw data byte stream"
	reader := strings.NewReader(uploadContent)
	savedPath, err := storage.SaveUpload(ctx, jobID, "video.mp4", reader)
	assert.NoError(t, err)
	assert.FileExists(t, savedPath)

	// 2. Test GetHLSDir and HLS File handling
	hlsDir := storage.GetHLSDir(jobID)
	assert.DirExists(t, hlsDir)

	masterContent := "#EXTM3U\n#EXT-X-STREAM-INF:BANDWIDTH=5000000\n1080p.m3u8\n"
	err = os.WriteFile(filepath.Join(hlsDir, "master.m3u8"), []byte(masterContent), 0644)
	assert.NoError(t, err)

	assert.True(t, storage.HLSFileExists(jobID, "master.m3u8"))
	assert.False(t, storage.HLSFileExists(jobID, "non_existent.m3u8"))

	// 3. Test OpenHLSFile
	fReader, contentType, size, err := storage.OpenHLSFile(jobID, "master.m3u8")
	assert.NoError(t, err)
	assert.Equal(t, "application/vnd.apple.mpegurl", contentType)
	assert.Equal(t, int64(len(masterContent)), size)
	_ = fReader.Close()

	// 4. Test Stream URL
	streamURL := storage.GetStreamURL(jobID, "master.m3u8")
	assert.Equal(t, "http://localhost/api/v1/transcoder/stream/job-test-123/master.m3u8", streamURL)

	// 5. Test DeleteJobFiles
	err = storage.DeleteJobFiles(ctx, jobID)
	assert.NoError(t, err)
	assert.NoFileExists(t, savedPath)
	assert.NoDirExists(t, hlsDir)
}
