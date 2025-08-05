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

    // ✅ Used in /login and other flows
    public RefreshToken createRefreshToken(String email) {
        User user = getUserByEmail(email);

        RefreshToken token = refreshTokenRepository.findByUser(user)
                .orElse(new RefreshToken());

        token.setUser(user);
        token.setToken(UUID.randomUUID().toString());
        token.setExpiryDate(getExpiryDateFromNow());

        return refreshTokenRepository.save(token);
    }

    // ✅ Used in /refresh-token
    public String rotateRefreshToken(String email) {
        User user = getUserByEmail(email);

        // delete existing if present
        refreshTokenRepository.findByUser(user)
                .ifPresent(refreshTokenRepository::delete);

        String newToken = UUID.randomUUID().toString();

        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(newToken)
                .expiryDate(getExpiryDateFromNow())
                .build();

        refreshTokenRepository.save(refreshToken);
        return newToken;
    }

    // ✅ Used in /refresh-token
    public boolean validate(String token) {
        return findByToken(token)
                .map(this::verifyExpiration)
                .isPresent();
    }

    // ✅ Called from AuthController
    public Optional<RefreshToken> findByToken(String token) {
        return refreshTokenRepository.findByToken(token);
    }

    public RefreshToken verifyExpiration(RefreshToken token) {
        Instant now = Instant.now();
        Instant tokenExpiry = token.getExpiryDate()
                                   .atZone(ZoneId.systemDefault())
                                   .toInstant();

        if (now.isAfter(tokenExpiry)) {
            refreshTokenRepository.delete(token);
            throw new TokenRefreshException(token.getToken(), "Refresh token expired. Please login again.");
        }
        return token;
    }

    // ✅ Used in /refresh-token
    public String saveToken(String email) {
        User user = getUserByEmail(email);

        // Delete existing token if present
        refreshTokenRepository.findByUser(user)
                .ifPresent(refreshTokenRepository::delete);

        String tokenStr = UUID.randomUUID().toString();

        RefreshToken token = new RefreshToken();
        token.setUser(user);
        token.setToken(tokenStr);
        token.setExpiryDate(getExpiryDateFromNow());

        refreshTokenRepository.save(token);

        return tokenStr;
    }


    @Transactional
    public void deleteByToken(String token) {
        refreshTokenRepository.findByToken(token)
                .ifPresent(refreshTokenRepository::delete);
    }

    @Transactional
    public void deleteByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
        refreshTokenRepository.deleteByUser(user);
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
    }

    private LocalDateTime getExpiryDateFromNow() {
        return LocalDateTime.ofInstant(
                Instant.now().plusMillis(refreshTokenDurationMs),
                ZoneId.systemDefault()
        );
    }
}
