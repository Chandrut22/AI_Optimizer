package com.seooptimizer.backend.service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.seooptimizer.backend.exception.TokenRefreshException;
import com.seooptimizer.backend.model.RefreshToken;
import com.seooptimizer.backend.model.User;
import com.seooptimizer.backend.repository.RefreshTokenRepository;
import com.seooptimizer.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;

    @Value("${jwt.refresh-token-expiration-ms}")
    private Long refreshTokenDurationMs;

    /**
     * Create or update refresh token for a user.
     */
    public RefreshToken createRefreshToken(String email) {
        User user = getUserByEmail(email);

        RefreshToken token = refreshTokenRepository.findByUser(user)
                .orElse(new RefreshToken());

        token.setUser(user);
        token.setToken(UUID.randomUUID().toString());
        token.setExpiryDate(getExpiryDateFromNow());

        return refreshTokenRepository.save(token);
    }

    /**
     * Rotate and return a new refresh token after deleting the old one.
     */
    public String rotateRefreshToken(String email) {
        User user = getUserByEmail(email);

        refreshTokenRepository.findByUser(user)
                .ifPresent(refreshTokenRepository::delete);

        String newToken = UUID.randomUUID().toString();

        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(newToken)
                .expiryDate(LocalDateTime.now().plusDays(7)) // hardcoded for 7 days
                .build();

        refreshTokenRepository.save(refreshToken);
        return newToken;
    }

    /**
     * Validate a refresh token (existence and expiration).
     */
    public boolean validate(String token) {
        return findByToken(token)
                .map(this::verifyExpiration)
                .isPresent();
    }

    /**
     * Find refresh token by token string.
     */
    public Optional<RefreshToken> findByToken(String token) {
        return refreshTokenRepository.findByToken(token);
    }

    /**
     * Ensure token has not expired. If expired, delete it and throw exception.
     */
    public RefreshToken verifyExpiration(RefreshToken token) {
        if (token.getExpiryDate().isBefore(LocalDateTime.now(ZoneId.systemDefault()))) {
            refreshTokenRepository.delete(token);
            throw new TokenRefreshException(token.getToken(), "Refresh token expired. Please login again.");
        }
        return token;
    }

    /**
     * Save new refresh token for a user.
     */
    public void saveToken(String email, String tokenStr) {
        User user = getUserByEmail(email);

        RefreshToken token = new RefreshToken();
        token.setUser(user);
        token.setToken(tokenStr);
        token.setExpiryDate(getExpiryDateFromNow());

        refreshTokenRepository.save(token);
    }

    /**
     * Delete refresh token by token value.
     */
    @Transactional
    public void deleteByToken(String token) {
        refreshTokenRepository.findByToken(token)
                .ifPresent(refreshTokenRepository::delete);
    }

    /**
     * Delete refresh token by user ID.
     */
    @Transactional
    public void deleteByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
        refreshTokenRepository.deleteByUser(user);
    }

    /**
     * Utility: Get user by email or throw.
     */
    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
    }

    /**
     * Utility: Get token expiration date from current time.
     */
    private LocalDateTime getExpiryDateFromNow() {
        return LocalDateTime.ofInstant(
                Instant.now().plusMillis(refreshTokenDurationMs),
                ZoneId.systemDefault()
        );
    }
}
