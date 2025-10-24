package com.auth.backend.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
// Removed unused imports: List, Collection, SignatureAlgorithm

@Service
public class JwtService {

    @Value("${application.security.jwt.secret-key}")
    private String secretKey;
    @Value("${application.security.jwt.expiration}")
    private long jwtExpiration;
    @Value("${application.security.jwt.refresh-token.expiration}")
    private long refreshExpiration;

    /**
     * Extracts the username (email in our case) from the JWT token.
     */
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /**
     * Extracts a specific claim from the JWT token.
     * @param <T> Type of the claim
     * @param token JWT token string
     * @param claimsResolver Function to extract the claim
     * @return The extracted claim
     */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    /**
     * Generates an access JWT token for the given UserDetails, including authorities.
     * This is the primary method to call for generating access tokens.
     */
    public String generateToken(UserDetails userDetails) {
        Map<String, Object> extraClaims = new HashMap<>();
        // Add authorities claim
        extraClaims.put("authorities", userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList()));
        return buildToken(extraClaims, userDetails, jwtExpiration);
    }

    /**
     * Generates a JWT token with additional extra claims provided externally.
     * Authorities are added automatically if not already present.
     */
    public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        // Ensure authorities are included
        if (!extraClaims.containsKey("authorities")) {
            extraClaims.put("authorities", userDetails.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .collect(Collectors.toList()));
        }
        return buildToken(extraClaims, userDetails, jwtExpiration);
    }


    /**
     * Generates a Refresh token for the given UserDetails.
     * Typically does not contain extra claims like authorities.
     */
     public String generateRefreshToken(UserDetails userDetails) {
        // Refresh tokens usually don't need extra claims like roles
        return buildToken(new HashMap<>(), userDetails, refreshExpiration);
    }


    /**
     * Builds the JWT token with specified claims, subject, issued/expiration dates, and signing key.
     * Uses the non-deprecated signWith(Key) method.
     */
    private String buildToken(
            Map<String, Object> extraClaims,
            UserDetails userDetails,
            long expiration
    ) {
        return Jwts
                .builder()
                .setClaims(extraClaims) // Claims now include authorities for access tokens
                .setSubject(userDetails.getUsername()) // Use email as subject
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSignInKey()) // Use the key directly, algorithm inferred
                .compact();
    }


    /**
     * Validates the JWT token against the UserDetails (checks username match and expiration).
     */
    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        // Check if the username matches and the token is not expired
        return (username.equals(userDetails.getUsername())) && !isTokenExpired(token);
    }

    /**
     * Checks if the JWT token has expired.
     */
    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    /**
     * Extracts the expiration date claim from the JWT token.
     */
    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    /**
     * Extracts all claims from the JWT token using the modern parser builder.
     */
    private Claims extractAllClaims(String token) {
        return Jwts
                .parserBuilder() // Use the builder for parsing
                .setSigningKey(getSignInKey()) // Set the key to verify signature
                .build() // Build the parser
                .parseClaimsJws(token) // Parse and verify the token
                .getBody(); // Get the claims payload
    }

    /**
     * Gets the signing key (derived from the secret key) used for JWT generation and validation.
     * Ensures the key is suitable for HMAC-SHA algorithms.
     */
    private Key getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes); // Creates a secure SecretKey for HMAC
    }
}