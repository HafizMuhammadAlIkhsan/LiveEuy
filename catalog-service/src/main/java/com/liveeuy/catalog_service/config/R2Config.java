package com.liveeuy.catalog_service.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

import java.net.URI;

/**
 * Spring Configuration untuk Cloudflare R2.
 * <p>
 * Mengkonfigurasi dua bean utama:
 * <ul>
 *   <li>{@link S3Client} — untuk operasi CRUD (upload, delete, list, head)</li>
 *   <li>{@link S3Presigner} — untuk generate presigned URL (download sementara)</li>
 * </ul>
 * <p>
 * Region di-hardcode ke {@code auto} sesuai rekomendasi Cloudflare R2.
 * Path-style access diaktifkan karena R2 tidak mendukung virtual-hosted-style.
 */
@Slf4j
@Configuration
@RequiredArgsConstructor
public class R2Config {

    private final R2Properties r2Properties;

    @Bean
    public S3Client r2S3Client() {
        log.info("Menginisialisasi Cloudflare R2 S3Client → endpoint: {}, bucket: {}",
                r2Properties.getEndpointUrl(), r2Properties.getBucketName());

        return S3Client.builder()
                .endpointOverride(URI.create(r2Properties.getEndpointUrl()))
                // Region harus "auto" untuk Cloudflare R2
                .region(Region.of("auto"))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(
                                r2Properties.getAccessKeyId(),
                                r2Properties.getSecretAccessKey()
                        )
                ))
                // R2 menggunakan path-style (bukan virtual-hosted)
                .forcePathStyle(true)
                .build();
    }

    @Bean
    public S3Presigner r2S3Presigner() {
        return S3Presigner.builder()
                .endpointOverride(URI.create(r2Properties.getEndpointUrl()))
                .region(Region.of("auto"))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(
                                r2Properties.getAccessKeyId(),
                                r2Properties.getSecretAccessKey()
                        )
                ))
                .build();
    }
}
