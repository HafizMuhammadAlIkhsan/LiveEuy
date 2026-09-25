package com.liveeuy.backend.model;

import java.util.List;

public class MediaItem {
    private String id;
    private String title;
    private String synopsis;
    private String posterUrl;
    private String backdropUrl;
    private String videoUrl;
    private double matchScore;
    private String ageRating;
    private List<String> resolutionBadges;
    private String genre;
    private String durationOrSeasons;
    private int releaseYear;
    private String director;
    private List<String> cast;
    private boolean isTop10;
    private Integer top10Rank;
    private double userRating;
    private double continueWatchingProgress;
    private List<Season> seasons;

    public MediaItem() {}

    public MediaItem(String id, String title, String synopsis, String posterUrl, String backdropUrl,
                     String videoUrl, double matchScore, String ageRating, List<String> resolutionBadges,
                     String genre, String durationOrSeasons, int releaseYear, String director,
                     List<String> cast, boolean isTop10, Integer top10Rank, double userRating,
                     double continueWatchingProgress, List<Season> seasons) {
        this.id = id;
        this.title = title;
        this.synopsis = synopsis;
        this.posterUrl = posterUrl;
        this.backdropUrl = backdropUrl;
        this.videoUrl = videoUrl;
        this.matchScore = matchScore;
        this.ageRating = ageRating;
        this.resolutionBadges = resolutionBadges;
        this.genre = genre;
        this.durationOrSeasons = durationOrSeasons;
        this.releaseYear = releaseYear;
        this.director = director;
        this.cast = cast;
        this.isTop10 = isTop10;
        this.top10Rank = top10Rank;
        this.userRating = userRating;
        this.continueWatchingProgress = continueWatchingProgress;
        this.seasons = seasons;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getSynopsis() { return synopsis; }
    public void setSynopsis(String synopsis) { this.synopsis = synopsis; }

    public String getPosterUrl() { return posterUrl; }
    public void setPosterUrl(String posterUrl) { this.posterUrl = posterUrl; }

    public String getBackdropUrl() { return backdropUrl; }
    public void setBackdropUrl(String backdropUrl) { this.backdropUrl = backdropUrl; }

    public String getVideoUrl() { return videoUrl; }
    public void setVideoUrl(String videoUrl) { this.videoUrl = videoUrl; }

    public double getMatchScore() { return matchScore; }
    public void setMatchScore(double matchScore) { this.matchScore = matchScore; }

    public String getAgeRating() { return ageRating; }
    public void setAgeRating(String ageRating) { this.ageRating = ageRating; }

    public List<String> getResolutionBadges() { return resolutionBadges; }
    public void setResolutionBadges(List<String> resolutionBadges) { this.resolutionBadges = resolutionBadges; }

    public String getGenre() { return genre; }
    public void setGenre(String genre) { this.genre = genre; }

    public String getDurationOrSeasons() { return durationOrSeasons; }
    public void setDurationOrSeasons(String durationOrSeasons) { this.durationOrSeasons = durationOrSeasons; }

    public int getReleaseYear() { return releaseYear; }
    public void setReleaseYear(int releaseYear) { this.releaseYear = releaseYear; }

    public String getDirector() { return director; }
    public void setDirector(String director) { this.director = director; }

    public List<String> getCast() { return cast; }
    public void setCast(List<String> cast) { this.cast = cast; }

    public boolean isTop10() { return isTop10; }
    public void setTop10(boolean top10) { isTop10 = top10; }

    public Integer getTop10Rank() { return top10Rank; }
    public void setTop10Rank(Integer top10Rank) { this.top10Rank = top10Rank; }

    public double getUserRating() { return userRating; }
    public void setUserRating(double userRating) { this.userRating = userRating; }

    public double getContinueWatchingProgress() { return continueWatchingProgress; }
    public void setContinueWatchingProgress(double continueWatchingProgress) { this.continueWatchingProgress = continueWatchingProgress; }

    public List<Season> getSeasons() { return seasons; }
    public void setSeasons(List<Season> seasons) { this.seasons = seasons; }

    // Dual compatibility with Frontend Web (src/types.ts)
    public String getOverview() { return synopsis; }
    public void setOverview(String overview) { this.synopsis = overview; }

    public double getRating() { return userRating; }
    public void setRating(double rating) { this.userRating = rating; }

    public Integer getTopRank() { return top10Rank; }
    public void setTopRank(Integer topRank) {
        this.top10Rank = topRank;
        this.isTop10 = (topRank != null && topRank > 0);
    }

    public List<String> getGenres() {
        return (genre != null && !genre.isBlank()) ? List.of(genre.split(",\\s*")) : List.of();
    }
}
