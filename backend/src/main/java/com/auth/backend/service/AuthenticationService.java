package com.auth.backend.service;

import java.time.Duration;
import java.time.LocalDateTime;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.auth.backend.dto.AuthenticationRequest;
import com.auth.backend.dto.AuthenticationResponse;
import com.auth.backend.dto.RegisterRequest;
import com.auth.backend.enums.AccountTier;
import com.auth.backend.enums.AuthProvider;
import com.auth.backend.enums.Role;
import com.auth.backend.model.User;
import com.auth.backend.repository.UserRepository;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import com.auth.backend.dto.AccessTokenResponse;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private static final Logger log = LoggerFactory.getLogger(AuthenticationService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;
    private final CookieService cookieService; // ✅ Injected CookieService

    @Value("${application.security.jwt.expiration}")
    private long jwtExpirationMs;
    @Value("${application.security.jwt.refresh-token.expiration}")
    private long refreshExpirationMs;

    public void register(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already in use: " + request.getEmail());
        }

        String verificationCode = emailService.generateVerificationCode();

        var user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .accountTier(AccountTier.FREE)
                .hasSelectedTier(false)
                .authProvider(AuthProvider.LOCAL)
                .enabled(false)
                .verificationCode(verificationCode)
                .codeExpiration(LocalDateTime.now().plusMinutes(15))
                .build();
        
        userRepository.save(user);
        emailService.sendVerificationEmail(user.getName(), user.getEmail(), verificationCode);
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request, HttpServletResponse response) {
        var user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("User not found."));

        if (!user.isEnabled()) {
            log.warn("Authentication failed for user '{}': Account is not verified.", request.getEmail());
            throw new IllegalStateException("Account is not verified. Please check your email for a verification code.");
        }

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        var jwtToken = jwtService.generateToken(user);
        var refreshToken = jwtService.generateRefreshToken(user);

        // ✅ Use CookieService
        cookieService.addTokenCookie("access_token", jwtToken, Duration.ofMillis(jwtExpirationMs), response);
        cookieService.addTokenCookie("refresh_token", refreshToken, Duration.ofMillis(refreshExpirationMs), response);

        return AuthenticationResponse.builder()
                .hasSelectedTier(user.isHasSelectedTier())
                .build();
    }

    public void verifyAccount(String email, String code) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        if (user.isEnabled()) {
            throw new IllegalStateException("Account is already verified.");
        }
        validateCode(user, code);
        user.setEnabled(true);
        user.setVerificationCode(null);
        user.setCodeExpiration(null);
        userRepository.save(user);
    }

    public void verifyResetCode(String email, String code) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
        validateCode(user, code);
    }

    private void validateCode(User user, String code) {
        if (user.getVerificationCode() == null || !user.getVerificationCode().equals(code)) {
            throw new IllegalArgumentException("Invalid verification code.");
        }
        if (user.getCodeExpiration().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Verification code has expired.");
        }
    }

    public void resendVerificationCode(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        if (user.isEnabled()) {
            throw new IllegalStateException("User already verified.");
        }

        String code = emailService.generateVerificationCode();
        user.setVerificationCode(code);
        user.setCodeExpiration(LocalDateTime.now().plusMinutes(15));
        userRepository.save(user);

        emailService.sendVerificationEmail(user.getName(), user.getEmail(), code);
    }

    public void forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        String code = emailService.generateVerificationCode();
        user.setVerificationCode(code);
        user.setCodeExpiration(LocalDateTime.now().plusMinutes(15));
        userRepository.save(user);

        emailService.sendPasswordResetEmail(user.getName(), user.getEmail(), code);
    }

    public void resetPassword(String email, String code, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        validateCode(user, code);

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setVerificationCode(null);
        user.setCodeExpiration(null);
        userRepository.save(user);
    }

    public void refreshToken(String refreshToken, HttpServletResponse response) {
        final String userEmail = jwtService.extractUsername(refreshToken);

        if (userEmail != null) {
            var user = this.userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found for refresh token"));

            if (jwtService.isTokenValid(refreshToken, user)) {
                var newAccessToken = jwtService.generateToken(user);
                // ✅ Use CookieService
                cookieService.addTokenCookie("access_token", newAccessToken, Duration.ofMillis(jwtExpirationMs), response);
                log.info("Access token refreshed for user: {}", userEmail);
            } else {
                 throw new IllegalArgumentException("Refresh token is invalid or expired");
            }
        } else {
            throw new IllegalArgumentException("Cannot extract user email from refresh token");
        }
    }

    public AccessTokenResponse getAccessTokenForAuthenticatedUser(User user) {
        String accessToken = jwtService.generateToken(user);
        
        return AccessTokenResponse.builder()
                .accessToken(accessToken)
                .build();
    }

    public void logout(HttpServletResponse response) {
        log.info("Logging out user by clearing cookies.");
        // ✅ Use CookieService
        cookieService.clearTokenCookie("access_token", response);
        cookieService.clearTokenCookie("refresh_token", response);
    }
}