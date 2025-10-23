package com.auth.backend.controller; // Assuming this is correct package

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping; // Import PostMapping
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.slf4j.Logger; // Import Logger
import org.slf4j.LoggerFactory; // Import LoggerFactory
import org.springframework.http.ResponseEntity;

import com.auth.backend.service.AuthenticationService; // Assuming this is correct package
import com.auth.backend.dto.RegisterRequest;           // Assuming this is correct package
import com.auth.backend.dto.AuthenticationResponse;     // Assuming this is correct package
import com.auth.backend.dto.AuthenticationRequest;      // Assuming this is correct package

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthenticationController {

    // Add a logger instance
    private static final Logger log = LoggerFactory.getLogger(AuthenticationController.class);

    private final AuthenticationService authenticationService;

    @PostMapping("/register")
    public ResponseEntity<AuthenticationResponse> register(
            @RequestBody RegisterRequest request
    ) {
        // Add this log line
        log.info("Register endpoint hit with email: {}", request.getEmail()); 
        try {
            AuthenticationResponse response = authenticationService.register(request);
            log.info("Registration successful for email: {}", request.getEmail());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
             log.error("Registration failed for email: {}", request.getEmail(), e);
             // Re-throw or return an error response
             // For now, let's return a generic error
             return ResponseEntity.status(500).body(null); // Or a more specific error DTO
        }
    }

    @PostMapping("/authenticate")
    public ResponseEntity<AuthenticationResponse> authenticate(
            @RequestBody AuthenticationRequest request
    ) {
        return ResponseEntity.ok(authenticationService.authenticate(request));
    }
}