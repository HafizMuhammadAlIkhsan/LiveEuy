package models

import "time"

// ─────────────────────────────────────────────────────────────────────────────
// DomainEvent Interface
// ─────────────────────────────────────────────────────────────────────────────

// DomainEvent adalah kontrak umum untuk semua domain event di trending-service.
type DomainEvent interface {
	// EventID mengembalikan ID unik event
	EventID() string
	// EventType mengembalikan tipe event (reverse-DNS convention)
	EventType() string
	// OccurredOn mengembalikan waktu event terjadi (UTC)
	OccurredOn() time.Time
}

// ─────────────────────────────────────────────────────────────────────────────
// Base Event
// ─────────────────────────────────────────────────────────────────────────────

type baseEvent struct {
	id          string
	eventType   string
	occurredOn  time.Time
}

func (b baseEvent) EventID() string       { return b.id }
func (b baseEvent) EventType() string     { return b.eventType }
func (b baseEvent) OccurredOn() time.Time { return b.occurredOn }

func newBase(eventType string) baseEvent {
	return baseEvent{
		id:         time.Now().UTC().Format("20060102150405.000000000"),
		eventType:  eventType,
		occurredOn: time.Now().UTC(),
	}
}

// ─────────────────────────────────────────────────────────────────────────────
// MediaInteractionEvent
// ─────────────────────────────────────────────────────────────────────────────

// MediaInteractionEventType adalah tipe event untuk interaksi pengguna dengan media.
const MediaInteractionEventType = "com.liveeuy.trending.media.interaction"

// MediaInteractionEvent dipublish ketika pengguna berinteraksi dengan media
// (view, like, play). Event ini menjadi dasar kalkulasi trending score.
// Producer: trending-service handler (HandleInteract)
// Consumer: analytics-service, recommendation-service
type MediaInteractionEvent struct {
	baseEvent
	// MediaID yang diinteraksikan
	MediaID string
	// Action yang dilakukan: "view", "like", "play"
	Action string
	// UserID pengguna yang berinteraksi; kosong jika anonim
	UserID string
	// Score delta yang diberikan untuk aksi ini
	ScoreDelta float64
}

// NewMediaInteractionEvent membuat MediaInteractionEvent baru.
func NewMediaInteractionEvent(mediaID, action, userID string, scoreDelta float64) MediaInteractionEvent {
	return MediaInteractionEvent{
		baseEvent:  newBase(MediaInteractionEventType),
		MediaID:    mediaID,
		Action:     action,
		UserID:     userID,
		ScoreDelta: scoreDelta,
	}
}

// ─────────────────────────────────────────────────────────────────────────────
// TrendingScoreUpdatedEvent
// ─────────────────────────────────────────────────────────────────────────────

// TrendingScoreUpdatedEventType adalah tipe event ketika trending score diperbarui.
const TrendingScoreUpdatedEventType = "com.liveeuy.trending.score.updated"

// TrendingScoreUpdatedEvent dipublish setelah trending score sebuah media
// berhasil diperbarui di Redis (setelah proses debounce/aggregasi).
// Producer: trending_worker.go (setelah batch processing)
// Consumer: catalog-service (cache invalidation), search-service (re-rank results)
type TrendingScoreUpdatedEvent struct {
	baseEvent
	// MediaID yang score-nya berubah
	MediaID string
	// Score baru setelah update
	NewScore float64
	// Score sebelum update (untuk delta calculation di consumer)
	PreviousScore float64
	// Posisi ranking baru di leaderboard trending (1-based, 0 jika belum di top)
	Rank int
}

// NewTrendingScoreUpdatedEvent membuat TrendingScoreUpdatedEvent baru.
func NewTrendingScoreUpdatedEvent(mediaID string, newScore, previousScore float64, rank int) TrendingScoreUpdatedEvent {
	return TrendingScoreUpdatedEvent{
		baseEvent:     newBase(TrendingScoreUpdatedEventType),
		MediaID:       mediaID,
		NewScore:      newScore,
		PreviousScore: previousScore,
		Rank:          rank,
	}
}
