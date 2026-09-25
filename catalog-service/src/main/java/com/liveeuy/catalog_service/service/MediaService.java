package com.liveeuy.catalog_service.service;

import com.liveeuy.catalog_service.dto.request.MediaRequestDTO;
import com.liveeuy.catalog_service.dto.response.MediaResponseDTO;
import org.springframework.data.domain.Page;

import java.util.List;

public interface MediaService {

    Page<MediaResponseDTO> getAllMedia(String type, String genre, String search, String sortBy, int page, int size);

    MediaResponseDTO getMediaById(String id);

    List<MediaResponseDTO> getMediaByIds(List<String> ids);

    MediaResponseDTO createMedia(MediaRequestDTO requestDTO);

    MediaResponseDTO updateMedia(String id, MediaRequestDTO requestDTO);

    void deleteMedia(String id);
}
