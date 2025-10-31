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
import jakarta.servlet.http.Cookie; // Import AntPathMatcher
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
        // Check if the request path matches public auth paths (/hello, /api/v1/auth/**)
        if (isPublicAuthPath(request)) {
            logger.debug("Skipping JWT filter for public auth path: {}", request.getServletPath());
            filterChain.doFilter(request, response); // Pass directly to the next filter in the chain
            return; // Exit the filter early, do not process JWT for these paths
        }
        // --------------------------------------------------

        // 1. Attempt to extract the JWT from the "access_token" cookie
        final String jwt = extractTokenFromCookie(request);
        final String userEmail;

        // If no access token cookie is found for a non-public path,
        // pass to the next filter. The AuthorizationFilter later will deny access
        // because no authentication is set.
        if (jwt == null) {
            logger.debug("No JWT access token cookie found for secured path: {}", request.getServletPath());
            filterChain.doFilter(request, response);
            return;
        }

        // 2. Extract the user email (subject) from the JWT
        try {
            userEmail = jwtService.extractUsername(jwt);
            logger.debug("Extracted username '{}' from JWT cookie.", userEmail);
        } catch (Exception e) {
            // Log exceptions during extraction (e.g., expired token, malformed token)
            logger.warn("Could not extract username from JWT cookie: {}", e.getMessage());
            // Optionally clear the invalid cookie here if needed
            // Proceed without setting authentication; AuthorizationFilter will deny access
            filterChain.doFilter(request, response);
            return;
        }

        // 3. Check if email was extracted AND user is not already authenticated in the current session/request
        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            // Load UserDetails (our User object) from the database using the email
            // This step will throw UsernameNotFoundException if the user doesn't exist
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);

            // 4. Validate the token (checks signature, expiration against UserDetails)
            boolean isTokenValid = false;
            try {
                isTokenValid = jwtService.isTokenValid(jwt, userDetails);
            } catch (Exception e) {
                // Log exceptions during validation (e.g., expired after extraction, signature mismatch)
                logger.warn("JWT token validation failed for user '{}': {}", userEmail, e.getMessage());
                // Optionally clear the invalid cookie here
            }

            // 5. If the token is valid, create authentication object and update SecurityContextHolder
            if (isTokenValid) {
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails, // The principal (User object)
                        null,        // Credentials (not needed for JWT)
                        userDetails.getAuthorities() // User's roles/permissions
                );
                // Set details from the web request (IP address, session ID, etc.)
                authToken.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request)
                );
                // Set the authentication in the security context for the current request thread
                SecurityContextHolder.getContext().setAuthentication(authToken);
                logger.debug("Successfully authenticated user '{}' via JWT cookie.", userEmail);
            } else {
                 logger.warn("JWT token was deemed invalid for user '{}'.", userEmail);
            }
        } else {
            // Log why authentication wasn't attempted (e.g., already authenticated)
            if (userEmail == null) {
                // This case should ideally be caught earlier, but added for completeness
                logger.debug("JWT extraction resulted in null userEmail, skipping authentication context update.");
            } else {
                logger.debug("User '{}' already authenticated, skipping JWT validation and context update.", userEmail);
            }
        }

        // 6. Pass the request/response to the next filter in the security chain
        filterChain.doFilter(request, response);
    }

    /**
     * Helper method to find and extract the JWT value from the request's cookies.
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
     * Checks if the request path matches defined public authentication paths.
     * Uses AntPathMatcher for pattern matching (e.g., /**).
     *
     * @param request The incoming HttpServletRequest.
     * @return true if the path matches a public pattern, false otherwise.
     */
    private boolean isPublicAuthPath(HttpServletRequest request) {
        // Define URL patterns for endpoints that should bypass JWT validation in this filter
         String[] publicPaths = {
            "/hello",
            "/api/v1/auth/register",
            "/api/v1/auth/authenticate",
            "/api/v1/auth/verify",
            "/api/v1/auth/forgot-password",
            "/api/v1/auth/reset-password",
            "/api/v1/auth/refresh-token"
            // "/oauth2/**" is handled by Spring Security's default OAuth filter, so it's implicitly public
        };
        String requestPath = request.getServletPath(); // Get path relative to application context

        // Log the path being checked
        logger.trace("Checking if path '{}' is public.", requestPath); // Use TRACE for very frequent logs

        // Check if the request path matches any of the defined public patterns
        boolean isPublic = Arrays.stream(publicPaths)
                .anyMatch(path -> pathMatcher.match(path, requestPath));

        if (isPublic) {
             logger.trace("Path '{}' matches public pattern.", requestPath);
        }
        return isPublic;
    }

}