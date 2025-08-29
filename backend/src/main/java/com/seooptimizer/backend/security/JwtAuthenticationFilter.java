package com.seooptimizer.backend.security;

import java.io.IOException;
import java.util.Arrays;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
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

    private final JwtUtil jwtUtil;
    private final CustomerUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String requestURI = request.getRequestURI();
        System.out.println("[JwtFilter] Incoming request: " + requestURI);

        // 1. Try Authorization header first
        String authHeader = request.getHeader("Authorization");
        String jwtToken = null;

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            jwtToken = authHeader.substring(7);
            System.out.println("[JwtFilter] Token extracted from Authorization header.");
        } else {
            // 2. Fallback: try HttpOnly cookie "access_token"
            if (request.getCookies() != null) {
                jwtToken = Arrays.stream(request.getCookies())
                        .filter(c -> "access_token".equals(c.getName()))
                        .findFirst()
                        .map(Cookie::getValue)
                        .orElse(null);

                if (jwtToken != null) {
                    System.out.println("[JwtFilter] Token extracted from access_token cookie.");
                } else {
                    System.out.println("[JwtFilter] No token found in header or cookie.");
                }
            }
        }

        if (jwtToken == null) {
            filterChain.doFilter(request, response);
            return;
        }

        // 3. Extract email (username) from JWT
        String email = jwtUtil.extractUsername(jwtToken);
        if (email == null) {
            System.out.println("[JwtFilter] Token does not contain a valid username.");
            filterChain.doFilter(request, response);
            return;
        }

        // 4. Authenticate if not already in SecurityContext
        if (SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = userDetailsService.loadUserByUsername(email);

            if (jwtUtil.validateToken(jwtToken, userDetails)) {
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities()
                        );

                authentication.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request)
                );

                SecurityContextHolder.getContext().setAuthentication(authentication);
                System.out.println("[JwtFilter] Authentication set for user: " + email);
            } else {
                System.out.println("[JwtFilter] Invalid or expired token for user: " + email);
            }
        }

        filterChain.doFilter(request, response);
    }
}
