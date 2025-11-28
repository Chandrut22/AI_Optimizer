package com.auth.backend.service;

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

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;

@Service
public class JwtService {

    private static final Logger log = LoggerFactory.getLogger(JwtService.class);

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
                .signWith(getSignInKey(), SignatureAlgorithm.RS256)
                .compact();
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        try {
            final String username = extractUsername(token);
            return (username.equals(userDetails.getUsername())) && !isTokenExpired(token);
        } catch (Exception e) {
            log.warn("JWT validation error: {}", e.getMessage());
            return false;
        }
    }

    private boolean isTokenExpired(String token) {
        try {
            return extractExpiration(token).before(new Date());
        } catch (Exception e) {
            log.warn("JWT expired or invalid: {}", e.getMessage());
            return true; 
        }
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private Claims extractAllClaims(String token) {
        return Jwts
                .parserBuilder()
                .setSigningKey(getValidationKey()) 
                .build()
                .parseClaimsJws(token)
                .getBody();
    }


    /**
     * Gets the PrivateKey used for SIGNING tokens.
     */
    private Key getSignInKey() {
        if (signInKey == null) {
            signInKey = parsePrivateKey(privateKeyPem);
        }
        return signInKey;
    }

    /**
     * Gets the PublicKey used for VALIDATING tokens.
     */
    private Key getValidationKey() {
        if (validationKey == null) {
            validationKey = parsePublicKey(publicKeyPem);
        }
        return validationKey;
    }

    /**
     * Parses a PEM-formatted, single-line-with-\n string into a PrivateKey object.
     */
    private PrivateKey parsePrivateKey(String pemKey) {
        try {
            String formattedKey = pemKey.replace("\\n", "\n");

            String privateKeyContent = formattedKey
                    .replace("-----BEGIN PRIVATE KEY-----", "")
                    .replace("-----END PRIVATE KEY-----", "")
                    .replace("-----BEGIN RSA PRIVATE KEY-----", "") 
                    .replace("-----END RSA PRIVATE KEY-----", "");

            byte[] keyBytes = Base64.getMimeDecoder().decode(privateKeyContent);

            PKCS8EncodedKeySpec keySpec = new PKCS8EncodedKeySpec(keyBytes);
            KeyFactory keyFactory = KeyFactory.getInstance("RSA");
            return keyFactory.generatePrivate(keySpec);

        } catch (NoSuchAlgorithmException | InvalidKeySpecException | IllegalArgumentException e) {
            log.error("Could not parse RSA private key. Check formatting.", e);
            throw new RuntimeException("Could not parse private key", e);
        }
    }

    /**
     * Parses a PEM-formatted, single-line-with-\n string into a PublicKey object.
     */
    private PublicKey parsePublicKey(String pemKey) {
        try {
            String formattedKey = pemKey.replace("\\n", "\n");
            
            String publicKeyContent = formattedKey
                    .replace("-----BEGIN PUBLIC KEY-----", "")
                    .replace("-----END PUBLIC KEY-----", "");

            byte[] keyBytes = Base64.getMimeDecoder().decode(publicKeyContent);

            X509EncodedKeySpec keySpec = new X509EncodedKeySpec(keyBytes);
            KeyFactory keyFactory = KeyFactory.getInstance("RSA");
            return keyFactory.generatePublic(keySpec);

        } catch (NoSuchAlgorithmException | InvalidKeySpecException | IllegalArgumentException e) {
            log.error("Could not parse RSA public key. Check formatting.", e);
            throw new RuntimeException("Could not parse public key", e);
        }
    }
}
