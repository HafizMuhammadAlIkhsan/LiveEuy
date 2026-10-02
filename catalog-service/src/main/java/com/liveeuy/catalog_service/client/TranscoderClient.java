package com.liveeuy.catalog_service.client;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.Optional;
import java.util.concurrent.atomic.AtomicReference;

@Slf4j
@Component
public class TranscoderClient {

    private final RestClient restClient;
    private final AtomicReference<String> latestAdminToken = new AtomicReference<>("");

    public TranscoderClient(@Value("${app.transcoder.base-url:http://localhost:8082}") String baseUrl) {
        this.restClient = RestClient.builder().baseUrl(baseUrl).build();
    }

    public void updateActiveToken(String bearerToken) {
        if (bearerToken != null && !bearerToken.isBlank()) {
            this.latestAdminToken.set(bearerToken.startsWith("Bearer ") ? bearerToken : "Bearer " + bearerToken);
        }
    }

    public Optional<JobStatusData> getJobStatus(String jobId, String optionalToken) {
        String tokenToUse = (optionalToken != null && !optionalToken.isBlank()) 
                ? (optionalToken.startsWith("Bearer ") ? optionalToken : "Bearer " + optionalToken)
                : this.latestAdminToken.get();

        try {
            var request = restClient.get().uri("/api/v1/transcoder/jobs/{id}", jobId);
            if (!tokenToUse.isBlank()) {
                request.header(HttpHeaders.AUTHORIZATION, tokenToUse);
            }

            TranscoderResponse response = request.retrieve().body(TranscoderResponse.class);
            return Optional.ofNullable(response).map(TranscoderResponse::data);
        } catch (Exception e) {
            log.warn("⚠️ Gagal mengecek status job '{}': {}", jobId, e.getMessage());
            return Optional.empty();
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record TranscoderResponse(boolean success, JobStatusData data) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record JobStatusData(
            String id,
            String status,
            Double progress,
            String masterPlaylistUrl,
            String posterUrl,
            String errorMessage,
            VideoMetadata metadata
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record VideoMetadata(Double durationSeconds) {}
}