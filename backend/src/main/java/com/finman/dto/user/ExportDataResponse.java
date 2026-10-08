package com.finman.dto.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExportDataResponse {
    private String format;
    private String downloadUrl;
    private String generatedAt;
    private long recordCount;
}
