package com.auth.backend.dto;

import java.time.LocalDateTime;

import com.auth.backend.model.ScanHistory;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ScanHistoryDto {
    private Integer id;
    private String url;
    private LocalDateTime createdAt;

    public static ScanHistoryDto fromEntity(ScanHistory entity) {
        return ScanHistoryDto.builder()
            .id(entity.getId())
            .url(entity.getUrl())
            .createdAt(entity.getCreatedAt())
            .build();
    }
}