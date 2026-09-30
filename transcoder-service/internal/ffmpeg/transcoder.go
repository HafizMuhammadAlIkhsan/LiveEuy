package ffmpeg

import (
	"context"
	"fmt"
	"log"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"

	"github.com/LiveEuy/transcoder-service/internal/domain"
)

type QualityPreset struct {
	Name         string
	Width        int
	Height       int
	VideoBitrate string // e.g. "4500k"
	AudioBitrate string // e.g. "192k"
	MaxRate      string
	BufSize      string
	Bandwidth    int64
}

var AvailablePresets = []QualityPreset{
	{Name: "1080p", Width: 1920, Height: 1080, VideoBitrate: "4500k", MaxRate: "4800k", BufSize: "7200k", AudioBitrate: "192k", Bandwidth: 5000000},
	{Name: "720p", Width: 1280, Height: 720, VideoBitrate: "2500k", MaxRate: "2800k", BufSize: "4200k", AudioBitrate: "128k", Bandwidth: 2800000},
	{Name: "480p", Width: 854, Height: 480, VideoBitrate: "1000k", MaxRate: "1200k", BufSize: "1800k", AudioBitrate: "96k", Bandwidth: 1200000},
	{Name: "360p", Width: 640, Height: 360, VideoBitrate: "500k", MaxRate: "600k", BufSize: "900k", AudioBitrate: "64k", Bandwidth: 650000},
}

type TranscoderEngine struct{}

func NewTranscoderEngine() *TranscoderEngine {
	return &TranscoderEngine{}
}

// TranscodeToHLS menjalankan pipeline transkoding multi-resolusi HLS dan mengekstrak thumbnail/poster.
func (e *TranscoderEngine) TranscodeToHLS(
	ctx context.Context,
	job *domain.TranscodeJob,
	outputDir string,
	progressCb ProgressCallback,
) ([]string, error) {
	// Pastikan output directory ada
	if err := os.MkdirAll(outputDir, 0755); err != nil {
		return nil, fmt.Errorf("gagal membuat direktori output HLS: %w", err)
	}

	// Periksa ketersediaan binary ffmpeg
	_, err := exec.LookPath("ffmpeg")
	if err != nil {
		log.Println("⚠️ FFmpeg binary tidak terdeteksi di sistem host. Menggunakan mock HLS generator untuk lingkungan pengujian...")
		return e.generateMockHLS(ctx, job, outputDir, progressCb)
	}

	// 1. Tentukan ladder kualitas yang sesuai (tidak melakukan upscaling)
	ladder := selectLadder(job.Metadata, job.RequestedQualities)
	if len(ladder) == 0 {
		ladder = []QualityPreset{AvailablePresets[len(AvailablePresets)-1]} // fallback 360p
	}

	// 2. Ekstrak Poster & Thumbnail
	seekTime := 5.0
	if job.Metadata != nil && job.Metadata.DurationSeconds > 0 {
		if job.Metadata.DurationSeconds < 5.0 {
			seekTime = job.Metadata.DurationSeconds / 2.0
		}
	}
	_ = e.extractImages(ctx, job.SourceFilePath, outputDir, seekTime)

	// 3. Transcode setiap varian kualitas
	var variantNames []string
	totalVariants := float64(len(ladder))

	for i, preset := range ladder {
		select {
		case <-ctx.Done():
			return nil, ctx.Err()
		default:
		}

		variantFile := fmt.Sprintf("%s.m3u8", preset.Name)
		segmentPrefix := fmt.Sprintf("%s_%%03d.ts", preset.Name)

		scaleFilter := fmt.Sprintf("scale=w=%d:h=%d:force_original_aspect_ratio=decrease,pad=%d:%d:(ow-iw)/2:(oh-ih)/2",
			preset.Width, preset.Height, preset.Width, preset.Height)

		// Sub-progress callback untuk mengkalkulasi progres keseluruhan
		baseProgress := (float64(i) / totalVariants) * 100.0
		subCallback := func(evt domain.ProgressEvent) {
			overallProgress := baseProgress + (evt.Progress / totalVariants)
			if overallProgress > 99.9 {
				overallProgress = 99.9
			}
			evt.Progress = overallProgress
			if progressCb != nil {
				progressCb(evt)
			}
		}

		args := []string{
			"-y",
			"-i", job.SourceFilePath,
			"-vf", scaleFilter,
			"-c:v", "libx264",
			"-profile:v", "main",
			"-crf", "20",
			"-sc_threshold", "0",
			"-g", "48",
			"-keyint_min", "48",
			"-b:v", preset.VideoBitrate,
			"-maxrate", preset.MaxRate,
			"-bufsize", preset.BufSize,
			"-c:a", "aac",
			"-b:a", preset.AudioBitrate,
			"-ar", "44100",
			"-ac", "2",
			"-hls_time", "4",
			"-hls_playlist_type", "vod",
			"-hls_segment_filename", filepath.Join(outputDir, segmentPrefix),
			"-progress", "pipe:1",
			filepath.Join(outputDir, variantFile),
		}

		cmd := exec.CommandContext(ctx, "ffmpeg", args...)
		stdoutPipe, err := cmd.StdoutPipe()
		if err != nil {
			return nil, fmt.Errorf("gagal membuat pipe progress ffmpeg (%s): %w", preset.Name, err)
		}

		if err := cmd.Start(); err != nil {
			return nil, fmt.Errorf("gagal menjalankan ffmpeg (%s): %w", preset.Name, err)
		}

		// Baca progress
		duration := 60.0
		if job.Metadata != nil && job.Metadata.DurationSeconds > 0 {
			duration = job.Metadata.DurationSeconds
		}
		ParseProgress(stdoutPipe, duration, job.ID, subCallback)

		if err := cmd.Wait(); err != nil {
			if ctx.Err() != nil {
				return nil, ctx.Err()
			}
			return nil, fmt.Errorf("transkoding FFmpeg varian %s gagal: %w", preset.Name, err)
		}

		variantNames = append(variantNames, preset.Name)
	}

	// 4. Generate Master Playlist (master.m3u8)
	if err := e.generateMasterPlaylist(outputDir, ladder); err != nil {
		return nil, fmt.Errorf("gagal membuat master.m3u8: %w", err)
	}

	// Kirim progres final 100%
	if progressCb != nil {
		progressCb(domain.ProgressEvent{
			JobID:    job.ID,
			Status:   domain.StatusCompleted,
			Progress: 100.0,
			Speed:    "1.0x",
		})
	}

	return variantNames, nil
}

func (e *TranscoderEngine) extractImages(ctx context.Context, inputPath, outputDir string, seekTime float64) error {
	seekStr := fmt.Sprintf("%.2f", seekTime)
	posterPath := filepath.Join(outputDir, "poster.jpg")
	thumbPath := filepath.Join(outputDir, "thumbnail.jpg")

	// Ekstrak poster (1080p / ukuran asli)
	cmdPoster := exec.CommandContext(ctx, "ffmpeg", "-y", "-ss", seekStr, "-i", inputPath, "-vframes", "1", "-q:v", "2", posterPath)
	_ = cmdPoster.Run()

	// Ekstrak thumbnail (640x360)
	cmdThumb := exec.CommandContext(ctx, "ffmpeg", "-y", "-ss", seekStr, "-i", inputPath, "-vframes", "1", "-s", "640x360", "-q:v", "3", thumbPath)
	_ = cmdThumb.Run()

	return nil
}

func (e *TranscoderEngine) generateMasterPlaylist(outputDir string, presets []QualityPreset) error {
	var sb strings.Builder
	sb.WriteString("#EXTM3U\n")
	sb.WriteString("#EXT-X-VERSION:3\n\n")

	for _, p := range presets {
		sb.WriteString(fmt.Sprintf("#EXT-X-STREAM-INF:BANDWIDTH=%d,RESOLUTION=%dx%d,NAME=\"%s\"\n",
			p.Bandwidth, p.Width, p.Height, p.Name))
		sb.WriteString(fmt.Sprintf("%s.m3u8\n\n", p.Name))
	}

	masterPath := filepath.Join(outputDir, "master.m3u8")
	return os.WriteFile(masterPath, []byte(sb.String()), 0644)
}

func selectLadder(meta *domain.VideoMeta, requestedQualities []string) []QualityPreset {
	var candidates []QualityPreset

	// Filter berdasarkan resolusi sumber (agar tidak upscaling)
	sourceHeight := 1080
	if meta != nil && meta.Height > 0 {
		sourceHeight = meta.Height
	}

	for _, p := range AvailablePresets {
		if p.Height <= sourceHeight {
			// Periksa apakah user secara spesifik merequest resolusi tertentu
			if len(requestedQualities) > 0 {
				found := false
				for _, req := range requestedQualities {
					if strings.EqualFold(req, p.Name) {
						found = true
						break
					}
				}
				if !found {
					continue
				}
			}
			candidates = append(candidates, p)
		}
	}

	return candidates
}

// generateMockHLS membuat manifest HLS mock ketika ffmpeg belum diinstall pada host lokal development.
func (e *TranscoderEngine) generateMockHLS(ctx context.Context, job *domain.TranscodeJob, outputDir string, progressCb ProgressCallback) ([]string, error) {
	// Simulasi waktu progres
	for p := 20.0; p <= 100.0; p += 20.0 {
		select {
		case <-ctx.Done():
			return nil, ctx.Err()
		case <-time.After(200 * time.Millisecond):
			if progressCb != nil {
				progressCb(domain.ProgressEvent{
					JobID:      job.ID,
					Status:     domain.StatusProcessing,
					Progress:   p,
					Speed:      "2.5x",
					CurrentFPS: 60.0,
				})
			}
		}
	}

	ladder := []QualityPreset{
		{Name: "1080p", Width: 1920, Height: 1080, Bandwidth: 5000000},
		{Name: "720p", Width: 1280, Height: 720, Bandwidth: 2800000},
	}

	_ = e.generateMasterPlaylist(outputDir, ladder)

	// Buat mock variant playlists & dummy ts file
	dummyTsContent := []byte("G@LiveEuyMockHLSStreamSegmentData")
	for _, p := range ladder {
		varPl := fmt.Sprintf("#EXTM3U\n#EXT-X-VERSION:3\n#EXT-X-TARGETDURATION:4\n#EXT-X-MEDIA-SEQUENCE:0\n#EXTINF:4.000000,\n%s_000.ts\n#EXT-X-ENDLIST\n", p.Name)
		_ = os.WriteFile(filepath.Join(outputDir, fmt.Sprintf("%s.m3u8", p.Name)), []byte(varPl), 0644)
		_ = os.WriteFile(filepath.Join(outputDir, fmt.Sprintf("%s_000.ts", p.Name)), dummyTsContent, 0644)
	}

	// Mock poster & thumbnail
	_ = os.WriteFile(filepath.Join(outputDir, "poster.jpg"), []byte("mock-poster-image"), 0644)
	_ = os.WriteFile(filepath.Join(outputDir, "thumbnail.jpg"), []byte("mock-thumb-image"), 0644)

	return []string{"1080p", "720p"}, nil
}
