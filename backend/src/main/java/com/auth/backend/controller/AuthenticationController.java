package com.auth.backend.controller; 

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.WebUtils;


import com.auth.backend.dto.AuthenticationRequest;
import com.auth.backend.dto.RegisterRequest;
import com.auth.backend.service.AuthenticationService;

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
    // Inject HttpServletResponse, change return type
    public ResponseEntity<String> register(
            @RequestBody RegisterRequest request,
            HttpServletResponse response
    ) {
        log.info("Register endpoint hit with email: {}", request.getEmail());
        authenticationService.register(request, response); // Pass response to service
        log.info("Registration successful for email: {}", request.getEmail());
        // Return a simple success message or user info (without tokens)
        return ResponseEntity.ok("Registration successful");
    }

   @PostMapping("/authenticate")
    // Inject HttpServletResponse, change return type
    public ResponseEntity<String> authenticate(
            @RequestBody AuthenticationRequest request,
            HttpServletResponse response
    ) {
        log.info("Authenticate endpoint hit for email: {}", request.getEmail());
        authenticationService.authenticate(request, response); // Pass response to service
        log.info("Authentication successful for email: {}", request.getEmail());
        // Return a simple success message or user info (without tokens)
        return ResponseEntity.ok("Authentication successful");
    }

// --- NEW REFRESH TOKEN ENDPOINT ---
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
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired refresh token");
        }
    }

    // --- Exception Handler ---
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleRegistrationException(IllegalArgumentException ex) {
        // Log the specific error message from the service
        log.error("Registration failed: {}", ex.getMessage());
        // Return a 409 Conflict status with the error message
        return ResponseEntity.status(HttpStatus.CONFLICT).body(ex.getMessage());
    }
}