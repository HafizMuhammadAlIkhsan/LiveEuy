package com.liveeuy.catalog_service.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
public class HealthController {

    @GetMapping({"/health", "/actuator/health"})
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "catalog-service",
                "timestamp", Instant.now().toString()
        ));
    }

    @GetMapping("/actuator/info")
    public ResponseEntity<Map<String, Object>> info() {
        return ResponseEntity.ok(Map.of(
                "app", "LiveEuy Catalog Service",
                "version", "0.0.1-SNAPSHOT"
        ));
    }
}
