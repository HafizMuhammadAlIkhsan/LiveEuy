# ==========================================
# Stage 1: Builder
# ==========================================
FROM golang:1.24-alpine AS builder

RUN apk add --no-cache git

WORKDIR /app

# Cache dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy application source
COPY . .

# Compile static binary
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o /app/auth-service ./cmd/server

# ==========================================
# Stage 2: Runtime
# ==========================================
FROM alpine:3.21

# Install CA certificates for TLS (Google OAuth, DB TLS) and timezone data
RUN apk --no-cache add ca-certificates tzdata

# Create non-root user and group
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app

# Create certs directory for RSA keys with proper ownership
RUN mkdir -p /app/certs && chown -R appuser:appgroup /app

# Copy binary from builder
COPY --from=builder /app/auth-service /app/auth-service

# Switch to non-root user
USER appuser

EXPOSE 8080

CMD ["/app/auth-service"]