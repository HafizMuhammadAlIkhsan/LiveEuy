package com.liveeuy.catalog_service.client.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record TranscoderJobResponseDTO(
    boolean success,
    JobData data
) {
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record JobData(
        String jobId,
        String mediaId,
        String epsiodeID,
        String status,
        Double progress,
        String masterPlaylistUrl,
        String thumbnailUrl,
        String posterUrl,
        String errorMessage,
        VideoMetadata Metadata
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record VideoMetadata(
        Double durationSeconds,
        Integer width,
        Integer height,
        String videoCodec,
        String audioCodec
    ) {}
}
