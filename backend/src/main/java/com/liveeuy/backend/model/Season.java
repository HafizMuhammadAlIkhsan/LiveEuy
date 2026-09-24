package com.liveeuy.backend.model;

import java.util.List;

public class Season {
    private String id;
    private int seasonNumber;
    private String title;
    private List<Episode> episodes;

    public Season() {}

    public Season(String id, int seasonNumber, String title, List<Episode> episodes) {
        this.id = id;
        this.seasonNumber = seasonNumber;
        this.title = title;
        this.episodes = episodes;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public int getSeasonNumber() { return seasonNumber; }
    public void setSeasonNumber(int seasonNumber) { this.seasonNumber = seasonNumber; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public List<Episode> getEpisodes() { return episodes; }
    public void setEpisodes(List<Episode> episodes) { this.episodes = episodes; }
}
