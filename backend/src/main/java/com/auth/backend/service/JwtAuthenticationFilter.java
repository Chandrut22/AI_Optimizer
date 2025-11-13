package com.auth.backend.service; // Or config, ensure package is correct

import java.io.IOException;
import java.util.Arrays;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie; // Import Cookie
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor // Creates constructor with final fields
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService; // Spring Security interface to load user
    private final String ACCESS_TOKEN_COOKIE_NAME = "access_token"; // Name of the cookie holding the JWT
    // Utility for matching URL patterns (e.g., /api/v1/auth/**)
    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain // Mechanism to pass request to the next filter
    ) throws ServletException, IOException {

        // --- Bypass Check for Public Authentication Paths ---
        if (isPublicAuthPath(request)) {
            logger.debug("Skipping JWT filter for public auth path: {}", request.getServletPath());
            filterChain.doFilter(request, response); // Pass directly to the next filter
            return; // Exit the filter early
        }
        // --------------------------------------------------

        // --- 1. (MODIFIED) Attempt to extract JWT ---
        // First, try the Authorization header (for FastAPI/service-to-service)
        String jwt = extractTokenFromHeader(request);

        // If not in header, fall back to checking the cookie (for frontend)
        if (jwt == null) {
            jwt = extractTokenFromCookie(request);
            if (jwt != null) {
                logger.debug("Found JWT in 'access_token' cookie.");
            }
        } else {
            logger.debug("Found JWT in 'Authorization' header.");
        }
        // ---------------------------------------------
        
        final String userEmail;

        // If no token is found in either location, pass to the next filter.
        // Spring Security will deny access later as no auth is set.
        if (jwt == null) {
            logger.debug("No JWT found in header or cookie for secured path: {}", request.getServletPath());
            filterChain.doFilter(request, response);
            return;
        }

        // 2. Extract the user email (subject) from the JWT
        try {
            userEmail = jwtService.extractUsername(jwt);
            logger.debug("Extracted username '{}' from JWT.", userEmail);
        } catch (Exception e) {
            logger.warn("Could not extract username from JWT: {}", e.getMessage());
            filterChain.doFilter(request, response); // Proceed so AuthorizationFilter can deny
            return;
        }

        // 3. Check if email was extracted AND user is not already authenticated
        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            // Load UserDetails from the database
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);

            // 4. Validate the token (checks signature, expiration)
            boolean isTokenValid = false;
            try {
                isTokenValid = jwtService.isTokenValid(jwt, userDetails);
            } catch (Exception e) {
                logger.warn("JWT token validation failed for user '{}': {}", userEmail, e.getMessage());
            }

            // 5. If valid, create auth object and update SecurityContextHolder
            if (isTokenValid) {
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails, // The principal (User object)
                        null,        // Credentials (not needed for JWT)
                        userDetails.getAuthorities() // User's roles/permissions
                );
                authToken.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request)
                );
                // Set the authentication in the security context
                SecurityContextHolder.getContext().setAuthentication(authToken);
                logger.debug("Successfully authenticated user '{}' via JWT.", userEmail);
            } else {
                 logger.warn("JWT token was deemed invalid for user '{}'.", userEmail);
            }
        } else {
            if (userEmail != null) {
                logger.debug("User '{}' already authenticated, skipping JWT validation.", userEmail);
            }
        }

        // 6. Pass the request/response to the next filter in the security chain
        filterChain.doFilter(request, response);
    }

    /**
     * (NEW) Helper method to find and extract the JWT value from the Authorization header.
     *
     * @param request The incoming HttpServletRequest.
     * @return The JWT string if the 'Authorization' header is found and formatted correctly, otherwise null.
     */
    private String extractTokenFromHeader(HttpServletRequest request) {
        final String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7); // Extract token after "Bearer "
            if (!token.isEmpty()) {
                return token;
            }
        }
        return null; // Return null if header is missing, not "Bearer", or token is empty
    }

    /**
     * (EXISTING) Helper method to find and extract the JWT value from the request's cookies.
     *
     * @param request The incoming HttpServletRequest.
     * @return The JWT string if the 'access_token' cookie is found, otherwise null.
     */
    private String extractTokenFromCookie(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            return Arrays.stream(cookies)
                    .filter(cookie -> ACCESS_TOKEN_COOKIE_NAME.equals(cookie.getName()))
                    .map(Cookie::getValue)
                    .findFirst()
                    .orElse(null);
        }
        return null; // Return null if there are no cookies at all
    }

    /**
     * (EXISTING) Checks if the request path matches defined public authentication paths.
     *
     * @param request The incoming HttpServletRequest.
     * @return true if the path matches a public pattern, false otherwise.
     */
    private boolean isPublicAuthPath(HttpServletRequest request) {
        String[] publicPaths = {
            "/hello",
            "/api/v1/auth/register",
            "/api/v1/auth/authenticate",
            "/api/v1/auth/verify",
            "/api/v1/auth/forgot-password",
            "/api/v1/auth/reset-password",
            "/api/v1/auth/refresh-token"
        };
        String requestPath = request.getServletPath();

        return Arrays.stream(publicPaths)
                .anyMatch(path -> pathMatcher.match(path, requestPath));
    }
}