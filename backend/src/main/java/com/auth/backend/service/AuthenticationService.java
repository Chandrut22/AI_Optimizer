package com.auth.backend.service;

import java.time.Duration;
import java.time.LocalDateTime;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseCookie.ResponseCookieBuilder;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.auth.backend.dto.AuthenticationRequest;
import com.auth.backend.dto.RegisterRequest;
import com.auth.backend.enums.AuthProvider;
import com.auth.backend.enums.Role;
import com.auth.backend.model.User;
import com.auth.backend.repository.UserRepository;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private static final Logger log = LoggerFactory.getLogger(AuthenticationService.class);

    // Dependencies
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService; // For sending verification/reset codes

    // Cookie Configuration
    @Value("${application.security.cookie.domain}")
    private String cookieDomain;
    @Value("${application.security.cookie.secure}")
    private boolean cookieSecure;
    @Value("${application.security.cookie.same-site}")
    private String cookieSameSite;
    @Value("${application.security.jwt.expiration}")
    private long jwtExpirationMs;
    @Value("${application.security.jwt.refresh-token.expiration}")
    private long refreshExpirationMs;

    /**
     * Registers a new LOCAL user, sets them as disabled, and sends a verification email.
     * Does NOT log the user in or set cookies.
     */
    public void register(RegisterRequest request, HttpServletResponse response) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already in use: " + request.getEmail());
        }

        String verificationCode = emailService.generateVerificationCode();

        var user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .authProvider(AuthProvider.LOCAL) // Mark as local account
                .enabled(false) // User is disabled until verified
                .verificationCode(verificationCode)
                .codeExpiration(LocalDateTime.now().plusMinutes(15)) // Code expires
                .build();
        
        userRepository.save(user);

        // Send verification email in a separate thread
        emailService.sendVerificationEmail(user.getName(), user.getEmail(), verificationCode);
    }

    /**
     * Authenticates a user with email/password.
     * Checks if the user is enabled before issuing cookies.
     */
    public void authenticate(AuthenticationRequest request, HttpServletResponse response) {
        // This will throw AuthenticationException if credentials are bad
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        // Credentials are valid, now get the user
        var user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("User not found after authentication")); // Should not happen

        // Check if the user has verified their email
        if (!user.isEnabled()) {
            log.warn("Authentication failed for user '{}': Account is not verified.", request.getEmail());
            // We throw this specific exception, which the controller handler can catch
            throw new IllegalStateException("Account is not verified. Please check your email for a verification code.");
        }

        // User is valid and enabled, proceed with login
        var jwtToken = jwtService.generateToken(user);
        var refreshToken = jwtService.generateRefreshToken(user);

        addTokenCookie("access_token", jwtToken, Duration.ofMillis(jwtExpirationMs), response);
        addTokenCookie("refresh_token", refreshToken, Duration.ofMillis(refreshExpirationMs), response);
    }

    /**
     * Verifies a new user's account using the email and code.
     */
    public void verifyAccount(String email, String code) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        if (user.isEnabled()) {
            throw new IllegalStateException("Account is already verified.");
        }

        if (user.getVerificationCode() == null || !user.getVerificationCode().equals(code)) {
            throw new IllegalArgumentException("Invalid verification code.");
        }

        if (user.getCodeExpiration().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Verification code has expired.");
        }

        // Verification successful
        user.setEnabled(true);
        user.setVerificationCode(null);
        user.setCodeExpiration(null);
        userRepository.save(user);
    }

    /**
     * Initiates the password reset process by sending a code via email.
     */
    public void forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        // Generate and send code
        String code = emailService.generateVerificationCode();
        user.setVerificationCode(code);
        user.setCodeExpiration(LocalDateTime.now().plusMinutes(15));
        userRepository.save(user);

        emailService.sendPasswordResetEmail(user.getName(), user.getEmail(), code);
    }

    /**
     * Resets the user's password after verifying the email and code.
     */
    public void resetPassword(String email, String code, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        // Use the same verification logic
        if (user.getVerificationCode() == null || !user.getVerificationCode().equals(code)) {
            throw new IllegalArgumentException("Invalid reset code.");
        }

        if (user.getCodeExpiration().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Reset code has expired.");
        }

        // Reset successful
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setVerificationCode(null);
        user.setCodeExpiration(null);
        userRepository.save(user);
    }

    /**
     * Refreshes the access token using a valid refresh token.
     */
    public void refreshToken(String refreshToken, HttpServletResponse response) {
        final String userEmail = jwtService.extractUsername(refreshToken);

        if (userEmail != null) {
            var user = this.userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found for refresh token"));

            if (jwtService.isTokenValid(refreshToken, user)) {
                var newAccessToken = jwtService.generateToken(user);
                addTokenCookie("access_token", newAccessToken, Duration.ofMillis(jwtExpirationMs), response);
                log.info("Access token refreshed for user: {}", userEmail);
                
                // Optional: Implement refresh token rotation
                // var newRefreshToken = jwtService.generateRefreshToken(user);
                // addTokenCookie("refresh_token", newRefreshToken, Duration.ofMillis(refreshExpirationMs), response);
            } else {
                 throw new IllegalArgumentException("Refresh token is invalid or expired");
            }
        } else {
            throw new IllegalArgumentException("Cannot extract user email from refresh token");
        }
    }


    /**
     * Logs the user out by clearing their access and refresh token cookies.
     */
    public void logout(HttpServletResponse response) {
        log.info("Logging out user by clearing cookies.");
        // Instruct the browser to delete the access_token
        clearTokenCookie("access_token", response);
        // Instruct the browser to delete the refresh_token
        clearTokenCookie("refresh_token", response);
    }

    /**
     * Helper method to create and add a cookie to the HttpServletResponse.
     * Omits the domain attribute if it's null or empty (for localhost/Render testing).
     */
    public void addTokenCookie(String cookieName, String token, Duration maxAge, HttpServletResponse response) {
        ResponseCookieBuilder cookieBuilder = ResponseCookie.from(cookieName, token)
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite(cookieSameSite)
                .path("/")
                .maxAge(maxAge);

        // Only add the domain attribute if it's not null or empty
        if (cookieDomain != null && !cookieDomain.isEmpty()) {
            cookieBuilder.domain(cookieDomain);
            log.debug("Setting cookie {} with domain: {}", cookieName, cookieDomain);
        } else {
            log.debug("Setting cookie {} without domain (defaulting to request domain).", cookieName);
        }
        
        response.addHeader(HttpHeaders.SET_COOKIE, cookieBuilder.build().toString());
    }

     /**
     * Helper method to clear a cookie by setting its maxAge to 0.
     * Must use the same secure, sameSite, path, and domain attributes as when setting the cookie.
     */
    private void clearTokenCookie(String cookieName, HttpServletResponse response) {
        ResponseCookieBuilder cookieBuilder = ResponseCookie.from(cookieName, "") // Set value to empty
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite(cookieSameSite)
                .path("/")
                .maxAge(0); // <-- Set Max-Age to 0 to expire immediately

        // Must match the domain attribute used when setting the cookie
        if (cookieDomain != null && !cookieDomain.isEmpty()) {
            cookieBuilder.domain(cookieDomain);
        }

        response.addHeader(HttpHeaders.SET_COOKIE, cookieBuilder.build().toString());
        log.debug("Cleared cookie: {}", cookieName);
    }
}
