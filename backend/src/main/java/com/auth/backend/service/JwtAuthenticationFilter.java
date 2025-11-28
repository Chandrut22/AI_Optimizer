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
import jakarta.servlet.http.Cookie; 
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor 
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService; 
    private final String ACCESS_TOKEN_COOKIE_NAME = "access_token"; 
    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain 
    ) throws ServletException, IOException {

        if (isPublicAuthPath(request)) {
            logger.debug("Skipping JWT filter for public auth path: {}", request.getServletPath());
            filterChain.doFilter(request, response); 
            return; 
        }
        String jwt = extractTokenFromHeader(request);

        if (jwt == null) {
            jwt = extractTokenFromCookie(request);
            if (jwt != null) {
                logger.debug("Found JWT in 'access_token' cookie.");
            }
        } else {
            logger.debug("Found JWT in 'Authorization' header.");
        }
        
        final String userEmail;

        if (jwt == null) {
            logger.debug("No JWT found in header or cookie for secured path: {}", request.getServletPath());
            filterChain.doFilter(request, response);
            return;
        }

        try {
            userEmail = jwtService.extractUsername(jwt);
            logger.debug("Extracted username '{}' from JWT.", userEmail);
        } catch (Exception e) {
            logger.warn("Could not extract username from JWT: {}", e.getMessage());
            filterChain.doFilter(request, response); 
            return;
        }

        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);

            boolean isTokenValid = false;
            try {
                isTokenValid = jwtService.isTokenValid(jwt, userDetails);
            } catch (Exception e) {
                logger.warn("JWT token validation failed for user '{}': {}", userEmail, e.getMessage());
            }

            if (isTokenValid) {
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails, 
                        null,        
                        userDetails.getAuthorities() 
                );
                authToken.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request)
                );
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
        return null; 
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
        return null; 
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