package com.seooptimizer.backend.config;

import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import lombok.Data; // Assuming Lombok is being used for getters/setters

@Data
// @Configuration // To ensure Spring registers this as a configuration bean
@ConfigurationProperties(prefix = "spring.web.cors") // Matches the YAML structure
public class CorsConfig {
    private List<String> allowedOrigins;
    private List<String> allowedMethods;
    private List<String> allowedHeaders;
    private boolean allowCredentials;
}