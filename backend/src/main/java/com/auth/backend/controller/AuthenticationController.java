package com.auth.backend.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.WebUtils;

import com.auth.backend.dto.AuthenticationRequest;
import com.auth.backend.dto.ForgotPasswordRequest;
import com.auth.backend.dto.RegisterRequest;
import com.auth.backend.dto.ResetPasswordRequest;
import com.auth.backend.dto.VerificationRequest;
import com.auth.backend.service.AuthenticationService;

import io.jsonwebtoken.JwtException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthenticationController {

    private static final Logger log = LoggerFactory.getLogger(AuthenticationController.class);
    private final AuthenticationService authenticationService;

    @PostMapping("/register")
    public ResponseEntity<String> register(
            @RequestBody RegisterRequest request
            // HttpServletResponse is no longer needed here
    ) {
        log.info("Register endpoint hit with email: {}", request.getEmail());
        // Pass null for response, as login doesn't happen on register anymore
        authenticationService.register(request, null); 
        log.info("Registration successful for email: {}", request.getEmail());
        // Return the new success message
        return ResponseEntity.ok("Registration successful. Please check your email for verification code.");
    }

    @PostMapping("/authenticate")
    public ResponseEntity<String> authenticate(
            @RequestBody AuthenticationRequest request,
            HttpServletResponse response
    ) {
        log.info("Authenticate endpoint hit for email: {}", request.getEmail());
        authenticationService.authenticate(request, response); // Pass response to service to set cookies
        log.info("Authentication successful for email: {}", request.getEmail());
        return ResponseEntity.ok("Authentication successful");
    }

    // --- NEW: ACCOUNT VERIFICATION ENDPOINT ---
    @PostMapping("/verify")
    public ResponseEntity<String> verifyAccount(@RequestBody VerificationRequest request) {
        log.info("Verify account endpoint hit for email: {}", request.getEmail());
        authenticationService.verifyAccount(request.getEmail(), request.getCode());
        return ResponseEntity.ok("Account verified successfully. You can now log in.");
    }

    // --- NEW: FORGOT PASSWORD ENDPOINT ---
    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        log.info("Forgot password endpoint hit for email: {}", request.getEmail());
        // This will find the user and send the reset code email
        authenticationService.forgotPassword(request.getEmail());
        return ResponseEntity.ok("Password reset code sent to your email.");
    }

    // --- NEW: RESET PASSWORD ENDPOINT ---
    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody ResetPasswordRequest request) {
        log.info("Reset password endpoint hit for email: {}", request.getEmail());
        // This will verify the code and update the password
        authenticationService.resetPassword(request.getEmail(), request.getCode(), request.getNewPassword());
        return ResponseEntity.ok("Password reset successfully. You can now log in.");
    }

    // --- REFRESH TOKEN ENDPOINT ---
    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshToken(
            HttpServletRequest request, // To read cookies
            HttpServletResponse response // To set new cookie
    ) {
        log.info("Refresh token endpoint hit");
        try {
            // Extract refresh token from cookie
            Cookie refreshTokenCookie = WebUtils.getCookie(request, "refresh_token");
            if (refreshTokenCookie == null) {
                log.warn("Refresh token cookie not found.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Refresh token cookie missing");
            }
            String refreshToken = refreshTokenCookie.getValue();

            // Call service to validate and generate new token
            authenticationService.refreshToken(refreshToken, response);

            log.info("Access token refreshed successfully.");
            return ResponseEntity.ok("Access token refreshed");

        } catch (Exception e) {
            log.error("Error refreshing token: {}", e.getMessage());
            // Return specific error based on exception type if desired
            // The JwtException handler below will catch most of these
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired refresh token: " + e.getMessage());
        }
    }

    // --- UPDATED EXCEPTION HANDLERS ---

    /**
     * Handles exceptions related to business logic failures (e.g., bad codes, existing email).
     */
    @ExceptionHandler({IllegalArgumentException.class, IllegalStateException.class})
    public ResponseEntity<String> handleBusinessLogicExceptions(RuntimeException ex) {
        log.error("Business logic error: {}", ex.getMessage());

        if (ex.getMessage().contains("Email already in use")) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(ex.getMessage());
        }
        if (ex.getMessage().contains("Account is not verified")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ex.getMessage());
        }
        // For invalid codes, expired codes, already verified, etc.
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
    }

    /**
     * Handles authentication failures (bad password, user disabled, user not found).
     */
    @ExceptionHandler({AuthenticationException.class, UsernameNotFoundException.class})
    public ResponseEntity<String> handleAuthenticationException(Exception ex) {
        log.error("Authentication process failed: {}", ex.getMessage());
        
        // This checks for the "Account is not verified" exception thrown during login
        if (ex.getMessage().contains("Account is not verified")) {
             return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ex.getMessage());
        }
        
        // Handle "User not found" from forgotPassword
        if (ex instanceof UsernameNotFoundException) {
            // We don't want to confirm/deny if an email exists in the system
            log.warn("Non-existent email attempted forgot-password: {}", ex.getMessage());
            return ResponseEntity.ok("Password reset code sent to your email."); // Send a generic success response
        }

        // Default for bad credentials
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Authentication failed: Bad credentials");
    }

    /**
     * Handles JWT-specific errors during refresh token validation.
     */
    @ExceptionHandler(JwtException.class)
    public ResponseEntity<String> handleJwtException(JwtException ex) {
        log.error("JWT validation error during refresh: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Refresh token validation failed: " + ex.getMessage());
    }
}