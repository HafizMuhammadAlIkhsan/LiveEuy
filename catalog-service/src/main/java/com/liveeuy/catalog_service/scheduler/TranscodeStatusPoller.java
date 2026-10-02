package com.liveeuy.catalog_service.scheduler;

import com.liveeuy.catalog_service.entity.Media;
import com.liveeuy.catalog_service.entity.enums.ProcessingStatus;
import com.liveeuy.catalog_service.repository.MediaRepository;
import com.liveeuy.catalog_service.service.impl.MediaServiceImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class TranscodeStatusPoller {

    private final MediaRepository mediaRepository;
    private final MediaServiceImpl mediaService;

    @Scheduled(fixedDelay = 5000)
    @Transactional
    public void pollProcessingMedia() {
        List<Media> activeJobs = mediaRepository.findByProcessingStatus(ProcessingStatus.PROCESSING);

        if (activeJobs.isEmpty()) {
            return;
        }

        log.info("🔍 [POLLER] Memeriksa {} media yang sedang berstatus PROCESSING...", activeJobs.size());

        for (Media media : activeJobs) {
            if (media.getTranscodedJobId() == null || media.getTranscodedJobId().isBlank()) {
                continue;
            }

            mediaService.applyTranscoderUpdate(media, "");
            mediaRepository.save(media);

            if (media.getProcessingStatus() == ProcessingStatus.READY) {
                log.info("[POLLER] Media '{}' ({}) selesai ditranscode dan kini READY!", media.getTitle(), media.getId());
            } else if (media.getProcessingStatus() == ProcessingStatus.FAILED) {
                log.warn("[POLLER] Media '{}' ({}) transkoding GAGAL!", media.getTitle(), media.getId());
            }
        }
    }
}