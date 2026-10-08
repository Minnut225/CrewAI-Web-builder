package com.finman.dto.response;

import java.time.Instant;

public record ApiResponse<T>(
    boolean success,
    String message,
    T data,
    String errorCode,
    Instant timestamp,
    String path
) {
    public static <T> ApiResponse<T> success(String message, T data, String path) {
        return new ApiResponse<>(true, message, data, null, Instant.now(), path);
    }

    public static <T> ApiResponse<T> success(T data, String path) {
        return new ApiResponse<>(true, "Thành công", data, null, Instant.now(), path);
    }

    public static <T> ApiResponse<T> error(String message, String errorCode, String path) {
        return new ApiResponse<>(false, message, null, errorCode, Instant.now(), path);
    }

    public static <T> ApiResponse<T> error(String message, String errorCode, String path, T data) {
        return new ApiResponse<>(false, message, data, errorCode, Instant.now(), path);
    }
}