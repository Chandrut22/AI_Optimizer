package com.auth.backend.dto;

import com.auth.backend.model.ScanHistory;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class ScanHistoryDto {
    private Integer id;
    private String url;
    private LocalDateTime createdAt;

    // Helper method to convert an Entity to a DTO
    public static ScanHistoryDto fromEntity(ScanHistory entity) {
        return ScanHistoryDto.builder()
            .id(entity.getId())
            .url(entity.getUrl())
            .createdAt(entity.getCreatedAt())
            .build();
    }
}