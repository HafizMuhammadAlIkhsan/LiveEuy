package com.liveeuy.catalog_service.service.impl;

import com.liveeuy.catalog_service.dto.request.MediaRequestDTO;
import com.liveeuy.catalog_service.dto.request.MovieRequestDTO;
import com.liveeuy.catalog_service.dto.request.TvSeriesRequestDTO;
import com.liveeuy.catalog_service.dto.response.MediaResponseDTO;
import com.liveeuy.catalog_service.entity.Media;
import com.liveeuy.catalog_service.entity.MediaCast;
import com.liveeuy.catalog_service.entity.Movie;
import com.liveeuy.catalog_service.entity.Person;
import com.liveeuy.catalog_service.entity.TvSeries;
import com.liveeuy.catalog_service.event.MediaCreatedEvent;
import com.liveeuy.catalog_service.event.MediaDeletedEvent;
import com.liveeuy.catalog_service.event.MediaUpdatedEvent;
import com.liveeuy.catalog_service.event.publisher.DomainEventPublisher;
import com.liveeuy.catalog_service.exception.ResourceNotFoundException;
import com.liveeuy.catalog_service.mapper.MediaMapper;
import com.liveeuy.catalog_service.repository.MediaRepository;
import com.liveeuy.catalog_service.repository.PersonRepository;
import com.liveeuy.catalog_service.service.MediaService;
import com.liveeuy.catalog_service.storage.R2StorageException;
import com.liveeuy.catalog_service.storage.R2StorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.liveeuy.catalog_service.specification.MediaSpecification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MediaServiceImpl implements MediaService {

    private final MediaRepository mediaRepository;
    private final PersonRepository personRepository;
    private final MediaMapper mediaMapper;
    /** Publisher domain events — implementasi di-inject oleh Spring (SpringDomainEventPublisher) */
    private final DomainEventPublisher eventPublisher;
    /**
     * R2 Storage service untuk upload poster/backdrop/trailer ke Cloudflare R2.
     * Bersifat opsional: jika R2 tidak dikonfigurasi, method upload akan melempar R2StorageException
     * yang di-catch oleh handler dan dikembalikan sebagai error response.
     */
    private final R2StorageService r2StorageService;

    // ─────────────────────────────────────────────────────────────────────────
    // Konstanta folder R2
    // ─────────────────────────────────────────────────────────────────────────
    private static final String FOLDER_POSTERS   = "posters";
    private static final String FOLDER_BACKDROPS = "backdrops";
    private static final String FOLDER_TRAILERS  = "trailers";

    private static final String SORT_BY_RATING = "rating";
    private static final String SORT_BY_NEWEST = "newest";

    // ─────────────────────────────────────────────────────────────────────────
    // Allowed MIME types
    // ─────────────────────────────────────────────────────────────────────────
    private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of(
            "image/jpeg", "image/png", "image/webp", "image/gif"
    );
    private static final Set<String> ALLOWED_VIDEO_TYPES = Set.of(
            "video/mp4", "video/webm", "video/quicktime"
    );

    @Override
    public MediaResponseDTO getFeaturedMedia() {
        Pageable topOne = PageRequest.of(0, 1, Sort.by(Sort.Direction.DESC, "releaseYear"));
        List<Media> topList = mediaRepository.findAll(topOne).getContent();
        if (topList.isEmpty()) {
            return null;
        }
        return mediaMapper.toDTO(topList.get(0));
    }

    @Override
    public Page<MediaResponseDTO> getAllMedia(String type, String genre, String search, String sortBy, int page, int size) {
        return getAllMedia(type, genre, search, sortBy, null, null, page, size);
    }

    @Override
    public Page<MediaResponseDTO> getAllMedia(String type, String genre, String search, String sortBy, String country, Integer year, int page, int size) {
        Sort sort = Sort.unsorted();
        if (SORT_BY_RATING.equalsIgnoreCase(sortBy)) {
            sort = Sort.by(Sort.Direction.DESC, "rating");
        } else if (SORT_BY_NEWEST.equalsIgnoreCase(sortBy)) {
            sort = Sort.by(Sort.Direction.DESC, "releaseYear");
        } else {
            sort = Sort.by(Sort.Direction.ASC, "title");
        }
        Pageable pageable = PageRequest.of(page, size, sort);

        Specification<Media> spec = MediaSpecification.buildFilter(type, genre, search);
        if (country != null && !country.isBlank() && !country.equalsIgnoreCase("Semua Negara")) {
            spec = spec.and((root, query, cb) -> cb.equal(cb.lower(root.get("country")), country.toLowerCase()));
        }
        if (year != null && year > 0) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("releaseYear"), year));
        }

        Page<Media> mediaPage = mediaRepository.findAll(spec, pageable);
        return mediaPage.map(mediaMapper::toDTO);
    }

    @Override
    public MediaResponseDTO getMediaById(String id) {
        Media media = mediaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Media dengan ID '" + id + "' tidak ditemukan."));
        return mediaMapper.toDTO(media);
    }

    @Override
    public List<MediaResponseDTO> getMediaByIds(List<String> ids) {
        if (ids == null || ids.isEmpty()) return List.of();
        
        return mediaRepository.findAllByIdIn(ids).stream()
                .map(mediaMapper::toDTO)
                .collect(Collectors.toList());
    }

@Override
    @Transactional
    public MediaResponseDTO createMedia(MediaRequestDTO requestDTO) {
        Media media = mediaMapper.toEntity(requestDTO);

        if (requestDTO.getCastAndCrew() != null) {
            requestDTO.getCastAndCrew().forEach(castDto -> {

                Person person = personRepository.findByNameIgnoreCase(castDto.getPersonName())
                        .orElseGet(() -> {
                            Person newPerson = new Person();
                            newPerson.setName(castDto.getPersonName());
                            return personRepository.save(newPerson);
                        });

                MediaCast mediaCast = new MediaCast();
                mediaCast.setMedia(media);
                mediaCast.setPerson(person);
                mediaCast.setCharacterName(castDto.getCharacterName());
                mediaCast.setRole(castDto.getRole());
                mediaCast.setCastOrder(castDto.getCastOrder());

                media.getCastAndCrew().add(mediaCast);
            });
        }

        Media savedMedia = mediaRepository.save(media);

        // Publish domain event setelah media berhasil disimpan ke database
        eventPublisher.publish(new MediaCreatedEvent(
                savedMedia.getId(),
                savedMedia.getTitle(),
                savedMedia.getClass().getSimpleName(),
                savedMedia.getReleaseYear(),
                savedMedia.getRating(),
                savedMedia.getGenres(),
                savedMedia.getPosterUrl(),
                savedMedia.getTrailerUrl(),
                savedMedia.getAgeRating()
        ));

        return mediaMapper.toDTO(savedMedia);
    }

    @Override
    @Transactional
    public MediaResponseDTO updateMedia(String id, MediaRequestDTO requestDTO) {
        Media existingMedia = mediaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Media dengan ID '" + id + "' tidak ditemukan."));

        if ((existingMedia instanceof Movie && !(requestDTO instanceof MovieRequestDTO)) ||
            (existingMedia instanceof TvSeries && !(requestDTO instanceof TvSeriesRequestDTO))) {
            throw new IllegalArgumentException("Konflik Data: Tipe media pada database tidak sesuai dengan payload request.");
        }

        mediaMapper.updateEntityFromDto(requestDTO, existingMedia);

        if (requestDTO.getCastAndCrew() != null) {

            existingMedia.getCastAndCrew().clear();

            requestDTO.getCastAndCrew().forEach(castDto -> {
                Person person = personRepository.findByNameIgnoreCase(castDto.getPersonName())
                        .orElseGet(() -> {
                            Person newPerson = new Person();
                            newPerson.setName(castDto.getPersonName());
                            return personRepository.save(newPerson);
                        });

                MediaCast mediaCast = new MediaCast();
                mediaCast.setMedia(existingMedia);
                mediaCast.setPerson(person);
                mediaCast.setCharacterName(castDto.getCharacterName());
                mediaCast.setRole(castDto.getRole());
                mediaCast.setCastOrder(castDto.getCastOrder());

                existingMedia.getCastAndCrew().add(mediaCast);
            });
        }

        MediaResponseDTO result = mediaMapper.toDTO(existingMedia);

        // Publish domain event setelah media berhasil diperbarui
        // changedFields: tandai semua field non-null di requestDTO sebagai "berubah"
        java.util.Set<String> changedFields = new java.util.HashSet<>();
        if (requestDTO.getTitle() != null)         changedFields.add("title");
        if (requestDTO.getOriginalTitle() != null) changedFields.add("originalTitle");
        if (requestDTO.getTagline() != null)       changedFields.add("tagline");
        if (requestDTO.getOverview() != null)      changedFields.add("overview");
        if (requestDTO.getGenres() != null)        changedFields.add("genres");
        if (requestDTO.getRating() != null)        changedFields.add("rating");
        if (requestDTO.getAgeRating() != null)     changedFields.add("ageRating");
        if (requestDTO.getPosterUrl() != null)     changedFields.add("posterUrl");
        if (requestDTO.getBackdropUrl() != null)   changedFields.add("backdropUrl");
        if (requestDTO.getTrailerUrl() != null)    changedFields.add("trailerUrl");
        if (requestDTO.getCountry() != null)       changedFields.add("country");
        if (requestDTO.getReleaseYear() != null)   changedFields.add("releaseYear");
        if (requestDTO.getCastAndCrew() != null)   changedFields.add("castAndCrew");

        eventPublisher.publish(new MediaUpdatedEvent(
                existingMedia.getId(),
                existingMedia.getTitle(),
                existingMedia.getClass().getSimpleName(),
                changedFields,
                null // updatedBy: bisa diisi dari SecurityContext jika dibutuhkan
        ));

        return result;
    }

    @Override
    @Transactional
    public void deleteMedia(String id) {
        // Ambil data media sebelum dihapus agar bisa disertakan di event
        Media media = mediaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Media dengan ID '" + id + "' tidak ditemukan."));

        String title = media.getTitle();
        String mediaType = media.getClass().getSimpleName();

        // ── Cleanup file R2 (best-effort, tidak boleh gagalkan delete DB) ──
        deleteR2FileIfPresent(media.getPosterUrl(),   "poster",   id);
        deleteR2FileIfPresent(media.getBackdropUrl(), "backdrop", id);
        deleteR2FileIfPresent(media.getTrailerUrl(),  "trailer",  id);

        mediaRepository.deleteById(id);

        // Publish domain event setelah media berhasil dihapus dari database
        eventPublisher.publish(new MediaDeletedEvent(id, title, mediaType, null));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Upload file ke R2
    // ─────────────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public MediaResponseDTO uploadPoster(String mediaId, MultipartFile poster) {
        validateImageFile(poster);
        Media media = getMediaEntityById(mediaId);

        // Hapus poster lama jika ada
        deleteR2FileIfPresent(media.getPosterUrl(), "poster lama", mediaId);

        String url = r2StorageService.upload(poster, FOLDER_POSTERS, buildFileName(mediaId, "poster", poster));
        media.setPosterUrl(url);
        mediaRepository.save(media);

        log.info("Poster media '{}' berhasil diupload ke R2: {}", mediaId, url);
        return mediaMapper.toDTO(media);
    }

    @Override
    @Transactional
    public MediaResponseDTO uploadBackdrop(String mediaId, MultipartFile backdrop) {
        validateImageFile(backdrop);
        Media media = getMediaEntityById(mediaId);

        // Hapus backdrop lama jika ada
        deleteR2FileIfPresent(media.getBackdropUrl(), "backdrop lama", mediaId);

        String url = r2StorageService.upload(backdrop, FOLDER_BACKDROPS, buildFileName(mediaId, "backdrop", backdrop));
        media.setBackdropUrl(url);
        mediaRepository.save(media);

        log.info("Backdrop media '{}' berhasil diupload ke R2: {}", mediaId, url);
        return mediaMapper.toDTO(media);
    }

    @Override
    @Transactional
    public MediaResponseDTO uploadTrailer(String mediaId, MultipartFile trailer) {
        validateVideoFile(trailer);
        Media media = getMediaEntityById(mediaId);

        // Hapus trailer lama jika ada
        deleteR2FileIfPresent(media.getTrailerUrl(), "trailer lama", mediaId);

        String url = r2StorageService.upload(trailer, FOLDER_TRAILERS, buildFileName(mediaId, "trailer", trailer));
        media.setTrailerUrl(url);
        mediaRepository.save(media);

        log.info("Trailer media '{}' berhasil diupload ke R2: {}", mediaId, url);
        return mediaMapper.toDTO(media);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Private helpers
    // ─────────────────────────────────────────────────────────────────────────

    /** Ambil entity Media atau lempar ResourceNotFoundException. */
    private Media getMediaEntityById(String mediaId) {
        return mediaRepository.findById(mediaId)
                .orElseThrow(() -> new ResourceNotFoundException("Media dengan ID '" + mediaId + "' tidak ditemukan."));
    }

    /**
     * Hapus file dari R2 berdasarkan public URL (best-effort).
     * Tidak melempar exception agar tidak mengganggu operasi utama.
     * Mengekstrak objectKey dari URL publik R2.
     */
    private void deleteR2FileIfPresent(String publicUrl, String label, String mediaId) {
        if (!StringUtils.hasText(publicUrl)) return;
        try {
            // Ekstrak objectKey dari URL: ambil path setelah domain
            // Contoh URL: https://cdn.liveeuy.com/posters/abc-poster.jpg
            //              atau https://123.r2.cloudflarestorage.com/bucket/posters/abc.jpg
            String objectKey = extractObjectKeyFromUrl(publicUrl);
            if (StringUtils.hasText(objectKey)) {
                r2StorageService.delete(objectKey);
                log.debug("Berhasil hapus {} R2 untuk media '{}': {}", label, mediaId, objectKey);
            }
        } catch (Exception e) {
            // Best-effort: log warning, jangan gagalkan operasi utama
            log.warn("Gagal hapus {} R2 untuk media '{}' (URL: {}): {}", label, mediaId, publicUrl, e.getMessage());
        }
    }

    /**
     * Ekstrak object key dari public URL.
     * Mendukung dua format:
     * - Custom domain:  https://cdn.liveeuy.com/posters/abc.jpg       → posters/abc.jpg
     * - R2 direct URL: https://{id}.r2.cloudflarestorage.com/{bucket}/posters/abc.jpg → posters/abc.jpg
     */
    private String extractObjectKeyFromUrl(String publicUrl) {
        if (!StringUtils.hasText(publicUrl)) return null;
        try {
            java.net.URI uri = java.net.URI.create(publicUrl);
            String path = uri.getPath(); // /posters/abc.jpg  atau  /bucket/posters/abc.jpg
            if (path == null || path.isEmpty()) return null;

            // Untuk R2 direct URL, path dimulai dengan /{bucketName}/objectKey
            // Untuk custom domain, path dimulai dengan /objectKey langsung
            // Cukup hapus leading slash, lalu ambil dari segment pertama yang bukan nama bucket
            path = path.startsWith("/") ? path.substring(1) : path;

            // Cek apakah ini URL R2 langsung (host = *.r2.cloudflarestorage.com)
            String host = uri.getHost();
            if (host != null && host.endsWith(".r2.cloudflarestorage.com")) {
                // Format: /{bucketName}/objectKey → hapus segment pertama (bucketName)
                int slashIdx = path.indexOf('/');
                return (slashIdx >= 0) ? path.substring(slashIdx + 1) : null;
            }

            // Custom domain: path sudah merupakan objectKey
            return path;
        } catch (Exception e) {
            log.warn("Tidak bisa parsing URL R2: {}", publicUrl);
            return null;
        }
    }

    /**
     * Validasi file gambar (poster/backdrop).
     * Lempar R2StorageException jika format tidak valid atau file kosong.
     */
    private void validateImageFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new R2StorageException("File tidak boleh kosong");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_IMAGE_TYPES.contains(contentType.toLowerCase())) {
            throw new R2StorageException(
                "Format file tidak didukung: " + contentType +
                ". Hanya JPG, PNG, WebP, dan GIF yang diizinkan untuk gambar."
            );
        }
        // Batas 10MB untuk gambar
        if (file.getSize() > 10L * 1024 * 1024) {
            throw new R2StorageException("Ukuran file gambar terlalu besar: maksimal 10MB.");
        }
    }

    /**
     * Validasi file video (trailer).
     * Lempar R2StorageException jika format tidak valid atau file kosong.
     */
    private void validateVideoFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new R2StorageException("File tidak boleh kosong");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_VIDEO_TYPES.contains(contentType.toLowerCase())) {
            throw new R2StorageException(
                "Format file tidak didukung: " + contentType +
                ". Hanya MP4, WebM, dan MOV yang diizinkan untuk video."
            );
        }
        // Batas 500MB untuk video trailer
        if (file.getSize() > 500L * 1024 * 1024) {
            throw new R2StorageException("Ukuran file video terlalu besar: maksimal 500MB.");
        }
    }

    /**
     * Bangun nama file unik untuk R2 berdasarkan mediaId, jenis (poster/backdrop/trailer), dan ekstensi file asli.
     * Contoh: media-abc123-poster.jpg
     */
    private String buildFileName(String mediaId, String kind, MultipartFile file) {
        String originalFilename = file.getOriginalFilename();
        String ext = "";
        if (StringUtils.hasText(originalFilename) && originalFilename.contains(".")) {
            ext = originalFilename.substring(originalFilename.lastIndexOf('.'));
        }
        // Gunakan 8 karakter pertama mediaId untuk readability
        String shortId = mediaId.length() > 8 ? mediaId.substring(0, 8) : mediaId;
        return "media-" + shortId + "-" + kind + ext;
    }
}

