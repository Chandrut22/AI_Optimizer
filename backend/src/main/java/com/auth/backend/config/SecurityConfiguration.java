package com.auth.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer; // <-- 1. YOU MUST ADD THIS IMPORT
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.auth.backend.service.JwtAuthenticationFilter; // [cite: uploaded:chandrut22/ai_optimizer/AI_Optimizer-main/backend/src/main/java/com/auth/backend/service/JwtAuthenticationFilter.java]

import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfiguration {

    private final JwtAuthenticationFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // --- 2. THIS IS THE CRITICAL FIX ---
                // Use the modern (Spring Security 6+) lambda to disable CSRF
                .csrf(AbstractHttpConfigurer::disable)
                // -----------------------------------
                
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/hello",
                                "/api/v1/auth/register",
                                "/api/v1/auth/authenticate",
                                "/api/v1/auth/verify",
                                "/api/v1/auth/forgot-password",
                                "/api/v1/auth/reset-password",
                                "/api/v1/auth/refresh-token"
                        ).permitAll()
                        
                        // This rule is correct and will protect /api/v1/usage/**
                        .anyRequest().authenticated() 
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
                
        return http.build();
    }
}