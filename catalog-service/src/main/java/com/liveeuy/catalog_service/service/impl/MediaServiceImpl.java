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
import com.liveeuy.catalog_service.exception.ResourceNotFoundException;
import com.liveeuy.catalog_service.mapper.MediaMapper;
import com.liveeuy.catalog_service.repository.MediaRepository;
import com.liveeuy.catalog_service.repository.PersonRepository;
import com.liveeuy.catalog_service.service.MediaService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.liveeuy.catalog_service.specification.MediaSpecification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MediaServiceImpl implements MediaService {

    private final MediaRepository mediaRepository;
    private final PersonRepository personRepository;
    private final MediaMapper mediaMapper;

    private static final String SORT_BY_RATING = "rating";
    private static final String SORT_BY_NEWEST = "newest";

    @Override
    public Page<MediaResponseDTO> getAllMedia(String type, String genre, String search, String sortBy, int page, int size) {
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

        return mediaMapper.toDTO(existingMedia);
    }

    @Override
    @Transactional
    public void deleteMedia(String id) {
        if (!mediaRepository.existsById(id)) {
            throw new ResourceNotFoundException("Media dengan ID '" + id + "' tidak ditemukan.");
        }
        mediaRepository.deleteById(id);
    }
}
