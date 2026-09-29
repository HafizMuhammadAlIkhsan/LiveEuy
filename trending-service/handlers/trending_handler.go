package handlers

import (
	"log"
	"trending-service/models"
	"trending-service/services"

	"github.com/gofiber/fiber/v2"
)

type TrendingHandler struct {
	service services.TrendingService
}

func NewTrendingHandler(service services.TrendingService) *TrendingHandler {
	return &TrendingHandler{service: service}
}

func (h *TrendingHandler) HandleInteract(c *fiber.Ctx) error {
	var req models.InteractionRequest

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  400,
			"message": "Format request tidak valid",
		})
	}

	if req.MediaID == "" || req.Action == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  400,
			"message": "mediaId dan action wajib diisi",
		})
	}

	err := h.service.TrackInteraction(c.Context(), req)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  500,
			"message": err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"status":  200,
		"message": "Interaksi berhasil direkam",
	})
}

func (h *TrendingHandler) HandleGetTrending(c *fiber.Ctx) error {
	trendingMedia, err := h.service.GetTrendingMedia(c.Context(), 10)
	if err != nil {
		log.Printf("❌ Error HandleGetTrending: %v", err)

		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  500,
			"message": err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"status":  200,
		"message": "Success",
		"data":    trendingMedia,
	})
}