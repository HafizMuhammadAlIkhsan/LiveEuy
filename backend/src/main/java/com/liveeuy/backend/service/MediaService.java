package com.liveeuy.backend.service;

import com.liveeuy.backend.dto.ReviewRequest;
import com.liveeuy.backend.dto.WatchProgressRequest;
import com.liveeuy.backend.model.*;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class MediaService {

    private final Map<String, MediaItem> mediaDatabase = new ConcurrentHashMap<>();
    private final Map<String, List<Review>> reviewDatabase = new ConcurrentHashMap<>();
    private final Map<String, Set<String>> userWatchlist = new ConcurrentHashMap<>();
    private final Map<String, Map<String, WatchProgress>> userProgressDatabase = new ConcurrentHashMap<>();

    public MediaService() {
        seedInitialData();
    }

    private void seedInitialData() {
        // Sample Episodes for Gadis Kretek
        List<Episode> gkEpisodes = List.of(
                new Episode("gk_ep1", 1, "Mawar", "Lebas mencari jejak Jeng Yah di pelosok Jawa Tengah...",
                        "https://lh3.googleusercontent.com/aida-public/AB6AXuD_ja_wlkaQPjYJLOoC3LoQ38WRHQcxUcT8lv6tUtnJyJval-lNEZ9JQ9MQqCyM5fm89UvInMHQzKvqNUQBvXZK1gpmt3hweQqRqjpF1ctOzKjPUERj-Mbpim0PtHSq-u7j_eHFotwP2xgGXMIsxNszo052yrYOenxf6XxrdnjslMjamv-SYmTyVwuZwfg4A-JeoIPjKuTPDMds_c6RZzgBvIxXCIQTNxVhMZKqWSXpDLNecZ7f5NdZ",
                        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", "1 Jam 08 Min"),
                new Episode("gk_ep2", 2, "Klobot", "Pertemuan pertama Dasiyah dengan Raja menyulut ambisi saus kretek...",
                        "https://lh3.googleusercontent.com/aida-public/AB6AXuCjdvdOFXeTmIT0VH1mQG_5UPj3BbwqC2N78FzmXwirV6ZTNkU05ON91XHJMlviFJLGyGoJbT894OE97CGGxqFRj7B5g8nQUTx6Y5yYDroC4xK0Nhp-apW7Jlg0sJ4J26e4nbbPf7TUTC9MtMsHSLrXV0jg0COWPY_baO6U7tpj-je1YGL6ElxfXmdAFtzeB_L5EjQOtILcV59st2TNsAe5vaLUVaztTJhkh1T8g-NCFsZREoH7TU8S",
                        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4", "58 Min")
        );
        List<Season> gkSeasons = List.of(new Season("gk_s1", 1, "Musim 1", gkEpisodes));

        MediaItem mHero = new MediaItem(
                "m_hero", "Gundala: Negeri Terakhir",
                "Ketika peradaban berada di ambang keruntuhan akibat intrik elite bawah tanah, Sancaka harus merelakan segalanya demi menyalakan petir terakhir penentu nasib bangsa.",
                "https://lh3.googleusercontent.com/aida-public/AB6AXuChxR7qJY8oJAUH9fjwwBQ0UiHMDmcnzTrPpVONtc8qEjz2zwPZZxhgKv8CCEdhKLoBjhcZlcZ325bNnL741oqm7KEI1qaQidW9ui3BggZmizl1UZYDVVVKT0x71GHZtZn5QwovgLN23ExGqe_x8OEmuC1o419OosQ4J669bteS8e9hec3Ay-VzLrGkH6o3XXAmGLToVNhKKX-YazhUTVZAZhbJ7AV3p0zexIVwcf2cItNqaW5og1NR",
                "https://lh3.googleusercontent.com/aida-public/AB6AXuChxR7qJY8oJAUH9fjwwBQ0UiHMDmcnzTrPpVONtc8qEjz2zwPZZxhgKv8CCEdhKLoBjhcZlcZ325bNnL741oqm7KEI1qaQidW9ui3BggZmizl1UZYDVVVKT0x71GHZtZn5QwovgLN23ExGqe_x8OEmuC1o419OosQ4J669bteS8e9hec3Ay-VzLrGkH6o3XXAmGLToVNhKKX-YazhUTVZAZhbJ7AV3p0zexIVwcf2cItNqaW5og1NR",
                "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
                98.0, "18+", List.of("4K UHD", "Dolby Atmos"), "Aksi & Pahlawan Super",
                "2 Jam 15 Min", 2024, "Joko Anwar",
                List.of("Abimana Aryasatya", "Tara Basro", "Bront Palarae"),
                true, 1, 9.3, 0.45, null
        );

        MediaItem m1 = new MediaItem(
                "m1", "Gadis Kretek",
                "Berlatar tahun 1960-an hingga awal 2000-an, perjalanan cinta dan penemuan jati diri terungkap saat seorang perajin wanita berbakat menentang tradisi industri kretek di Jawa Tengah.",
                "https://lh3.googleusercontent.com/aida-public/AB6AXuD_ja_wlkaQPjYJLOoC3LoQ38WRHQcxUcT8lv6tUtnJyJval-lNEZ9JQ9MQqCyM5fm89UvInMHQzKvqNUQBvXZK1gpmt3hweQqRqjpF1ctOzKjPUERj-Mbpim0PtHSq-u7j_eHFotwP2xgGXMIsxNszo052yrYOenxf6XxrdnjslMjamv-SYmTyVwuZwfg4A-JeoIPjKuTPDMds_c6RZzgBvIxXCIQTNxVhMZKqWSXpDLNecZ7f5NdZ",
                "https://lh3.googleusercontent.com/aida-public/AB6AXuCjdvdOFXeTmIT0VH1mQG_5UPj3BbwqC2N78FzmXwirV6ZTNkU05ON91XHJMlviFJLGyGoJbT894OE97CGGxqFRj7B5g8nQUTx6Y5yYDroC4xK0Nhp-apW7Jlg0sJ4J26e4nbbPf7TUTC9MtMsHSLrXV0jg0COWPY_baO6U7tpj-je1YGL6ElxfXmdAFtzeB_L5EjQOtILcV59st2TNsAe5vaLUVaztTJhkh1T8g-NCFsZREoH7TU8S",
                "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
                99.0, "16+", List.of("4K UHD", "Dolby Vision", "Dolby Atmos"), "Drama Periode",
                "1 Musim (5 Episode)", 2023, "Kamila Andini, Ifa Isfansyah",
                List.of("Dian Sastrowardoyo", "Ario Bayu", "Putri Marino"),
                true, 1, 8.8, 0.72, gkSeasons
        );

        MediaItem m2 = new MediaItem(
                "top_2", "Sri Asih",
                "Kisah Alana membangkitkan kekuatan dewi pelindung bumi demi menumpas kejahatan.",
                "https://lh3.googleusercontent.com/aida-public/AB6AXuCm4BOKHNPGZY0nzbH9ktD22ae4oIttpamXINmShulnPCBykrGdWiV2Rzy5EXIkB8wwon5xHaWbwlzIiYfCOBdhbaKQ64zOGPfW2-qXfCSsmx-Fh6E4NId7u54lTc3h1x6sM4XauLxoNvyv2FyUHHGjMZido5keG7Ye9tKmQFRBSJRcmz0JCYfalE7-IJpnluux7nxQoRk0E8UvZ7biBGxFMvuQl0VN1EBzb7BmO1zn6prhD_DRsi4R",
                "https://lh3.googleusercontent.com/aida-public/AB6AXuCm4BOKHNPGZY0nzbH9ktD22ae4oIttpamXINmShulnPCBykrGdWiV2Rzy5EXIkB8wwon5xHaWbwlzIiYfCOBdhbaKQ64zOGPfW2-qXfCSsmx-Fh6E4NId7u54lTc3h1x6sM4XauLxoNvyv2FyUHHGjMZido5keG7Ye9tKmQFRBSJRcmz0JCYfalE7-IJpnluux7nxQoRk0E8UvZ7biBGxFMvuQl0VN1EBzb7BmO1zn6prhD_DRsi4R",
                "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
                95.0, "13+", List.of("4K UHD"), "Aksi & Fantasi",
                "2 Jam 15 Min", 2022, "Upi",
                List.of("Pevita Pearce", "Reza Rahadian"),
                true, 2, 8.5, 0.0, null
        );

        mediaDatabase.put(mHero.getId(), mHero);
        mediaDatabase.put(m1.getId(), m1);
        mediaDatabase.put(m2.getId(), m2);

        // Initial Reviews
        List<Review> reviews = new ArrayList<>();
        reviews.add(new Review("r1", "m1", "Ahmad Fauzi", "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120", 9.5, "Kualitas sinematografi kelas dunia!", LocalDateTime.now().minusDays(2), 24));
        reviews.add(new Review("r2", "m1", "Dewi Lestari", "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120", 9.0, "Dian Sastro bermain sangat memukau.", LocalDateTime.now().minusDays(1), 18));
        reviewDatabase.put("m1", reviews);

        // Default watchlist for default user
        Set<String> watchlist = ConcurrentHashMap.newKeySet();
        watchlist.add("m1");
        watchlist.add("m_hero");
        userWatchlist.put("user_hafiz", watchlist);
    }

    public List<MediaItem> getAllMedia() {
        return new ArrayList<>(mediaDatabase.values());
    }

    public Optional<MediaItem> getMediaById(String id) {
        return Optional.ofNullable(mediaDatabase.get(id));
    }

    public List<MediaItem> getTop10() {
        return mediaDatabase.values().stream()
                .filter(MediaItem::isTop10)
                .sorted(Comparator.comparingInt(m -> m.getTop10Rank() != null ? m.getTop10Rank() : 99))
                .collect(Collectors.toList());
    }

    public List<Review> getReviews(String mediaId) {
        return reviewDatabase.getOrDefault(mediaId, Collections.emptyList());
    }

    public Review addReview(String mediaId, ReviewRequest req) {
        Review review = new Review(
                UUID.randomUUID().toString(),
                mediaId,
                req.getUserName() != null ? req.getUserName() : "Pengguna LiveEuy",
                "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120",
                req.getRating(),
                req.getComment(),
                LocalDateTime.now(),
                0
        );
        reviewDatabase.computeIfAbsent(mediaId, k -> new ArrayList<>()).add(0, review);
        return review;
    }

    public Set<String> getWatchlistIds(String userId) {
        return userWatchlist.getOrDefault(userId, Collections.emptySet());
    }

    public List<MediaItem> getWatchlistMedia(String userId) {
        Set<String> ids = getWatchlistIds(userId);
        return ids.stream()
                .map(mediaDatabase::get)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    public boolean toggleWatchlist(String userId, String mediaId) {
        Set<String> set = userWatchlist.computeIfAbsent(userId, k -> ConcurrentHashMap.newKeySet());
        if (set.contains(mediaId)) {
            set.remove(mediaId);
            return false; // Removed
        } else {
            set.add(mediaId);
            return true; // Added
        }
    }

    public WatchProgress updateWatchProgress(String userId, WatchProgressRequest req) {
        Map<String, WatchProgress> userMap = userProgressDatabase.computeIfAbsent(userId, k -> new ConcurrentHashMap<>());
        WatchProgress progress = new WatchProgress(
                UUID.randomUUID().toString(),
                userId,
                req.getMediaId(),
                req.getProgress(),
                req.getLastEpisodeId(),
                LocalDateTime.now()
        );
        userMap.put(req.getMediaId(), progress);

        // Also update continue watching in mediaDatabase if exists
        MediaItem item = mediaDatabase.get(req.getMediaId());
        if (item != null) {
            item.setContinueWatchingProgress(req.getProgress());
        }

        return progress;
    }

    public List<WatchProgress> getUserProgressList(String userId) {
        Map<String, WatchProgress> map = userProgressDatabase.get(userId);
        return map == null ? Collections.emptyList() : new ArrayList<>(map.values());
    }
}
