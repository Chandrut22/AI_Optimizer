package com.auth.backend.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.WebUtils;

import com.auth.backend.dto.AccessTokenResponse;
import com.auth.backend.dto.AuthenticationRequest;
import com.auth.backend.dto.AuthenticationResponse; 
import com.auth.backend.dto.ForgotPasswordRequest;
import com.auth.backend.dto.RegisterRequest;
import com.auth.backend.dto.ResetPasswordRequest;
import com.auth.backend.dto.VerificationRequest;
import com.auth.backend.model.User;
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
    ) {
        log.info("Register endpoint hit with email: {}", request.getEmail());
        authenticationService.register(request); 
        log.info("Registration successful for email: {}", request.getEmail());
        return ResponseEntity.ok("Registration successful. Please check your email for verification code.");
    }

    @PostMapping("/authenticate")
    public ResponseEntity<AuthenticationResponse> authenticate( 
            @RequestBody AuthenticationRequest request,
            HttpServletResponse response
    ) {
        log.info("Authenticate endpoint hit for email: {}", request.getEmail());
        
        AuthenticationResponse authResponse = authenticationService.authenticate(request, response);
        
        log.info("Authentication successful for email: {}", request.getEmail());
        
        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/verify")
    public ResponseEntity<String> verifyAccount(@RequestBody VerificationRequest request) {
        log.info("Verify account endpoint hit for email: {}", request.getEmail());
        authenticationService.verifyAccount(request.getEmail(), request.getCode());
        return ResponseEntity.ok("Account verified successfully. You can now log in.");
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<String> resendVerification(@RequestParam String email) {
        log.info("Resend verification code endpoint hit for email: {}", email);
        authenticationService.resendVerificationCode(email);
        return ResponseEntity.ok("Verification code resent successfully.");
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        log.info("Forgot password endpoint hit for email: {}", request.getEmail());
        authenticationService.forgotPassword(request.getEmail());
        return ResponseEntity.ok("Password reset code sent to your email.");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody ResetPasswordRequest request) {
        log.info("Reset password endpoint hit for email: {}", request.getEmail());
        authenticationService.resetPassword(request.getEmail(), request.getCode(), request.getNewPassword());
        return ResponseEntity.ok("Password reset successfully. You can now log in.");
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshToken(
            HttpServletRequest request, 
            HttpServletResponse response 
    ) {
        log.info("Refresh token endpoint hit");
        try {
            Cookie refreshTokenCookie = WebUtils.getCookie(request, "refresh_token");
            if (refreshTokenCookie == null) {
                log.warn("Refresh token cookie not found.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Refresh token cookie missing");
            }
            String refreshToken = refreshTokenCookie.getValue();

            authenticationService.refreshToken(refreshToken, response);

            log.info("Access token refreshed successfully.");
            return ResponseEntity.ok("Access token refreshed");

        } catch (Exception e) {
            log.error("Error refreshing token: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired refresh token: " + e.getMessage());
        }
    }

    @PostMapping("/verify-reset-code")
    public ResponseEntity<String> verifyResetCode(@RequestBody VerificationRequest request) {
        log.info("Verify reset code endpoint hit for email: {}", request.getEmail());
        authenticationService.verifyResetCode(request.getEmail(), request.getCode());
        return ResponseEntity.ok("Code verified successfully.");
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpServletResponse response) {
        log.info("Logout endpoint hit");
        authenticationService.logout(response);
        return ResponseEntity.ok("Logged out successfully.");
    }


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
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
    }

    /**
     * Handles authentication failures (bad password, user disabled, user not found).
     */
    @ExceptionHandler({AuthenticationException.class, UsernameNotFoundException.class})
    public ResponseEntity<String> handleAuthenticationException(Exception ex) {
        log.error("Authentication process failed: {}", ex.getMessage());
        
        if (ex.getMessage().contains("Account is not verified")) {
             return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ex.getMessage());
        }
        
        if (ex instanceof UsernameNotFoundException) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found.");
        }

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

    @GetMapping("/token")
    public ResponseEntity<AccessTokenResponse> getAccessToken(
            @AuthenticationPrincipal User user // Spring Security injects the current user here
    ) {
        log.info("Request to get raw access token for user: {}", user.getEmail());
        return ResponseEntity.ok(authenticationService.getAccessTokenForAuthenticatedUser(user));
    }
}