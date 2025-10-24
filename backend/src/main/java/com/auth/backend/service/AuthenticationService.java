package com.auth.backend.service;

// import org.springframework.boot.autoconfigure.couchbase.CouchbaseProperties;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.security.authentication.AuthenticationManager;
// import org.springframework.security.core.Authentication;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import com.auth.backend.dto.AuthenticationRequest;
import com.auth.backend.dto.AuthenticationResponse;
import com.auth.backend.dto.RegisterRequest;
import com.auth.backend.enums.Role;
import com.auth.backend.model.User;
import com.auth.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthenticationService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthenticationResponse register(RegisterRequest request) {
        
        // In AuthenticationService.java register method
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            // Using IllegalArgumentException is fine, or create a custom exception
            throw new IllegalArgumentException("Email already in use: " + request.getEmail());
        }

        var user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword())) // Encode password
                .role(Role.USER) // Default to USER if not specified
                // `createdAt` will be set by @PrePersist
                .build();
        
        userRepository.save(user);

        var jwtToken = jwtService.generateToken(user);
        var refreshToken = jwtService.generateRefreshToken(user);

        return AuthenticationResponse.builder()
                .accessToken(jwtToken)
                .refreshToken(refreshToken)
                .build();
    }


    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        // Authenticate the user using Spring Security's AuthenticationManager
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        ); // If authentication fails, an exception is thrown

        // If authentication succeeds, find the user (we know they exist)
        var user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("User not found after authentication")); // Should not happen

        // Generate JWT and Refresh tokens
        var jwtToken = jwtService.generateToken(user);
        var refreshToken = jwtService.generateRefreshToken(user);

        // Return the tokens
        return AuthenticationResponse.builder()
                .accessToken(jwtToken)
                .refreshToken(refreshToken)
                .build();
    }
}
