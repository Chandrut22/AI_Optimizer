package com.auth.backend.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import com.auth.backend.service.JwtAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor // Still injects the filter
public class SecurityConfiguration {

    private final JwtAuthenticationFilter jwtAuthFilter;
    // Removed other dependencies/beans (UserDetailsService, PasswordEncoder, etc.)

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/v1/auth/**").permitAll()
                        .requestMatchers("/hello").permitAll()
                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                // AuthenticationProvider will be picked up automatically by Spring Security
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // REMOVED userDetailsService() bean
    // REMOVED passwordEncoder() bean
    // REMOVED authenticationProvider() bean
    // REMOVED authenticationManager() bean
}