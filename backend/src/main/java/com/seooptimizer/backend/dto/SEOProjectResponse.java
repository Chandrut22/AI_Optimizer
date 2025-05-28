package com.seooptimizer.backend.dto;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SEOProjectResponse {
    private Long id;
    private String projectName;
    private String websiteUrl;
    private LocalDateTime createdAt;
}
