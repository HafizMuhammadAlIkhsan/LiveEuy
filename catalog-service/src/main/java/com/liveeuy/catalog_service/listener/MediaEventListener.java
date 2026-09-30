package com.liveeuy.catalog_service.listener;

import com.liveeuy.catalog_service.domain.event.MediaCreatedEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Slf4j
@Component
public class MediaEventListener {
    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onMediaCreated(MediaCreatedEvent event) {
        log.info("📢 [DOMAIN EVENT] Media baru telah berhasil di-commit ke database!");
        log.info("   -> ID    : {}", event.mediaId());
        log.info("   -> Judul : {}", event.title());
        log.info("   -> Tipe  : {}", event.type());
        log.info("   -> Waktu : {}", event.occurredOn());
    }
}
