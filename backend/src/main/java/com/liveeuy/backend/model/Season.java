package com.liveeuy.backend.model;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

@Schema(description = "Data musim (season) penayangan serial TV")
public class Season {

    @Schema(description = "Nomor musim", example = "1")
    private int seasonNumber;

    @Schema(description = "Nama / judul musim", example = "Musim 1: Kode Pembuka")
    private String title;

    @Schema(description = "Daftar episode dalam musim ini")
    private List<Episode> episodes;

    public Season() {}

    public Season(int seasonNumber, String title, List<Episode> episodes) {
        this.seasonNumber = seasonNumber;
        this.title = title;
        this.episodes = episodes;
    }

    public int getSeasonNumber() { return seasonNumber; }
    public void setSeasonNumber(int seasonNumber) { this.seasonNumber = seasonNumber; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public List<Episode> getEpisodes() { return episodes; }
    public void setEpisodes(List<Episode> episodes) { this.episodes = episodes; }
}
