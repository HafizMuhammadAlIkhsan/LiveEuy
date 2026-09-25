package com.liveeuy.backend.model;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

@Schema(description = "Entitas utama media (Film Layar Lebar atau Serial TV)")
public class MediaItem {

    @Schema(description = "Identifier unik media", example = "cyberpunk-neo-nusantara")
    private String id;

    @Schema(description = "Judul tayangan", example = "Cyberpunk: Neo Nusantara")
    private String title;

    @Schema(description = "Judul internasional/asli", example = "Neo Nusantara 2099")
    private String originalTitle;

    @Schema(description = "Tipe media: 'movie' atau 'tv'", example = "tv", allowableValues = {"movie", "tv"})
    private String type;

    @Schema(description = "Slogan tayangan", example = "Masa depan terbentang di antara cahaya neon.")
    private String tagline;

    @Schema(description = "Sinopsis lengkap alur cerita")
    private String overview;

    @Schema(description = "URL gambar poster (aspek rasio 2:3)")
    private String posterUrl;

    @Schema(description = "URL gambar latar belakang hero/backdrop (aspek rasio 16:9)")
    private String backdropUrl;

    @Schema(description = "Tahun rilis", example = "2026")
    private int releaseYear;

    @Schema(description = "Negara asal produksi", example = "Indonesia")
    private String country;

    @Schema(description = "Rating penonton (skala 1 - 10)", example = "9.4")
    private double rating;

    @Schema(description = "Persentase skor kecocokan algoritma (0 - 100)", example = "99")
    private int matchScore;

    @Schema(description = "Klasifikasi usia penonton", example = "18+", allowableValues = {"SU", "13+", "16+", "18+", "21+"})
    private String ageRating;

    @Schema(description = "Durasi film (jika movie)", example = "2j 14m", nullable = true)
    private String duration;

    @Schema(description = "Jumlah total musim (jika tv series)", example = "2", nullable = true)
    private Integer totalSeasons;

    @Schema(description = "Daftar kategori genre")
    private List<String> genres;

    @Schema(description = "Daftar nama pemeran utama")
    private List<String> cast;

    @Schema(description = "Nama sutradara", example = "Timo Tjahjanto")
    private String director;

    @Schema(description = "URL aliran video utama MP4/HLS")
    private String videoUrl;

    @Schema(description = "URL video trailer / teaser cuplikan")
    private String trailerUrl;

    @Schema(description = "Penanda tayangan trending", example = "true")
    private boolean isTrending;

    @Schema(description = "Penanda tayangan sorotan utama di hero banner", example = "true")
    private boolean isFeatured;

    @Schema(description = "Peringkat Top 10 harian (1 - 10)", example = "1", nullable = true)
    private Integer topRank;

    @Schema(description = "Resolusi kualitas maksimum", example = "4K UHD", allowableValues = {"4K UHD", "HD", "Dolby Vision"})
    private String quality;

    @Schema(description = "Format tata suara", example = "Dolby Atmos", allowableValues = {"Dolby Atmos", "5.1 Surround", "Stereo"})
    private String audio;

    @Schema(description = "Daftar musim dan episode (khusus serial TV)", nullable = true)
    private List<Season> seasons;

    @Schema(description = "Daftar ulasan penonton", nullable = true)
    private List<Review> reviews;

    public MediaItem() {}

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getOriginalTitle() { return originalTitle; }
    public void setOriginalTitle(String originalTitle) { this.originalTitle = originalTitle; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getTagline() { return tagline; }
    public void setTagline(String tagline) { this.tagline = tagline; }

    public String getOverview() { return overview; }
    public void setOverview(String overview) { this.overview = overview; }

    public String getPosterUrl() { return posterUrl; }
    public void setPosterUrl(String posterUrl) { this.posterUrl = posterUrl; }

    public String getBackdropUrl() { return backdropUrl; }
    public void setBackdropUrl(String backdropUrl) { this.backdropUrl = backdropUrl; }

    public int getReleaseYear() { return releaseYear; }
    public void setReleaseYear(int releaseYear) { this.releaseYear = releaseYear; }

    public double getRating() { return rating; }
    public void setRating(double rating) { this.rating = rating; }

    public int getMatchScore() { return matchScore; }
    public void setMatchScore(int matchScore) { this.matchScore = matchScore; }

    public String getAgeRating() { return ageRating; }
    public void setAgeRating(String ageRating) { this.ageRating = ageRating; }

    public String getDuration() { return duration; }
    public void setDuration(String duration) { this.duration = duration; }

    public Integer getTotalSeasons() { return totalSeasons; }
    public void setTotalSeasons(Integer totalSeasons) { this.totalSeasons = totalSeasons; }

    public List<String> getGenres() { return genres; }
    public void setGenres(List<String> genres) { this.genres = genres; }

    public List<String> getCast() { return cast; }
    public void setCast(List<String> cast) { this.cast = cast; }

    public String getDirector() { return director; }
    public void setDirector(String director) { this.director = director; }

    public String getVideoUrl() { return videoUrl; }
    public void setVideoUrl(String videoUrl) { this.videoUrl = videoUrl; }

    public String getTrailerUrl() { return trailerUrl; }
    public void setTrailerUrl(String trailerUrl) { this.trailerUrl = trailerUrl; }

    public boolean isTrending() { return isTrending; }
    public void setTrending(boolean trending) { isTrending = trending; }

    public boolean isFeatured() { return isFeatured; }
    public void setFeatured(boolean featured) { isFeatured = featured; }

    public Integer getTopRank() { return topRank; }
    public void setTopRank(Integer topRank) { this.topRank = topRank; }

    public String getQuality() { return quality; }
    public void setQuality(String quality) { this.quality = quality; }

    public String getAudio() { return audio; }
    public void setAudio(String audio) { this.audio = audio; }

    public List<Season> getSeasons() { return seasons; }
    public void setSeasons(List<Season> seasons) { this.seasons = seasons; }

    public List<Review> getReviews() { return reviews; }
    public void setReviews(List<Review> reviews) { this.reviews = reviews; }

    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }
}
