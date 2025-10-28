package com.auth.backend.config;

import java.net.http.HttpClient;
import java.time.Duration;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class HttpClientConfig {

    @Bean
    public HttpClient httpClient() {
        // Create a single, reusable HttpClient for making API calls
        return HttpClient.newBuilder()
                .version(HttpClient.Version.HTTP_2) // Prefer HTTP/2
                .connectTimeout(Duration.ofSeconds(10)) // Set a connection timeout
                .build();
    }
}

