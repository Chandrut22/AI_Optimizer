package com.auth.backend.service;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.util.AntPathMatcher; // <<< Import AntPathMatcher

import java.io.IOException;
import java.util.Arrays;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final String ACCESS_TOKEN_COOKIE_NAME = "access_token";
    // Utility for matching URL patterns
    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        // --- ADD THIS CHECK ---
        // Check if the request path matches public auth paths
        if (isPublicAuthPath(request)) {
            logger.debug("Skipping JWT filter for public auth path: {}", request.getServletPath());
            filterChain.doFilter(request, response); // Pass directly to the next filter
            return; // Do not process JWT for these paths
        }
        // --------------------

        // 1. Attempt to extract the JWT from the "access_token" cookie
        final String jwt = extractTokenFromCookie(request);
        final String userEmail;

        if (jwt == null) {
            // No token found, pass to next filter (AuthorizationFilter will handle access control)
            filterChain.doFilter(request, response);
            return;
        }

        // --- (Rest of the method remains the same) ---
        // 2. Extract the user email (subject) from the token
        try {
            userEmail = jwtService.extractUsername(jwt);
        } catch (Exception e) {
            logger.warn("Could not extract username from JWT cookie: {}", e.getMessage());
            filterChain.doFilter(request, response);
            return;
        }

        // 3. Check if email was extracted AND user is not already authenticated
        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);

            // 4. Validate the token
            boolean isTokenValid = false;
            try {
                 isTokenValid = jwtService.isTokenValid(jwt, userDetails);
            } catch(Exception e) {
                 logger.warn("JWT token validation failed: {}", e.getMessage());
            }

            // 5. If the token is valid, update the SecurityContextHolder
            if (isTokenValid) {
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
                logger.debug("Authentication successful for user: {}", userEmail);
            }
        } else {
             // ... (existing debug logs) ...
        }

        // 6. Pass the request/response to the next filter in the chain
        filterChain.doFilter(request, response);
    }

    // --- (extractTokenFromCookie method remains the same) ---
     private String extractTokenFromCookie(HttpServletRequest request) {
        // ... (existing code) ...
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

    // --- ADD THIS HELPER METHOD ---
    private boolean isPublicAuthPath(HttpServletRequest request) {
        // Define patterns for public auth endpoints
        String[] publicPaths = {"/api/v1/auth/**", "/hello"};
        return Arrays.stream(publicPaths)
                .anyMatch(path -> pathMatcher.match(path, request.getServletPath()));
    }
    // ----------------------------
}