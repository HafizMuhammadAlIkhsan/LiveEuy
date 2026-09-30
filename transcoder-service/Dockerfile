# ==========================================
# STAGE 1: Builder
# ==========================================
FROM golang:1.24-alpine AS builder

WORKDIR /app

# Install dependensi dasar build
RUN apk add --no-cache git

# Cache dependensi module Go
COPY go.mod go.sum* ./
RUN go mod download

# Salin source code
COPY . .

# Build static binary
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /app/bin/transcoder-service ./cmd/server

# ==========================================
# STAGE 2: Runner Image dengan FFmpeg
# ==========================================
FROM alpine:3.20

WORKDIR /app

# Install FFmpeg, sertifikat CA, dan zona waktu
RUN apk add --no-cache ffmpeg ca-certificates tzdata

# Buat folder storage untuk uploads dan hls output
RUN mkdir -p /app/storage/uploads /app/storage/hls

# Salin binary dari builder
COPY --from=builder /app/bin/transcoder-service /app/transcoder-service

# Expose port service
EXPOSE 8082

# Volume persistent untuk data video
VOLUME ["/app/storage"]

CMD ["/app/transcoder-service"]
