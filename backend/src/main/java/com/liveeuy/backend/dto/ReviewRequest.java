package com.liveeuy.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Payload permintaan untuk mengirimkan ulasan dan rating penonton")
public class ReviewRequest {

    @NotBlank(message = "Nama pengulas tidak boleh kosong")
    @Schema(description = "Nama pemberi ulasan", example = "Rian Pratama")
    private String author;

    @Min(value = 1, message = "Rating minimal 1")
    @Max(value = 10, message = "Rating maksimal 10")
    @Schema(description = "Nilai rating film (1 - 10)", example = "9.5")
    private double rating;

    @NotBlank(message = "Komentar ulasan tidak boleh kosong")
    @Schema(description = "Isi teks ulasan atau tanggapan", example = "Sinematografi dan efek audionya luar biasa!")
    private String comment;

    public ReviewRequest() {}

    public ReviewRequest(String author, double rating, String comment) {
        this.author = author;
        this.rating = rating;
        this.comment = comment;
    }

    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }

    public double getRating() { return rating; }
    public void setRating(double rating) { this.rating = rating; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
}
