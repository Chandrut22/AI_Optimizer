package com.auth.backend.controller; 

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping; 
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;

import com.auth.backend.service.AuthenticationService; 
import com.auth.backend.dto.RegisterRequest;          
import com.auth.backend.dto.AuthenticationResponse;    
import com.auth.backend.dto.AuthenticationRequest;     
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthenticationController {

    private static final Logger log = LoggerFactory.getLogger(AuthenticationController.class);
    private final AuthenticationService authenticationService;

    @PostMapping("/register")
    public ResponseEntity<?> register( // Return type changed slightly
            @RequestBody RegisterRequest request
    ) {
        log.info("Register endpoint hit with email: {}", request.getEmail());
        // No try-catch needed here anymore if using @ExceptionHandler
        AuthenticationResponse response = authenticationService.register(request);
        log.info("Registration successful for email: {}", request.getEmail());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/authenticate")
    public ResponseEntity<AuthenticationResponse> authenticate(
            @RequestBody AuthenticationRequest request
    ) {
         log.info("Authenticate endpoint hit for email: {}", request.getEmail());
        // You might want similar logging/error handling here
        return ResponseEntity.ok(authenticationService.authenticate(request));
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