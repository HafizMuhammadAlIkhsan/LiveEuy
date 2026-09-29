# ==========================================
# Stage 1: Builder
# ==========================================
FROM golang:alpine AS builder

WORKDIR /app

# Cache dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy source code and build
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o /app/trending-service .

# ==========================================
# Stage 2: Minimal Runtime
# ==========================================
FROM alpine:3.21

RUN apk --no-cache add ca-certificates tzdata

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app

COPY --from=builder /app/trending-service /app/trending-service

USER appuser

EXPOSE 3000

CMD ["/app/trending-service"]
