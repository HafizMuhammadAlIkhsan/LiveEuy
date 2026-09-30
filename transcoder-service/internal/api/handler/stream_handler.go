package handler

import (
	"net/http"
	"strings"

	"github.com/LiveEuy/transcoder-service/internal/storage"
	"github.com/gin-gonic/gin"
)

type StreamHandler struct {
	storage storage.Storage
}

func NewStreamHandler(st storage.Storage) *StreamHandler {
	return &StreamHandler{storage: st}
}

// ServeStream menyajikan file master.m3u8, varian playlist, segmen .ts, dan gambar poster/thumbnail.
func (h *StreamHandler) ServeStream(c *gin.Context) {
	jobID := c.Param("id")
	filepathParam := c.Param("filepath")
	filepathParam = strings.TrimPrefix(filepathParam, "/")

	if filepathParam == "" {
		filepathParam = "master.m3u8"
	}

	reader, contentType, size, err := h.storage.OpenHLSFile(jobID, filepathParam)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "File streaming tidak ditemukan atau belum selesai diproses",
			"error":   "NOT_FOUND",
		})
		return
	}
	defer reader.Close()

	// Set Header respons streaming & CORS
	c.Header("Content-Type", contentType)
	c.Header("Access-Control-Allow-Origin", "*")
	c.Header("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS")
	c.Header("Access-Control-Allow-Headers", "*")

	// Cache control: .ts segmen di-cache lama karena immutable, .m3u8 di-cache pendek
	if strings.HasSuffix(filepathParam, ".ts") {
		c.Header("Cache-Control", "public, max-age=86400")
	} else if strings.HasSuffix(filepathParam, ".m3u8") {
		c.Header("Cache-Control", "no-cache, no-store, must-revalidate")
	}

	c.DataFromReader(http.StatusOK, size, contentType, reader, nil)
}
