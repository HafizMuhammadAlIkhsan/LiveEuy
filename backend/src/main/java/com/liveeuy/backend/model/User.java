package com.liveeuy.backend.model;

import java.time.LocalDateTime;

public class User {
    private String id;
    private String name;
    private String email;
    private String avatarUrl;
    private String membershipTier; // 'VIP_4K', 'STANDARD', 'GUEST'
    private LocalDateTime createdAt;

    public User() {}

    public User(String id, String name, String email, String avatarUrl, String membershipTier, LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.avatarUrl = avatarUrl;
        this.membershipTier = membershipTier;
        this.createdAt = createdAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }

    public String getMembershipTier() { return membershipTier; }
    public void setMembershipTier(String membershipTier) { this.membershipTier = membershipTier; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
