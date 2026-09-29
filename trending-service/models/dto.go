package models

type InteractionRequest struct {
	MediaID string `json:"mediaId"`
	Action  string `json:"action"`
}

type MediaResponse struct {
	ID              string   `json:"id"`
	Title           string   `json:"title"`
	Type            string   `json:"type"`
	PosterUrl       string   `json:"posterUrl"`
	Genres          []string `json:"genres"`
}

type CatalogBatchResponse struct {
	Status  int             `json:"status"`
	Message string          `json:"message"`
	Data    []MediaResponse `json:"data"`
}