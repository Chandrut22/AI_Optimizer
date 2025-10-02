package com.seooptimizer.backend.security;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
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

        String jwtToken = null;
        String authHeader = request.getHeader("Authorization");

        // 1. Try to get JWT from Authorization header
        if (StringUtils.hasText(authHeader) && authHeader.startsWith("Bearer ")) {
            jwtToken = authHeader.substring(7);
        } 
        // 2. If not in header, try to get it from the cookie
        else {
            jwtToken = jwtUtil.extractAccessTokenFromCookie(request);
        }

        if (jwtToken == null) {
            filterChain.doFilter(request, response);
            return;
        }

        String email = jwtUtil.extractUsername(jwtToken);

        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            // Since roles are in the token, we can build UserDetails without a DB call
            List<String> roles = jwtUtil.extractRoles(jwtToken);
            List<SimpleGrantedAuthority> authorities = roles.stream()
                    .map(role -> new SimpleGrantedAuthority(role)) // Roles should be prefixed (e.g., "ROLE_ADMIN")
                    .collect(Collectors.toList());

            UserDetails userDetails = new org.springframework.security.core.userdetails.User(email, "", authorities);

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
            }
        }

        filterChain.doFilter(request, response);
    }
}
