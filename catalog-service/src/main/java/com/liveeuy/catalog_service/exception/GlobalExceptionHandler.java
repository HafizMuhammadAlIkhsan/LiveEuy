package com.liveeuy.catalog_service.exception;

import com.liveeuy.catalog_service.dto.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.stream.Collectors;

/**
 * Global exception handler: menangkap semua exception yang dilempar dari Service/Controller
 * dan mengubahnya menjadi format JSON yang rapi untuk Frontend.
 *
 * Tanpa class ini, Spring Boot akan mengembalikan halaman error HTML yang tidak berguna
 * bagi aplikasi React.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Menangani ResourceNotFoundException (misal: Media dengan ID tertentu tidak ada)
     * -> Mengembalikan HTTP 404 Not Found
     */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleResourceNotFound(ResourceNotFoundException ex) {
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(HttpStatus.NOT_FOUND.value(), ex.getMessage()));
    }

    /**
     * Menangani error validasi dari @Valid di Controller (misal: field kosong)
     * -> Mengembalikan HTTP 400 Bad Request beserta daftar field yang salah
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidationError(MethodArgumentNotValidException ex) {
        String errorMessage = ex.getBindingResult().getFieldErrors().stream()
                .map(err -> err.getField() + ": " + err.getDefaultMessage())
                .collect(Collectors.joining(", "));

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(HttpStatus.BAD_REQUEST.value(), errorMessage));
    }

    /**
     * Fallback: Menangani semua exception tidak terduga
     * -> Mengembalikan HTTP 500 Internal Server Error
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGeneralException(Exception ex) {
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR.value(), "Terjadi kesalahan internal pada server."));
    }
}
