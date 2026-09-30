package ffmpeg

import (
	"strings"
	"testing"

	"github.com/LiveEuy/transcoder-service/internal/domain"
	"github.com/stretchr/testify/assert"
)

func TestParseProgress(t *testing.T) {
	mockOutput := `
frame=300
fps=29.97
stream_0_0_q=28.0
bitrate=2500.0kbits/s
total_size=1048576
out_time_us=60000000
out_time_ms=60000000
out_time=00:01:00.000000
dup_frames=0
drop_frames=0
speed=2.0x
progress=continue
frame=600
fps=30.00
stream_0_0_q=28.0
bitrate=2500.0kbits/s
total_size=2097152
out_time_us=120000000
out_time_ms=120000000
out_time=00:02:00.000000
dup_frames=0
drop_frames=0
speed=2.0x
progress=end
`

	reader := strings.NewReader(mockOutput)
	totalDuration := 120.0 // 2 menit

	var lastEvent domain.ProgressEvent
	ParseProgress(reader, totalDuration, "job-test-1", func(event domain.ProgressEvent) {
		lastEvent = event
	})

	assert.Equal(t, "job-test-1", lastEvent.JobID)
	assert.Equal(t, domain.StatusProcessing, lastEvent.Status)
	assert.Equal(t, 100.0, lastEvent.Progress)
	assert.Equal(t, "2.0x", lastEvent.Speed)
	assert.Equal(t, 30.00, lastEvent.CurrentFPS)
}
