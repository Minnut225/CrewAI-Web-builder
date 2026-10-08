package com.finman.dto.response;

public record InfoDto(
    String app,
    String version,
    String javaVersion,
    String buildTime
) {
}