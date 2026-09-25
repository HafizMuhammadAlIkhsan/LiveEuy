package com.liveeuy.backend.service;

import com.liveeuy.backend.dto.ReviewRequest;
import com.liveeuy.backend.dto.WatchProgressRequest;
import com.liveeuy.backend.model.*;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class MediaService {

    private final Map<String, MediaItem> mediaStore = new ConcurrentHashMap<>();
    private final Set<String> watchlistStore = ConcurrentHashMap.newKeySet();
    private final Set<String> favoritesStore = ConcurrentHashMap.newKeySet();
    private final Map<String, WatchProgress> progressStore = new ConcurrentHashMap<>();

    @PostConstruct
    public void initData() {
        // Seed 1: Cyberpunk Neo Nusantara
        MediaItem cp = new MediaItem();
        cp.setId("cyberpunk-neo-nusantara");
        cp.setTitle("Cyberpunk: Neo Nusantara");
        cp.setOriginalTitle("Neo Nusantara 2099");
        cp.setType("tv");
        cp.setTagline("Masa depan terbentang di antara cahaya neon dan bayang-bayang masa lalu.");
        cp.setOverview("Di megalopolis Nusantara pada tahun 2099, seorang mantan agen siber terpaksa berhadapan dengan sindikat AI misterius.");
        cp.setPosterUrl("https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80");
        cp.setBackdropUrl("https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1600&auto=format&fit=crop&q=80");
        cp.setReleaseYear(2026);
        cp.setCountry("Indonesia");
        cp.setRating(9.4);
        cp.setMatchScore(99);
        cp.setAgeRating("18+");
        cp.setTotalSeasons(2);
        cp.setGenres(List.of("Fiksi Ilmiah", "Aksi", "Thriller"));
        cp.setCast(List.of("Iko Uwais", "Chelsea Islan", "Reza Rahadian", "Tara Basro"));
        cp.setDirector("Timo Tjahjanto");
        cp.setVideoUrl("https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4");
        cp.setTrailerUrl("https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4");
        cp.setTrending(true);
        cp.setFeatured(true);
        cp.setTopRank(1);
        cp.setQuality("4K UHD");
        cp.setAudio("Dolby Atmos");

        Season s1 = new Season(1, "Musim 1: Kode Pembuka", new ArrayList<>(List.of(
                new Episode("cp-s1-e1", 1, 1, "Sinyal Hitam dari Batavia Hilir", "Arga menerima pesan terenkripsi dari seseorang yang seharusnya sudah meninggal.", "52m", "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&auto=format&fit=crop&q=80", "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4"),
                new Episode("cp-s1-e2", 2, 1, "Protokol Sang Hyang", "Penyelidikan membawa Arga ke fasilitas rahasia di kedalaman bawah laut.", "48m", "https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format&fit=crop&q=80", "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4")
        )));
        cp.setSeasons(new ArrayList<>(List.of(s1)));
        cp.setReviews(new ArrayList<>(List.of(
                new Review("r1", "Rian Pratama", "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80", 10.0, "2 hari lalu", "Visual cyberpunk lokal terbaik yang pernah ada!")
        )));
        mediaStore.put(cp.getId(), cp);

        // Seed 2: Chronicles of Elysium
        MediaItem elysium = new MediaItem();
        elysium.setId("chronicles-of-elysium");
        elysium.setTitle("Chronicles of Elysium");
        elysium.setOriginalTitle("Elysium Awakening");
        elysium.setType("movie");
        elysium.setTagline("Bintang terjauh menyimpan rahasia penciptaan pertama.");
        elysium.setOverview("Ekspedisi antar-galaksi melintasi lubang cacing untuk mencari koloni manusia yang hilang ratusan tahun silam.");
        elysium.setPosterUrl("https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80");
        elysium.setBackdropUrl("https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600&auto=format&fit=crop&q=80");
        elysium.setReleaseYear(2025);
        elysium.setCountry("Amerika Serikat");
        elysium.setRating(9.1);
        elysium.setMatchScore(97);
        elysium.setAgeRating("13+");
        elysium.setDuration("2j 28m");
        elysium.setGenres(List.of("Fiksi Ilmiah", "Petualangan", "Drama"));
        elysium.setCast(List.of("Alexander Skarsgard", "Rebecca Ferguson", "Ken Watanabe"));
        elysium.setDirector("Denis Villeneuve");
        elysium.setVideoUrl("https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4");
        elysium.setTrailerUrl("https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4");
        elysium.setTrending(true);
        elysium.setFeatured(true);
        elysium.setTopRank(2);
        elysium.setQuality("4K UHD");
        elysium.setAudio("Dolby Atmos");
        mediaStore.put(elysium.getId(), elysium);

        // Seed 3: Bayang di Balik Kabut
        MediaItem kabut = new MediaItem();
        kabut.setId("bayang-di-balik-kabut");
        kabut.setTitle("Bayang di Balik Kabut");
        kabut.setType("movie");
        kabut.setTagline("Jangan pernah menoleh ketika kabut senja turun menyelimuti hutan.");
        kabut.setOverview("Seorang detektif metropolitan menyelidiki hilangnya anak-anak desa di lereng pegunungan terpencil.");
        kabut.setPosterUrl("https://images.unsplash.com/photo-1509281373149-e957c6296406?w=600&auto=format&fit=crop&q=80");
        kabut.setBackdropUrl("https://images.unsplash.com/photo-1448375240586-882707db888b?w=1600&auto=format&fit=crop&q=80");
        kabut.setReleaseYear(2026);
        kabut.setCountry("Indonesia");
        kabut.setRating(8.8);
        kabut.setMatchScore(93);
        kabut.setAgeRating("18+");
        kabut.setDuration("1j 56m");
        kabut.setGenres(List.of("Horor", "Misteri", "Thriller"));
        kabut.setCast(List.of("Marsha Timothy", "Ario Bayu", "Asmara Abigail"));
        kabut.setDirector("Joko Anwar");
        kabut.setVideoUrl("https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4");
        kabut.setTrending(true);
        kabut.setTopRank(3);
        kabut.setQuality("Dolby Vision");
        kabut.setAudio("5.1 Surround");
        mediaStore.put(kabut.getId(), kabut);

        // Default watchlist and history
        watchlistStore.add(cp.getId());
        watchlistStore.add(elysium.getId());

        progressStore.put(cp.getId(), new WatchProgress(cp.getId(), 1420.0, 3120.0, 45, System.currentTimeMillis() - 3600000, "cp-s1-e1"));
    }

    public List<MediaItem> getAllMedia(String type, String genre, String search, String sortBy) {
        return getAllMedia(type, genre, search, sortBy, null, null);
    }

    public List<MediaItem> getAllMedia(String type, String genre, String search, String sortBy, String country, Integer year) {
        return mediaStore.values().stream()
                .filter(m -> type == null || type.equalsIgnoreCase("all") || m.getType().equalsIgnoreCase(type))
                .filter(m -> genre == null || genre.equalsIgnoreCase("Semua Genre") || m.getGenres().contains(genre))
                .filter(m -> country == null || country.isBlank() || country.equalsIgnoreCase("Semua Negara") || (m.getCountry() != null && m.getCountry().equalsIgnoreCase(country)))
                .filter(m -> year == null || year <= 0 || m.getReleaseYear() == year)
                .filter(m -> {
                    if (search == null || search.trim().isEmpty()) return true;
                    String q = search.toLowerCase();
                    return m.getTitle().toLowerCase().contains(q) ||
                           m.getGenres().stream().anyMatch(g -> g.toLowerCase().contains(q)) ||
                           m.getCast().stream().anyMatch(c -> c.toLowerCase().contains(q));
                })
                .sorted((a, b) -> {
                    if ("rating".equalsIgnoreCase(sortBy)) {
                        return Double.compare(b.getRating(), a.getRating());
                    } else if ("newest".equalsIgnoreCase(sortBy) || "year-desc".equalsIgnoreCase(sortBy)) {
                        return Integer.compare(b.getReleaseYear(), a.getReleaseYear());
                    } else if ("oldest".equalsIgnoreCase(sortBy) || "year-asc".equalsIgnoreCase(sortBy)) {
                        return Integer.compare(a.getReleaseYear(), b.getReleaseYear());
                    }
                    return Integer.compare(a.getTopRank() != null ? a.getTopRank() : 99,
                                           b.getTopRank() != null ? b.getTopRank() : 99);
                })
                .collect(Collectors.toList());
    }

    public Optional<MediaItem> getMediaById(String id) {
        return Optional.ofNullable(mediaStore.get(id));
    }

    public List<MediaItem> getFeaturedMedia() {
        return mediaStore.values().stream().filter(MediaItem::isFeatured).collect(Collectors.toList());
    }

    public List<MediaItem> getTop10() {
        return mediaStore.values().stream()
                .filter(m -> m.getTopRank() != null)
                .sorted(Comparator.comparingInt(MediaItem::getTopRank))
                .limit(10)
                .collect(Collectors.toList());
    }

    public Review addReview(String mediaId, ReviewRequest req) {
        MediaItem item = mediaStore.get(mediaId);
        if (item == null) {
            throw new IllegalArgumentException("Media tidak ditemukan dengan ID: " + mediaId);
        }
        Review rev = new Review(
                "rev-" + UUID.randomUUID().toString().substring(0, 8),
                req.getAuthor(),
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
                req.getRating(),
                "Baru saja",
                req.getComment()
        );
        if (item.getReviews() == null) {
            item.setReviews(new ArrayList<>());
        }
        item.getReviews().add(0, rev);
        return rev;
    }

    public Set<String> getWatchlist() {
        return watchlistStore;
    }

    public boolean toggleWatchlist(String mediaId) {
        if (watchlistStore.contains(mediaId)) {
            watchlistStore.remove(mediaId);
            return false;
        } else {
            watchlistStore.add(mediaId);
            return true;
        }
    }

    public Map<String, WatchProgress> getAllProgress() {
        return progressStore;
    }

    public WatchProgress updateProgress(WatchProgressRequest req) {
        int pct = 0;
        if (req.getDuration() > 0) {
            pct = (int) Math.min(100, Math.round((req.getCurrentTime() / req.getDuration()) * 100));
        }
        WatchProgress wp = new WatchProgress(
                req.getMediaId(),
                req.getCurrentTime(),
                req.getDuration(),
                pct,
                System.currentTimeMillis(),
                req.getEpisodeId()
        );
        progressStore.put(req.getMediaId(), wp);
        return wp;
    }
}
