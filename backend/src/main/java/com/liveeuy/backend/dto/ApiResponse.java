package com.liveeuy.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Format standar respon API LiveEuy")
public class ApiResponse<T> {

    @Schema(description = "Status keberhasilan operasi", example = "true")
    private boolean success;

    @Schema(description = "Pesan informasi atau konfirmasi", example = "Data berhasil dimuat")
    private String message;

    @Schema(description = "Payload data utama")
    private T data;

    public ApiResponse() {}

    public ApiResponse(boolean success, String message, T data) {
        this.success = success;
        this.message = message;
        this.data = data;
    }

    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(true, "Success", data);
    }

    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>(true, message, data);
    }

    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>(false, message, null);
    }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public T getData() { return data; }
    public void setData(T data) { this.data = data; }
}
