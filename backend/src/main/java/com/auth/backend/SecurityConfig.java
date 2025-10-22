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
                .requestMatchers("/hello").permitAll() // 1. Allow public access to /hello
                .anyRequest().authenticated()          // 2. Secure all other endpoints
            )
            .oauth2ResourceServer(oauth2 -> oauth2.jwt()); // 3. Use JWT for authentication

        return http.build();
    }
}
