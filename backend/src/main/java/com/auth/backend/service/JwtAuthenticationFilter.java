package com.auth.backend.service;


import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie; // Import Cookie
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger; // Import Logger
import org.slf4j.LoggerFactory; // Import LoggerFactory
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays; // Import Arrays

@Component
@RequiredArgsConstructor // Creates constructor with final fields
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    // Define logger instance
    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService; // Spring Security interface to load user by username (email)
    private final String ACCESS_TOKEN_COOKIE_NAME = "access_token"; // Name of the cookie holding the JWT

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain // Mechanism to pass request to the next filter
    ) throws ServletException, IOException {

        // 1. Attempt to extract the JWT from the "access_token" cookie
        final String jwt = extractTokenFromCookie(request);
        final String userEmail;

        // If no JWT cookie is found, pass the request down the filter chain immediately
        if (jwt == null) {
            filterChain.doFilter(request, response);
            return;
        }

        // 2. Extract the user email (subject) from the token
        try {
            userEmail = jwtService.extractUsername(jwt);
        } catch (Exception e) {
            // Log if token parsing fails (e.g., expired, malformed)
            logger.warn("Could not extract username from JWT cookie: {}", e.getMessage());
            // Optionally clear the invalid cookie here (see note below)
            // clearCookie(response, ACCESS_TOKEN_COOKIE_NAME);
            filterChain.doFilter(request, response); // Continue chain even if token is bad initially
            return;
        }

        // 3. Check if email was extracted AND the user is not already authenticated in the current context
        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            // Load UserDetails (our User object) from the database using the email
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail); // Throws UsernameNotFoundException if user doesn't exist

            // 4. Validate the token (checks signature, expiration, and username match)
            boolean isTokenValid = false;
            try {
                 isTokenValid = jwtService.isTokenValid(jwt, userDetails);
            } catch(Exception e) {
                 // Log if validation fails (e.g., expired after extraction but before check)
                 logger.warn("JWT token validation failed: {}", e.getMessage());
                 // Optionally clear the invalid cookie here
                 // clearCookie(response, ACCESS_TOKEN_COOKIE_NAME);
            }

            // 5. If the token is valid, update the SecurityContextHolder
            if (isTokenValid) {
                // Create an authentication token for Spring Security context
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails, // The principal (our User object)
                        null,        // Credentials (not needed for JWT)
                        userDetails.getAuthorities() // User's roles/permissions
                );
                // Set details from the web request (IP address, session ID, etc.)
                authToken.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request)
                );
                // Set the authentication in the security context
                SecurityContextHolder.getContext().setAuthentication(authToken);
                logger.debug("Authentication successful for user: {}", userEmail); // Added debug log
            }
        } else {
             if (userEmail == null) {
                logger.debug("JWT extraction resulted in null userEmail.");
             } else {
                logger.debug("User {} already authenticated, skipping JWT validation.", userEmail);
             }
        }

        // 6. Pass the request/response to the next filter in the chain
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
                    // Find the cookie with the specific name
                    .filter(cookie -> ACCESS_TOKEN_COOKIE_NAME.equals(cookie.getName()))
                    // Get its value
                    .map(Cookie::getValue)
                    // Return the first one found
                    .findFirst()
                    // Return null if no matching cookie is found
                    .orElse(null);
        }
        // Return null if there are no cookies at all
        return null;
    }

    /*
    // Optional: Helper method to clear an invalid/expired cookie
    private void clearCookie(HttpServletResponse response, String cookieName) {
        ResponseCookie cookie = ResponseCookie.from(cookieName, "")
                .httpOnly(true)
                .secure(true) // Match your secure setting
                .sameSite("None") // Match your SameSite setting
                .path("/")
                .maxAge(0) // Expire immediately
                .domain(".yourdomain.com") // Match your domain setting
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        logger.debug("Cleared invalid cookie: {}", cookieName);
    }
    */
}