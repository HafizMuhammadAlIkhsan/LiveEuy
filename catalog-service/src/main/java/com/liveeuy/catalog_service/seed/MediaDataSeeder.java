package com.liveeuy.catalog_service.seed;

import com.liveeuy.catalog_service.entity.Media;
import com.liveeuy.catalog_service.repository.MediaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class MediaDataSeeder implements CommandLineRunner {

    private final MediaRepository mediaRepository;

    @Override
    public void run(String... args) {

        if (mediaRepository.count() > 0) {
            System.out.println("Media data sudah tersedia. Seeder dilewati.");
            return;
        }

        System.out.println("Database media masih kosong.");
        System.out.println("Memulai proses seeding media...");

        List<Media> mediaList = List.of(

                // =====================================================
                // 1. FEATURED
                // =====================================================
                createMedia(
                        "Cyberpunk: Neo Nusantara",
                        "Cyberpunk: Neo Nusantara",
                        "tv",
                        "Di tengah megapolis Nusantara tahun 2099...",
                        "Kisah masa depan Nusantara ketika teknologi, korporasi, dan kehidupan manusia menyatu.",
                        2099,
                        9.4,
                        98,
                        "13+",
                        "45 min",
                        2,
                        List.of("Sci-Fi", "Action", "Drama"),
                        List.of("Raka Pratama", "Nadia Putri", "Bima Santoso"),
                        "Andi Wijaya",
                        "https://example.com/videos/cyberpunk-neo-nusantara",
                        "https://example.com/trailers/cyberpunk-neo-nusantara",
                        true,
                        true,
                        1,
                        "4K",
                        "Dolby Digital"
                ),

                // =====================================================
                // 2. MOVIE
                // =====================================================
                createMedia(
                        "Langit Terakhir",
                        "The Last Sky",
                        "movie",
                        "Sebuah perjalanan terakhir menuju tempat yang belum pernah dikunjungi.",
                        "Seorang pilot muda harus memilih antara kembali kepada keluarganya atau menyelesaikan misi terakhirnya.",
                        2025,
                        8.8,
                        94,
                        "13+",
                        "2h 14m",
                        null,
                        List.of("Drama", "Adventure"),
                        List.of("Arif Rahman", "Maya Sari", "Dimas Putra"),
                        "Fajar Nugroho",
                        "https://example.com/videos/langit-terakhir",
                        "https://example.com/trailers/langit-terakhir",
                        true,
                        false,
                        2,
                        "4K",
                        "5.1"
                ),

                // =====================================================
                // 3. MOVIE
                // =====================================================
                createMedia(
                        "Operasi Jakarta",
                        "Operation Jakarta",
                        "movie",
                        "Satu malam. Satu misi. Tidak ada kesempatan kedua.",
                        "Tim khusus ditugaskan untuk menghentikan transaksi ilegal terbesar di Jakarta.",
                        2024,
                        8.5,
                        91,
                        "17+",
                        "1h 58m",
                        null,
                        List.of("Action", "Thriller", "Crime"),
                        List.of("Rizky Maulana", "Kevin Wijaya", "Sarah Amelia"),
                        "Dimas Prakoso",
                        "https://example.com/videos/operasi-jakarta",
                        "https://example.com/trailers/operasi-jakarta",
                        true,
                        false,
                        3,
                        "1080p",
                        "5.1"
                ),

                // =====================================================
                // 4. TV
                // =====================================================
                createMedia(
                        "Kota Tanpa Matahari",
                        "City Without Sun",
                        "tv",
                        "Ketika matahari menghilang, manusia mulai mempertanyakan segalanya.",
                        "Sebuah kota terisolasi harus bertahan hidup setelah fenomena misterius menghilangkan cahaya matahari.",
                        2025,
                        8.7,
                        89,
                        "16+",
                        "50 min",
                        1,
                        List.of("Mystery", "Drama", "Sci-Fi"),
                        List.of("Nina Maharani", "Fauzan Akbar", "Tio Prasetyo"),
                        "Rian Kurniawan",
                        "https://example.com/videos/kota-tanpa-matahari",
                        "https://example.com/trailers/kota-tanpa-matahari",
                        true,
                        true,
                        4,
                        "4K",
                        "Dolby Digital"
                ),

                // =====================================================
                // 5. MOVIE
                // =====================================================
                createMedia(
                        "Jejak di Balik Hujan",
                        "Traces Behind the Rain",
                        "movie",
                        "Setiap hujan menyimpan sebuah kenangan.",
                        "Seorang fotografer menemukan hubungan antara foto-foto lamanya dengan sebuah kasus yang belum terpecahkan.",
                        2023,
                        8.2,
                        85,
                        "13+",
                        "1h 47m",
                        null,
                        List.of("Drama", "Mystery", "Romance"),
                        List.of("Alya Putri", "Rangga Wijaya", "Dewi Laras"),
                        "Sinta Permata",
                        "https://example.com/videos/jejak-di-balik-hujan",
                        "https://example.com/trailers/jejak-di-balik-hujan",
                        false,
                        false,
                        5,
                        "1080p",
                        "2.0"
                ),

                // =====================================================
                // 6. TV
                // =====================================================
                createMedia(
                        "Penjaga Nusantara",
                        "Guardians of Nusantara",
                        "tv",
                        "Mereka menjaga apa yang tidak boleh diketahui dunia.",
                        "Kelompok penjaga rahasia melindungi artefak kuno yang memiliki kekuatan luar biasa.",
                        2024,
                        8.9,
                        92,
                        "13+",
                        "48 min",
                        2,
                        List.of("Action", "Fantasy", "Adventure"),
                        List.of("Yoga Pratama", "Citra Dewi", "Bagas Ramadhan"),
                        "Budi Santoso",
                        "https://example.com/videos/penjaga-nusantara",
                        "https://example.com/trailers/penjaga-nusantara",
                        true,
                        false,
                        6,
                        "4K",
                        "Dolby Digital"
                ),

                // =====================================================
                // 7. MOVIE
                // =====================================================
                createMedia(
                        "Malam di Selatan",
                        "Night in the South",
                        "movie",
                        "Satu malam yang mengubah seluruh hidup mereka.",
                        "Empat sahabat terjebak dalam sebuah kota kecil dan harus mengungkap rahasia masa lalu.",
                        2022,
                        7.9,
                        78,
                        "17+",
                        "1h 52m",
                        null,
                        List.of("Thriller", "Drama"),
                        List.of("Rafi Ahmad", "Luna Safira", "Iqbal Ramadhan"),
                        "Aditya Pranata",
                        "https://example.com/videos/malam-di-selatan",
                        "https://example.com/trailers/malam-di-selatan",
                        false,
                        false,
                        7,
                        "1080p",
                        "5.1"
                ),

                // =====================================================
                // 8. TV
                // =====================================================
                createMedia(
                        "Startup War",
                        "Startup War",
                        "tv",
                        "Di dunia bisnis, tidak semua orang bermain dengan aturan yang sama.",
                        "Sekelompok founder muda membangun startup dari nol dan menghadapi persaingan brutal.",
                        2025,
                        8.4,
                        87,
                        "13+",
                        "42 min",
                        1,
                        List.of("Drama", "Comedy"),
                        List.of("Kevin Hartono", "Sarah Putri", "Fikri Maulana"),
                        "Rizal Hidayat",
                        "https://example.com/videos/startup-war",
                        "https://example.com/trailers/startup-war",
                        true,
                        false,
                        8,
                        "4K",
                        "2.0"
                ),

                // =====================================================
                // 9. MOVIE
                // =====================================================
                createMedia(
                        "Ekspedisi Arunika",
                        "Arunika Expedition",
                        "movie",
                        "Perjalanan menuju tempat yang tidak ada di peta.",
                        "Tim ekspedisi menemukan sebuah wilayah misterius yang selama ini tersembunyi dari dunia.",
                        2024,
                        8.1,
                        83,
                        "13+",
                        "2h 05m",
                        null,
                        List.of("Adventure", "Fantasy", "Mystery"),
                        List.of("Galih Pratama", "Nabila Putri", "Reno Saputra"),
                        "Hendra Wijaya",
                        "https://example.com/videos/ekspedisi-arunika",
                        "https://example.com/trailers/ekspedisi-arunika",
                        false,
                        false,
                        9,
                        "4K",
                        "5.1"
                ),

                // =====================================================
                // 10. TV
                // =====================================================
                createMedia(
                        "Detektif 404",
                        "Detective 404",
                        "tv",
                        "Tidak ada kasus yang benar-benar hilang.",
                        "Seorang detektif menggunakan teknologi dan intuisi untuk memecahkan kasus-kasus misterius.",
                        2023,
                        8.0,
                        80,
                        "13+",
                        "45 min",
                        3,
                        List.of("Crime", "Mystery", "Thriller"),
                        List.of("Daffa Pratama", "Salsa Anindya", "Reza Kurnia"),
                        "Miko Setiawan",
                        "https://example.com/videos/detektif-404",
                        "https://example.com/trailers/detektif-404",
                        false,
                        false,
                        10,
                        "1080p",
                        "5.1"
                )
        );

        mediaRepository.saveAll(mediaList);

        System.out.println(
                "Seeding selesai. Berhasil menambahkan "
                        + mediaList.size()
                        + " media."
        );
    }

    private Media createMedia(
            String title,
            String originalTitle,
            String type,
            String tagline,
            String overview,
            Integer releaseYear,
            Double rating,
            Integer matchScore,
            String ageRating,
            String duration,
            Integer totalSeasons,
            List<String> genres,
            List<String> cast,
            String director,
            String videoUrl,
            String trailerUrl,
            Boolean isTrending,
            Boolean isFeatured,
            Integer topRank,
            String quality,
            String audio
    ) {

        Media media = new Media();

        media.setTitle(title);
        media.setOriginalTitle(originalTitle);
        media.setType(type);
        media.setTagline(tagline);
        media.setOverview(overview);

        media.setPosterUrl(
                "https://placehold.co/500x750/111827/FFFFFF?text="
                        + title.replace(" ", "+")
        );

        media.setBackdropUrl(
                "https://placehold.co/1920x1080/1f2937/FFFFFF?text="
                        + title.replace(" ", "+")
        );

        media.setLogoUrl(
                "https://placehold.co/800x300/111827/FFFFFF?text="
                        + title.replace(" ", "+")
        );

        media.setReleaseYear(releaseYear);
        media.setRating(rating);
        media.setMatchScore(matchScore);
        media.setAgeRating(ageRating);
        media.setDuration(duration);
        media.setTotalSeasons(totalSeasons);

        media.setGenres(genres);
        media.setCastList(cast);

        media.setDirector(director);
        media.setVideoUrl(videoUrl);
        media.setTrailerUrl(trailerUrl);

        media.setIsTrending(isTrending);
        media.setIsFeatured(isFeatured);
        media.setTopRank(topRank);

        media.setQuality(quality);
        media.setAudio(audio);

        return media;
    }
}
