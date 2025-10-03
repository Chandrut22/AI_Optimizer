package com.seooptimizer.backend.security;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Collection;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;

@Component
public class JwtUtil {

    private Key secretKey;

    @Value("${jwt.secret}")
    private String rawSecret;

    @Value("${jwt.access-token-expiration-ms}")
    private long accessTokenExpiryMs;

    @PostConstruct
    public void init() {
        // The Keys.hmacShaKeyFor method handles creating a secure key.
        // The raw secret from your properties file is used directly.
        // Manual hashing is not needed and was causing the signature mismatch.
        this.secretKey = Keys.hmacShaKeyFor(rawSecret.getBytes(StandardCharsets.UTF_8));
    }

    /**
     * Generates a signed JWT access token for the given username and authorities.
     */
    public String generateAccessToken(String username, Collection<? extends GrantedAuthority> authorities) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("roles", authorities.stream().map(GrantedAuthority::getAuthority).collect(Collectors.toList()));

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + accessTokenExpiryMs))
                .signWith(secretKey, SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Extracts the username (subject) from a JWT token.
     */
    public String extractUsername(String token) {
        return getClaims(token).getSubject();
    }
    
    /**
     * Extracts roles from a JWT token.
     */
    @SuppressWarnings("unchecked")
    public List<String> extractRoles(String token) {
        return getClaims(token).get("roles", List.class);
    }

    /**
     * Checks whether the token is expired.
     */
    public boolean isTokenExpired(String token) {
        return getClaims(token).getExpiration().before(new Date());
    }

    /**
     * Validates a JWT access token against user details.
     */
    public boolean validateToken(String token, UserDetails userDetails) {
        String username = extractUsername(token);
        return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
    }

    /**
     * Parses the claims from a JWT token.
     */
    private Claims getClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(secretKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    /**
     * Extracts a specific cookie value from the request.
     */
    public String extractTokenFromCookie(HttpServletRequest request, String cookieName) {
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if (cookie.getName().equals(cookieName)) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }

    public String extractAccessTokenFromCookie(HttpServletRequest request) {
        return extractTokenFromCookie(request, "access_token");
    }

    public String extractRefreshTokenFromCookie(HttpServletRequest request) {
        return extractTokenFromCookie(request, "refresh_token");
    }
}
