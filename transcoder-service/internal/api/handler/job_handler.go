package handler

import (
	"fmt"
	"io"
	"net/http"
	"strconv"
	"strings"

	"github.com/LiveEuy/transcoder-service/internal/domain"
	"github.com/LiveEuy/transcoder-service/internal/service"
	"github.com/gin-gonic/gin"
)

type JobHandler struct {
	svc *service.TranscoderService
}

func NewJobHandler(svc *service.TranscoderService) *JobHandler {
	return &JobHandler{svc: svc}
}

// CreateJob menangani upload video baru dan memasukkannya ke antrean transkoding (Admin Only).
func (h *JobHandler) CreateJob(c *gin.Context) {
	fileHeader, err := c.FormFile("video")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "File video ('video') wajib disertakan dalam request form-data",
			"error":   "BAD_REQUEST",
			"code":    "TRANSCODER_400_MISSING_FILE",
		})
		return
	}

	srcFile, err := fileHeader.Open()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Gagal membaca stream file yang diunggah",
			"error":   "INTERNAL_ERROR",
		})
		return
	}
	defer srcFile.Close()

	// Parse field lainnya
	mediaID := c.PostForm("mediaId")
	episodeID := c.PostForm("episodeId")
	title := c.PostForm("title")
	qualitiesRaw := c.PostFormArray("qualities")
	if len(qualitiesRaw) == 0 && c.PostForm("qualities") != "" {
		qualitiesRaw = strings.Split(c.PostForm("qualities"), ",")
	}

	req := domain.TranscodeRequest{
		MediaID:   mediaID,
		EpisodeID: episodeID,
		Title:     title,
		Qualities: qualitiesRaw,
	}

	adminUser, _ := c.Get("user_email")
	adminEmail, _ := adminUser.(string)

	job, err := h.svc.CreateJob(c.Request.Context(), req, fileHeader.Filename, fileHeader.Size, srcFile, adminEmail)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": fmt.Sprintf("Gagal membuat job transkoding: %v", err),
			"error":   "INTERNAL_ERROR",
		})
		return
	}

	c.JSON(http.StatusAccepted, gin.H{
		"success": true,
		"message": "Job transkoding video berhasil dibuat dan dimasukkan ke dalam antrean",
		"data":    job,
	})
}

// GetJob mengembalikan detail dan progres job transkoding tertentu (Admin Only).
func (h *JobHandler) GetJob(c *gin.Context) {
	jobID := c.Param("id")
	job, exists := h.svc.GetJob(jobID)
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": fmt.Sprintf("Job dengan ID '%s' tidak ditemukan", jobID),
			"error":   "NOT_FOUND",
			"code":    "TRANSCODER_404_JOB_NOT_FOUND",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    job,
	})
}

// ListJobs mengembalikan daftar seluruh job transkoding dengan filter dan pagination (Admin Only).
func (h *JobHandler) ListJobs(c *gin.Context) {
	status := strings.ToUpper(c.Query("status"))
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	jobs, total := h.svc.ListJobs(status, page, limit)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"jobs":  jobs,
			"total": total,
			"page":  page,
			"limit": limit,
		},
	})
}

// CancelJob membatalkan job yang sedang berjalan atau antre (Admin Only).
func (h *JobHandler) CancelJob(c *gin.Context) {
	jobID := c.Param("id")
	if err := h.svc.CancelJob(jobID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": err.Error(),
			"error":   "BAD_REQUEST",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": fmt.Sprintf("Job '%s' berhasil dibatalkan", jobID),
	})
}

// DeleteJob membatalkan job dan menghapus seluruh file fisiknya dari storage (Admin Only).
func (h *JobHandler) DeleteJob(c *gin.Context) {
	jobID := c.Param("id")
	if err := h.svc.DeleteJob(c.Request.Context(), jobID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": fmt.Sprintf("Gagal menghapus file job: %v", err),
			"error":   "INTERNAL_ERROR",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": fmt.Sprintf("Job '%s' beserta seluruh berkas videonya berhasil dihapus", jobID),
	})
}

// JobProgressSSE menyiarkan update progres transkoding secara real-time via Server-Sent Events (Admin Only).
func (h *JobHandler) JobProgressSSE(c *gin.Context) {
	jobID := c.Param("id")
	ch, unsubscribe := h.svc.SubscribeProgress(jobID)
	defer unsubscribe()

	c.Writer.Header().Set("Content-Type", "text/event-stream")
	c.Writer.Header().Set("Cache-Control", "no-cache")
	c.Writer.Header().Set("Connection", "keep-alive")

	c.Stream(func(w io.Writer) bool {
		select {
		case <-c.Request.Context().Done():
			return false
		case evt, ok := <-ch:
			if !ok {
				return false
			}
			c.SSEvent("progress", evt)
			return true
		}
	})
}
