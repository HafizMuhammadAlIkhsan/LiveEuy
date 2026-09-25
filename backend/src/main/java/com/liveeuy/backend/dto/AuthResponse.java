package com.liveeuy.backend.dto;

import com.liveeuy.backend.model.User;

public class AuthResponse {

    private String accessToken;
    private String refreshToken; // Provided for clients (Mobile/API tools) that don't rely on cookies
    private String tokenType = "Bearer";
    private long expiresIn; // Token lifetime in seconds (e.g. 900 = 15 minutes)
    private User user;

    public AuthResponse() {}

    public AuthResponse(String accessToken, String refreshToken, long expiresIn, User user) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.tokenType = "Bearer";
        this.expiresIn = expiresIn;
        this.user = user;
    }

    public String getAccessToken() { return accessToken; }
    public void setAccessToken(String accessToken) { this.accessToken = accessToken; }

    public String getRefreshToken() { return refreshToken; }
    public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }

    public String getTokenType() { return tokenType; }
    public void setTokenType(String tokenType) { this.tokenType = tokenType; }

    public long getExpiresIn() { return expiresIn; }
    public void setExpiresIn(long expiresIn) { this.expiresIn = expiresIn; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
}
