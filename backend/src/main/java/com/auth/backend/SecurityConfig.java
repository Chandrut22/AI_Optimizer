package com.auth.backend;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(authorize -> authorize
                // Allow public access to the /hello endpoint
                .requestMatchers("/hello").permitAll() 
                
                // All other endpoints (like /api/**) must be authenticated
                .anyRequest().authenticated()          
            )
            // Configure the app as an OAuth2 Resource Server
            // It will validate incoming JWTs
            .oauth2ResourceServer(oauth2 -> oauth2.jwt()); 

        return http.build();
    }
}