package com.liveeuy.backend.model;

import java.time.LocalDateTime;

public class Review {
    private String id;
    private String mediaId;
    private String userName;
    private String userAvatarUrl;
    private double rating;
    private String comment;
    private LocalDateTime createdAt;
    private int likesCount;

    public Review() {}

    public Review(String id, String mediaId, String userName, String userAvatarUrl,
                  double rating, String comment, LocalDateTime createdAt, int likesCount) {
        this.id = id;
        this.mediaId = mediaId;
        this.userName = userName;
        this.userAvatarUrl = userAvatarUrl;
        this.rating = rating;
        this.comment = comment;
        this.createdAt = createdAt;
        this.likesCount = likesCount;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getMediaId() { return mediaId; }
    public void setMediaId(String mediaId) { this.mediaId = mediaId; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public String getUserAvatarUrl() { return userAvatarUrl; }
    public void setUserAvatarUrl(String userAvatarUrl) { this.userAvatarUrl = userAvatarUrl; }

    public double getRating() { return rating; }
    public void setRating(double rating) { this.rating = rating; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public int getLikesCount() { return likesCount; }
    public void setLikesCount(int likesCount) { this.likesCount = likesCount; }
}
