package com.auth.backend.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.security.KeyFactory;
import java.security.NoSuchAlgorithmException;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class JwtService {

    private static final Logger log = LoggerFactory.getLogger(JwtService.class);

    // Inject keys from application.properties (which get them from env vars)
    @Value("${application.security.jwt.private-key}")
    private String privateKeyPem;

    @Value("${application.security.jwt.public-key}")
    private String publicKeyPem;

    @Value("${application.security.jwt.expiration}")
    private long jwtExpiration;

    @Value("${application.security.jwt.refresh-token.expiration}")
    private long refreshExpiration;

    private PrivateKey signInKey;
    private PublicKey validationKey;

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    public String generateToken(UserDetails userDetails) {
        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("authorities", userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList()));
        return buildToken(extraClaims, userDetails, jwtExpiration);
    }

    public String generateRefreshToken(UserDetails userDetails) {
        return buildToken(new HashMap<>(), userDetails, refreshExpiration);
    }

    private String buildToken(
            Map<String, Object> extraClaims,
            UserDetails userDetails,
            long expiration
    ) {
        return Jwts
                .builder()
                .setClaims(extraClaims)
                .setSubject(userDetails.getUsername())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                // Sign with the Private Key using RS256
                .signWith(getSignInKey(), SignatureAlgorithm.RS256)
                .compact();
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername())) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private Claims extractAllClaims(String token) {
        // Parse and validate the token using the Public Key
        return Jwts
                .parserBuilder()
                .setSigningKey(getValidationKey()) // Use Public Key for validation
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    /**
     * Gets the PrivateKey used for signing tokens.
     * Lazily loads and parses the key from the PEM string.
     */
    private Key getSignInKey() {
        if (signInKey == null) {
            signInKey = parsePrivateKey(privateKeyPem);
        }
        return signInKey;
    }

    /**
     * Gets the PublicKey used for validating tokens.
     * Lazily loads and parses the key from the PEM string.
     */
    private Key getValidationKey() {
        if (validationKey == null) {
            validationKey = parsePublicKey(publicKeyPem);
        }
        return validationKey;
    }

    // --- HELPER METHODS FOR PARSING PEM KEYS ---

    /**
     * Parses a PEM-formatted string into a PrivateKey object.
     */
    private PrivateKey parsePrivateKey(String pemKey) {
        try {
            // 1. Clean the PEM string
            String privateKeyContent = pemKey
                    .replaceAll("\\s+", "") // Remove all whitespace
                    .replace("-----BEGINRSAPRIVATEKEY-----", "")
                    .replace("-----ENDRSAPRIVATEKEY-----", "")
                    .replace("-----BEGINPRIVATEKEY-----", "")
                    .replace("-----ENDPRIVATEKEY-----", "");

            // 2. Base64 decode the key content
            byte[] keyBytes = Base64.getDecoder().decode(privateKeyContent);

            // 3. Create a key specification
            PKCS8EncodedKeySpec keySpec = new PKCS8EncodedKeySpec(keyBytes);

            // 4. Get KeyFactory instance and generate key
            KeyFactory keyFactory = KeyFactory.getInstance("RSA");
            return keyFactory.generatePrivate(keySpec);

        } catch (NoSuchAlgorithmException | InvalidKeySpecException e) {
            log.error("Could not parse RSA private key", e);
            throw new RuntimeException("Could not parse private key", e);
        }
    }

    /**
     * Parses a PEM-formatted string into a PublicKey object.
     */
    private PublicKey parsePublicKey(String pemKey) {
        try {
            // 1. Clean the PEM string
            String publicKeyContent = pemKey
                    .replaceAll("\\s+", "") // Remove all whitespace
                    .replace("-----BEGINPUBLICKEY-----", "")
                    .replace("-----ENDPUBLICKEY-----", "");

            // 2. Base64 decode the key content
            byte[] keyBytes = Base64.getDecoder().decode(publicKeyContent);
            
            // 3. Create a key specification
            X509EncodedKeySpec keySpec = new X509EncodedKeySpec(keyBytes);

            // 4. Get KeyFactory instance and generate key
            KeyFactory keyFactory = KeyFactory.getInstance("RSA");
            return keyFactory.generatePublic(keySpec);

        } catch (NoSuchAlgorithmException | InvalidKeySpecException e) {
            log.error("Could not parse RSA public key", e);
            throw new RuntimeException("Could not parse public key", e);
        }
    }
}