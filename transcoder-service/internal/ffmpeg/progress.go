package ffmpeg

import (
	"bufio"
	"io"
	"strconv"
	"strings"
	"time"

	"github.com/LiveEuy/transcoder-service/internal/domain"
)

type ProgressCallback func(event domain.ProgressEvent)

// ParseProgress membaca output stream dari `ffmpeg -progress pipe:1` dan mengkalkulasi persentase progress.
func ParseProgress(r io.Reader, totalDuration float64, jobID string, callback ProgressCallback) {
	scanner := bufio.NewScanner(r)

	var (
		currentFPS  float64
		speedStr    string
		outTimeSec  float64
		lastEmit    time.Time
		throttleInt = 500 * time.Millisecond // Kirim update maksimal setiap 500ms
	)

	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" {
			continue
		}

		parts := strings.SplitN(line, "=", 2)
		if len(parts) != 2 {
			continue
		}

		key := parts[0]
		val := strings.TrimSpace(parts[1])

		switch key {
		case "fps":
			if f, err := strconv.ParseFloat(val, 64); err == nil {
				currentFPS = f
			}
		case "speed":
			speedStr = val
		case "out_time_us":
			if us, err := strconv.ParseFloat(val, 64); err == nil && us > 0 {
				outTimeSec = us / 1000000.0
			}
		case "progress":
			if val == "continue" || val == "end" {
				var percent float64
				if totalDuration > 0 {
					percent = (outTimeSec / totalDuration) * 100.0
					if percent > 99.9 && val != "end" {
						percent = 99.9
					}
				}
				if val == "end" {
					percent = 100.0
				}

				// Hitung ETA
				eta := 0
				speedNum := parseSpeedNumber(speedStr)
				if speedNum > 0 && totalDuration > outTimeSec {
					remainingSec := totalDuration - outTimeSec
					eta = int(remainingSec / speedNum)
				}

				if time.Since(lastEmit) >= throttleInt || val == "end" {
					lastEmit = time.Now()
					if callback != nil {
						callback(domain.ProgressEvent{
							JobID:      jobID,
							Status:     domain.StatusProcessing,
							Progress:   percent,
							Speed:      speedStr,
							CurrentFPS: currentFPS,
							ETASeconds: eta,
						})
					}
				}
			}
		}
	}
}

func parseSpeedNumber(speedStr string) float64 {
	clean := strings.TrimSuffix(strings.TrimSpace(speedStr), "x")
	num, err := strconv.ParseFloat(clean, 64)
	if err != nil || num <= 0 {
		return 1.0
	}
	return num
}
