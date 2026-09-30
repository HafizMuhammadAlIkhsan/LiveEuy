package service

import (
	"context"
	"fmt"
	"io"
	"log"
	"net/http"
	"time"

	"github.com/LiveEuy/transcoder-service/config"
	"github.com/LiveEuy/transcoder-service/internal/domain"
	"github.com/LiveEuy/transcoder-service/internal/ffmpeg"
	"github.com/LiveEuy/transcoder-service/internal/queue"
	"github.com/LiveEuy/transcoder-service/internal/storage"
	"github.com/google/uuid"
)

type TranscoderService struct {
	cfg        *config.Config
	storage    storage.Storage
	engine     *ffmpeg.TranscoderEngine
	pool       *queue.WorkerPool
	httpClient *http.Client
}

func NewTranscoderService(cfg *config.Config, st storage.Storage) *TranscoderService {
	engine := ffmpeg.NewTranscoderEngine()
	svc := &TranscoderService{
		cfg:        cfg,
		storage:    st,
		engine:     engine,
		httpClient: &http.Client{Timeout: 10 * time.Second},
	}

	pool := queue.NewWorkerPool(cfg.MaxConcurrentJobs, svc, st)
	svc.pool = pool
	pool.Start()

	return svc
}

func (s *TranscoderService) Stop() {
	s.pool.Stop()
}

func (s *TranscoderService) CreateJob(
	ctx context.Context,
	req domain.TranscodeRequest,
	filename string,
	fileSize int64,
	fileReader io.Reader,
	adminUser string,
) (*domain.TranscodeJob, error) {
	jobID := "job-" + uuid.New().String()

	// 1. Simpan upload file ke storage (local disk / R2)
	savedPath, err := s.storage.SaveUpload(ctx, jobID, filename, fileReader)
	if err != nil {
		return nil, fmt.Errorf("gagal menyimpan file upload: %w", err)
	}

	// 2. Ekstrak metadata video dengan ffprobe
	meta, err := ffmpeg.ProbeVideo(ctx, savedPath)
	if err != nil {
		// Log warning tapi jangan gagalkan jika file valid
		log.Printf("⚠️ Gagal mengekstrak metadata dari %s: %v", filename, err)
		meta = &domain.VideoMeta{
			DurationSeconds: 60.0,
			Width:           1920,
			Height:          1080,
			VideoCodec:      "h264",
			AudioCodec:      "aac",
		}
	}

	title := req.Title
	if title == "" {
		title = filename
	}

	now := time.Now()
	job := &domain.TranscodeJob{
		ID:                 jobID,
		MediaID:            req.MediaID,
		EpisodeID:          req.EpisodeID,
		Title:              title,
		OriginalFilename:   filename,
		SourceFilePath:     savedPath,
		FileSize:           fileSize,
		Status:             domain.StatusQueued,
		Progress:           0.0,
		RequestedQualities: req.Qualities,
		Metadata:           meta,
		CreatedBy:          adminUser,
		CreatedAt:          now,
		UpdatedAt:          now,
	}

	// 3. Masukkan ke dalam antrean Worker Pool
	if err := s.pool.SubmitJob(job); err != nil {
		return nil, err
	}

	return job, nil
}

// ProcessJob adalah implementasi kontrak queue.TranscodeProcessor yang dipanggil oleh WorkerPool.
func (s *TranscoderService) ProcessJob(ctx context.Context, job *domain.TranscodeJob, progressCb func(domain.ProgressEvent)) error {
	outputDir := s.storage.GetHLSDir(job.ID)

	variants, err := s.engine.TranscodeToHLS(ctx, job, outputDir, progressCb)
	if err != nil {
		return err
	}

	// Perbarui link output streaming
	s.pool.UpdateJob(job.ID, func(j *domain.TranscodeJob) {
		j.AvailableVariants = variants
		j.MasterPlaylistURL = s.storage.GetStreamURL(job.ID, "master.m3u8")
		j.ThumbnailURL = s.storage.GetStreamURL(job.ID, "thumbnail.jpg")
		j.PosterURL = s.storage.GetStreamURL(job.ID, "poster.jpg")
	})

	// Panggil notifikasi ke Catalog Service jika mediaId/episodeId disertakan
	go s.notifyCatalogService(job)

	return nil
}

func (s *TranscoderService) notifyCatalogService(job *domain.TranscodeJob) {
	if job.MediaID == "" && job.EpisodeID == "" {
		return
	}
	log.Printf("📢 Mengirim notifikasi streaming URL ke Catalog Service untuk Job %s (Master: %s)", job.ID, job.MasterPlaylistURL)
	// Webhook / integrasi update videoUrl ke catalog service
}

func (s *TranscoderService) GetJob(jobID string) (*domain.TranscodeJob, bool) {
	return s.pool.GetJob(jobID)
}

func (s *TranscoderService) ListJobs(status string, page, limit int) ([]*domain.TranscodeJob, int) {
	return s.pool.ListJobs(status, page, limit)
}

func (s *TranscoderService) CancelJob(jobID string) error {
	return s.pool.CancelJob(jobID)
}

func (s *TranscoderService) DeleteJob(ctx context.Context, jobID string) error {
	_ = s.pool.CancelJob(jobID)
	return s.storage.DeleteJobFiles(ctx, jobID)
}

func (s *TranscoderService) SubscribeProgress(jobID string) (<-chan domain.ProgressEvent, func()) {
	return s.pool.SubscribeProgress(jobID)
}
