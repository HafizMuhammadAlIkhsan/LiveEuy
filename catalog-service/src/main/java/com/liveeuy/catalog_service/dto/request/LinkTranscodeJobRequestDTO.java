package com.liveeuy.catalog_service.dto.request;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LinkTranscodeJobRequestDTO {
    @JsonAlias({"transcodeJobId", "job_id"})
    @NotBlank(message = "Job ID cannot be blank")
    private String jobId;
}