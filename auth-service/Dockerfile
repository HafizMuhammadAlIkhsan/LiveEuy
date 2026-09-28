FROM golang:1.24.3-alpine
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go build -o /auth-service ./cmd/server
EXPOSE 8080
CMD ["/auth-service"]