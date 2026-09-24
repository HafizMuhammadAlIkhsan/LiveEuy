package com.liveeuy.backend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class ReviewRequest {
    @NotNull(message = "Rating tidak boleh kosong")
    @Min(value = 1, message = "Rating minimal 1")
    @Max(value = 10, message = "Rating maksimal 10")
    private Double rating;

    @NotBlank(message = "Komentar tidak boleh kosong")
    private String comment;

    private String userName;

    public ReviewRequest() {}

    public ReviewRequest(Double rating, String comment, String userName) {
        this.rating = rating;
        this.comment = comment;
        this.userName = userName;
    }

    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }
}
