package com.liveeuy.catalog_service.seed;

import com.liveeuy.catalog_service.entity.*;
import com.liveeuy.catalog_service.entity.enums.VideoQuality;
import com.liveeuy.catalog_service.repository.MediaRepository;
import com.liveeuy.catalog_service.repository.PersonRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class MediaDataSeeder implements CommandLineRunner {

    private final MediaRepository mediaRepository;
    private final PersonRepository personRepository;

    @Override
    @Transactional
    public void run(String... args) {

        if (mediaRepository.count() > 0) {
            System.out.println("Media data sudah tersedia. Seeder dilewati.");
            return;
        }

        System.out.println("Database media masih kosong. Memulai proses seeding beserta Season & Episode...");

        // =====================================================
        // 1. TV SERIES: Cyberpunk: Neo Nusantara (Beserta Season & Episode)
        // =====================================================
        TvSeries cyberpunk = createTvSeries(
                "Cyberpunk: Neo Nusantara",
                "Cyberpunk: Neo Nusantara",
                "Di tengah megapolis Nusantara tahun 2099...",
                "Kisah masa depan Nusantara ketika teknologi, korporasi, dan kehidupan manusia menyatu.",
                2099,
                "13+",
                Set.of("Sci-Fi", "Action", "Drama"),
                List.of("Raka Pratama", "Nadia Putri", "Bima Santoso"),
                "Andi Wijaya"
        );
        
        // Tambahkan Season 1
        Season cyberpunkS1 = createSeason(cyberpunk, 1, "Season 1: Kebangkitan", "https://placehold.co/500x750/1f2937/FFFFFF?text=Cyberpunk+S1");
        // Tambahkan Episode ke Season 1
        createEpisode(cyberpunkS1, 1, "Distrik Nol", "Awal mula Raka menemukan anomali sistem.", 2700, "https://placehold.co/1280x720/111827/FFFFFF?text=Eps+1", "https://example.com/video/cyber-s1e1", VideoQuality.UHD_4K);
        createEpisode(cyberpunkS1, 2, "Peretasan Utama", "Sebuah korporasi memburu Raka.", 2850, "https://placehold.co/1280x720/111827/FFFFFF?text=Eps+2", "https://example.com/video/cyber-s1e2", VideoQuality.UHD_4K);

        // =====================================================
        // 2. TV SERIES: Kota Tanpa Matahari (Beserta Season & Episode)
        // =====================================================
        TvSeries kotaTanpaMatahari = createTvSeries(
                "Kota Tanpa Matahari",
                "City Without Sun",
                "Ketika matahari menghilang, manusia mulai mempertanyakan segalanya.",
                "Sebuah kota terisolasi harus bertahan hidup setelah fenomena misterius menghilangkan cahaya matahari.",
                2025,
                "16+",
                Set.of("Mystery", "Drama", "Sci-Fi"),
                List.of("Nina Maharani", "Fauzan Akbar", "Tio Prasetyo"),
                "Rian Kurniawan"
        );

        // Tambahkan Season 1
        Season kotaS1 = createSeason(kotaTanpaMatahari, 1, "Season 1: Awal Kegelapan", "https://placehold.co/500x750/000000/FFFFFF?text=Kota+Tanpa+Matahari+S1");
        createEpisode(kotaS1, 1, "Hari ke-1", "Kepanikan melanda saat pagi tidak kunjung datang.", 3000, "https://placehold.co/1280x720/000000/FFFFFF?text=Eps+1", "https://example.com/video/kota-s1e1", VideoQuality.FHD_1080P);
        createEpisode(kotaS1, 2, "Ransum", "Persediaan makanan mulai menipis.", 2900, "https://placehold.co/1280x720/000000/FFFFFF?text=Eps+2", "https://example.com/video/kota-s1e2", VideoQuality.FHD_1080P);
        createEpisode(kotaS1, 3, "Senter Terakhir", "Kelompok pencari mencoba keluar batas kota.", 3100, "https://placehold.co/1280x720/000000/FFFFFF?text=Eps+3", "https://example.com/video/kota-s1e3", VideoQuality.FHD_1080P);

        // =====================================================
        // Pembuatan Data Movie (Berdiri Sendiri)
        // =====================================================
        Movie langitTerakhir = createMovie(
                "Langit Terakhir", "The Last Sky", "Sebuah perjalanan terakhir menuju tempat yang belum pernah dikunjungi.",
                "Seorang pilot muda harus memilih antara kembali kepada keluarganya atau menyelesaikan misi terakhirnya.",
                2025, "13+", 8040, Set.of("Drama", "Adventure"), List.of("Arif Rahman", "Maya Sari", "Dimas Putra"),
                "Fajar Nugroho", "https://example.com/videos/langit-terakhir", VideoQuality.UHD_4K, "5.1"
        );

        Movie operasiJakarta = createMovie(
                "Operasi Jakarta", "Operation Jakarta", "Satu malam. Satu misi. Tidak ada kesempatan kedua.",
                "Tim khusus ditugaskan untuk menghentikan transaksi ilegal terbesar di Jakarta.",
                2024, "17+", 7080, Set.of("Action", "Thriller", "Crime"), List.of("Rizky Maulana", "Kevin Wijaya", "Sarah Amelia"),
                "Dimas Prakoso", "https://example.com/videos/operasi-jakarta", VideoQuality.FHD_1080P, "5.1"
        );

        Movie jejakHujan = createMovie(
                "Jejak di Balik Hujan", "Traces Behind the Rain", "Setiap hujan menyimpan sebuah kenangan.",
                "Seorang fotografer menemukan hubungan antara foto-foto lamanya dengan sebuah kasus yang belum terpecahkan.",
                2023, "13+", 6420, Set.of("Drama", "Mystery", "Romance"), List.of("Alya Putri", "Rangga Wijaya", "Dewi Laras"),
                "Sinta Permata", "https://example.com/videos/jejak-di-balik-hujan", VideoQuality.FHD_1080P, "2.0"
        );

        // =====================================================
        // Simpan Seluruh Data (JPA akan menangani cascade otomatis)
        // =====================================================
        List<Media> mediaList = List.of(cyberpunk, kotaTanpaMatahari, langitTerakhir, operasiJakarta, jejakHujan);
        
        mediaRepository.saveAll(mediaList);
        System.out.println("Seeding selesai. Berhasil menambahkan " + mediaList.size() + " judul Media beserta Season & Episode-nya.");
    }

    // --- Helper Method untuk Membuat & Menghubungkan Season ---
    private Season createSeason(TvSeries tvSeries, int seasonNumber, String title, String posterUrl) {
        Season season = new Season();
        season.setTvSeries(tvSeries);
        season.setSeasonNumber(seasonNumber);
        season.setTitle(title);
        season.setPosterUrl(posterUrl);
        
        // Membangun relasi secara dua arah di memori Java
        tvSeries.getSeasons().add(season); 
        return season;
    }

    // --- Helper Method untuk Membuat & Menghubungkan Episode ---
    private Episode createEpisode(Season season, int episodeNumber, String title, String overview,
                                  int durationSeconds, String thumbnailUrl, String videoUrl, VideoQuality quality) {
        Episode episode = new Episode();
        episode.setSeason(season);
        episode.setEpisodeNumber(episodeNumber);
        episode.setTitle(title);
        episode.setOverview(overview);
        episode.setDurationSeconds(durationSeconds);
        episode.setThumbnailUrl(thumbnailUrl);
        episode.setVideoUrl(videoUrl);
        episode.setQuality(quality);
        
        // Membangun relasi secara dua arah di memori Java
        season.getEpisodes().add(episode);
        return episode;
    }

    // --- Helper Method untuk TV Series Utama ---
    private TvSeries createTvSeries(String title, String originalTitle, String tagline, String overview,
                                    Integer releaseYear, String ageRating, Set<String> genres,
                                    List<String> cast, String directorName) {
        TvSeries tv = new TvSeries();
        setBaseMediaFields(tv, title, originalTitle, tagline, overview, releaseYear, ageRating, genres);
        attachCastAndCrew(tv, cast, directorName);
        return tv;
    }

    // --- Helper Method untuk Movie Utama ---
    private Movie createMovie(String title, String originalTitle, String tagline, String overview,
                              Integer releaseYear, String ageRating, Integer durationSeconds,
                              Set<String> genres, List<String> cast, String directorName,
                              String videoUrl, VideoQuality quality, String audio) {
        Movie movie = new Movie();
        setBaseMediaFields(movie, title, originalTitle, tagline, overview, releaseYear, ageRating, genres);
        
        movie.setDurationSeconds(durationSeconds);
        movie.setVideoUrl(videoUrl);
        movie.setQuality(quality);
        movie.setAudio(audio);
        
        attachCastAndCrew(movie, cast, directorName);
        return movie;
    }

    // --- Helper Method Pengaturan Field Dasar Media ---
    private void setBaseMediaFields(Media media, String title, String originalTitle, String tagline,
                                    String overview, Integer releaseYear, String ageRating, Set<String> genres) {
        media.setTitle(title);
        media.setOriginalTitle(originalTitle);
        media.setTagline(tagline);
        media.setOverview(overview);
        media.setReleaseYear(releaseYear);
        media.setAgeRating(ageRating);
        media.setGenres(genres != null ? new HashSet<>(genres) : new HashSet<>());

        String safeTitle = title.replace(" ", "+");
        media.setPosterUrl("https://placehold.co/500x750/111827/FFFFFF?text=" + safeTitle);
        media.setBackdropUrl("https://placehold.co/1920x1080/1f2937/FFFFFF?text=" + safeTitle);
        media.setLogoUrl("https://placehold.co/800x300/111827/FFFFFF?text=" + safeTitle);
        media.setTrailerUrl("https://example.com/trailers/" + safeTitle.toLowerCase());
    }

    // --- Helper Method Pengelola Aktor Cerdas (Cari atau Buat) ---
    private void attachCastAndCrew(Media media, List<String> actors, String directorName) {
        if (directorName != null && !directorName.isBlank()) {
            Person director = getOrCreatePerson(directorName);
            MediaCast directorCast = new MediaCast();
            directorCast.setMedia(media);
            directorCast.setPerson(director);
            directorCast.setRole("DIRECTOR");
            directorCast.setCastOrder(0);
            media.getCastAndCrew().add(directorCast);
        }

        if (actors != null) {
            for (int i = 0; i < actors.size(); i++) {
                Person actor = getOrCreatePerson(actors.get(i));
                MediaCast actorCast = new MediaCast();
                actorCast.setMedia(media);
                actorCast.setPerson(actor);
                actorCast.setRole("ACTOR");
                actorCast.setCastOrder(i + 1);
                media.getCastAndCrew().add(actorCast);
            }
        }
    }

    private Person getOrCreatePerson(String name) {
        return personRepository.findByNameIgnoreCase(name).orElseGet(() -> {
            Person newPerson = new Person();
            newPerson.setName(name);
            return personRepository.save(newPerson);
        });
    }
}