package com.auth.backend.controller; // Assuming this is correct package

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping; // Import PostMapping
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.auth.backend.service.AuthenticationService; // Assuming this is correct package
import com.auth.backend.dto.RegisterRequest;           // Assuming this is correct package
import com.auth.backend.dto.AuthenticationResponse;     // Assuming this is correct package
import com.auth.backend.dto.AuthenticationRequest;      // Assuming this is correct package

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/auth") 
@RequiredArgsConstructor
public class AuthenticationController {

    private final AuthenticationService authenticationService;

    @PostMapping("/register") 
    public ResponseEntity<AuthenticationResponse> register(
            @RequestBody RegisterRequest request
    ) {
        // Consider adding input validation here (e.g., @Valid)
        return ResponseEntity.ok(authenticationService.register(request));
    }

    @PostMapping("/authenticate")
    public ResponseEntity<AuthenticationResponse> authenticate(
            @RequestBody AuthenticationRequest request
    ) {
        return ResponseEntity.ok(authenticationService.authenticate(request));
    }
}