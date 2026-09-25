package com.liveeuy.backend.model;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Entitas data profil dan status akun pengguna LiveEuy")
public class User {

    @Schema(description = "Identifier unik akun pengguna (UUID)", example = "usr-018f3a5b-9b4e")
    private String id;

    @Schema(description = "Nama lengkap pengguna", example = "Hafiz Muhammad")
    private String name;

    @Schema(description = "Alamat email terdaftar", example = "hafiz@liveeuy.id")
    private String email;

    @Schema(description = "URL foto avatar profil", example = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80")
    private String avatar;

    @Schema(description = "Tingkatan langganan aktif", example = "VIP Cinema Ultra", allowableValues = {"Free Guest", "VIP Standard", "VIP Cinema Ultra"})
    private String tier;

    @Schema(description = "Tanggal pertama kali mendaftar", example = "September 2024")
    private String memberSince;

    @Schema(description = "Estimasi total akumulasi jam menonton tayangan", example = "48.5")
    private Double watchHours;

    @Schema(description = "Maksimal perangkat yang dapat melakukan streaming simultan", example = "4")
    private Integer devices;

    public User() {
    }

    public User(String id, String name, String email, String avatar, String tier, String memberSince, Double watchHours, Integer devices) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.avatar = avatar;
        this.tier = tier;
        this.memberSince = memberSince;
        this.watchHours = watchHours;
        this.devices = devices;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getAvatar() {
        return avatar;
    }

    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }

    public String getTier() {
        return tier;
    }

    public void setTier(String tier) {
        this.tier = tier;
    }

    public String getMemberSince() {
        return memberSince;
    }

    public void setMemberSince(String memberSince) {
        this.memberSince = memberSince;
    }

    public Double getWatchHours() {
        return watchHours;
    }

    public void setWatchHours(Double watchHours) {
        this.watchHours = watchHours;
    }

    public Integer getDevices() {
        return devices;
    }

    public void setDevices(Integer devices) {
        this.devices = devices;
    }
}
