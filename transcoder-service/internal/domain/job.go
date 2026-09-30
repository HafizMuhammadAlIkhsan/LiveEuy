package domain

import (
	"time"
)

type JobStatus string

const (
	StatusQueued     JobStatus = "QUEUED"
	StatusProcessing JobStatus = "PROCESSING"
	StatusCompleted  JobStatus = "COMPLETED"
	StatusFailed     JobStatus = "FAILED"
	StatusCancelled  JobStatus = "CANCELLED"
)

type VideoMeta struct {
	DurationSeconds float64 `json:"durationSeconds"`
	Width           int     `json:"width"`
	Height          int     `json:"height"`
	VideoCodec      string  `json:"videoCodec"`
	AudioCodec      string  `json:"audioCodec"`
	Bitrate         int64   `json:"bitrate"`
	FPS             float64 `json:"fps"`
}

type TranscodeJob struct {
	ID                 string     `json:"id"`
	MediaID            string     `json:"mediaId,omitempty"`
	EpisodeID          string     `json:"episodeId,omitempty"`
	Title              string     `json:"title"`
	OriginalFilename   string     `json:"originalFilename"`
	SourceFilePath     string     `json:"-"` // Internal path
	FileSize           int64      `json:"fileSize"`
	Status             JobStatus  `json:"status"`
	Progress           float64    `json:"progress"` // 0.0 - 100.0%
	Speed              string     `json:"speed,omitempty"`
	CurrentFPS         float64    `json:"currentFps,omitempty"`
	ETASeconds         int        `json:"etaSeconds,omitempty"`
	ErrorMessage       string     `json:"errorMessage,omitempty"`
	RequestedQualities []string   `json:"requestedQualities"`
	AvailableVariants  []string   `json:"availableVariants,omitempty"`
	MasterPlaylistURL  string     `json:"masterPlaylistUrl,omitempty"`
	ThumbnailURL       string     `json:"thumbnailUrl,omitempty"`
	PosterURL          string     `json:"posterUrl,omitempty"`
	Metadata           *VideoMeta `json:"metadata,omitempty"`
	CreatedBy          string     `json:"createdBy,omitempty"`
	CreatedAt          time.Time  `json:"createdAt"`
	UpdatedAt          time.Time  `json:"updatedAt"`
	CompletedAt        *time.Time `json:"completedAt,omitempty"`
}

type ProgressEvent struct {
	JobID      string    `json:"jobId"`
	Status     JobStatus `json:"status"`
	Progress   float64   `json:"progress"`
	Speed      string    `json:"speed"`
	CurrentFPS float64   `json:"currentFps"`
	ETASeconds int       `json:"etaSeconds"`
}

type TranscodeRequest struct {
	MediaID   string   `form:"mediaId"`
	EpisodeID string   `form:"episodeId"`
	Title     string   `form:"title"`
	Qualities []string `form:"qualities"`
}
