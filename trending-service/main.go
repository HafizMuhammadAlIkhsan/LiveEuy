package main

import (
	"log"
	"os"

	"trending-service/config"
	"trending-service/handlers"
	"trending-service/services"

	"github.com/gofiber/fiber/v2"
	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("⚠️ File .env tidak ditemukan.")
	}

	redisClient := config.ConnectRedis()
	defer redisClient.Close()

	trendingService := services.NewTrendingService(redisClient)
	trendingHandler := handlers.NewTrendingHandler(trendingService)

	app := fiber.New(fiber.Config{
		AppName: "Trending Service v1.0",
	})

	api := app.Group("/api/v1")

	app.Get("/ping", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status":  200,
			"message": "Pong! Trending Service menyala dan terkoneksi ke Redis.",
		})
	})

	api.Post("/trending/interact", trendingHandler.HandleInteract)
	api.Get("/trending", trendingHandler.HandleGetTrending)

	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}

	log.Printf("🚀 Server berjalan di http://localhost:%s", port)
	log.Fatal(app.Listen(":" + port))
}