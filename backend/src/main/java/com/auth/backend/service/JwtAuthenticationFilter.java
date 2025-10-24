package com.auth.backend.service;


import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.util.Arrays;
import jakarta.servlet.http.Cookie;
import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final String ACCESS_TOKEN_COOKIE_NAME = "access_token"; // Cookie name constant

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        // Try to extract token from Cookie first
        String jwt = extractTokenFromCookie(request);
        String userEmail = null;

        // If token found in cookie, extract username
        if (jwt != null) {
            try {
                userEmail = jwtService.extractUsername(jwt);
            } catch (Exception e) {
                // Handle potential exceptions during extraction (e.g., expired token)
                logger.warn("Could not extract username from JWT cookie: " + e.getMessage());
                // Optionally clear the invalid cookie here
            }
        }

        // --- Original logic using the extracted email and jwt ---
        // Check if email is not null AND user is not already authenticated
        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            // Load UserDetails from the database
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);

            // Validate the token (check expiration, etc.)
            boolean isTokenValid = false;
            try {
                 isTokenValid = jwtService.isTokenValid(jwt, userDetails);
            } catch(Exception e) {
                 logger.warn("JWT token validation failed: " + e.getMessage());
                 // Optionally clear the invalid cookie here
            }

            if (isTokenValid) {
                // Create an authentication token
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities()
                );
                authToken.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request)
                );
                // Update the SecurityContextHolder
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }
        // Pass the request to the next filter in the chain
        filterChain.doFilter(request, response);
    }

    // Helper method to extract token from cookies
    private String extractTokenFromCookie(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            return Arrays.stream(cookies)
                    .filter(cookie -> ACCESS_TOKEN_COOKIE_NAME.equals(cookie.getName()))
                    .map(Cookie::getValue)
                    .findFirst()
                    .orElse(null);
        }
        return null;
    }
}