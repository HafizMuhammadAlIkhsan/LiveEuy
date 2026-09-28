package com.liveeuy.backend.model;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;

@Schema(description = "Data ulasan dan penilaian penonton")
public class Review {

    @Schema(description = "ID ulasan", example = "rev-1")
    private String id;

    @Schema(description = "ID media terkait", example = "m1")
    private String mediaId;

    @Schema(description = "Nama pemberi ulasan", example = "Rian Pratama")
    private String author;

    @Schema(description = "URL avatar profil penonton")
    private String avatar;

    @Schema(description = "Rating nilai (1 - 10)", example = "10")
    private double rating;

    @Schema(description = "Waktu pemberian ulasan", example = "2 hari yang lalu")
    private String date;

    @Schema(description = "Komentar teks ulasan")
    private String comment;

    private LocalDateTime createdAt;
    private int likesCount;

    public Review() {}

    public Review(String id, String author, String avatar, double rating, String date, String comment) {
        this.id = id;
        this.author = author;
        this.avatar = avatar;
        this.rating = rating;
        this.date = date;
        this.comment = comment;
        this.createdAt = LocalDateTime.now();
    }

    public Review(String id, String mediaId, String author, String avatar, double rating, String comment, LocalDateTime createdAt, int likesCount) {
        this.id = id;
        this.mediaId = mediaId;
        this.author = author;
        this.avatar = avatar;
        this.rating = rating;
        this.comment = comment;
        this.createdAt = createdAt;
        this.likesCount = likesCount;
        this.date = "Baru saja";
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getMediaId() { return mediaId; }
    public void setMediaId(String mediaId) { this.mediaId = mediaId; }

    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }

    public String getUserName() { return author; }
    public void setUserName(String userName) { this.author = userName; }

    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }

    public String getUserAvatarUrl() { return avatar; }
    public void setUserAvatarUrl(String userAvatarUrl) { this.avatar = userAvatarUrl; }

    public double getRating() { return rating; }
    public void setRating(double rating) { this.rating = rating; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public int getLikesCount() { return likesCount; }
    public void setLikesCount(int likesCount) { this.likesCount = likesCount; }
}
