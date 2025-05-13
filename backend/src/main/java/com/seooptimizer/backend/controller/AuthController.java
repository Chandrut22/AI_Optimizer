package com.seooptimizer.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.seooptimizer.backend.dto.JwtResponse;
import com.seooptimizer.backend.dto.LoginRequest;
import com.seooptimizer.backend.dto.RegisterRequest;
import com.seooptimizer.backend.model.User;
import com.seooptimizer.backend.repository.UserRepository;
import com.seooptimizer.backend.security.JwtUtil;


@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.seooptimizer.backend.security.CustomerUserDetailsService userDetailsService;

    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

public boolean isStrongPassword(String password) {
    // Regex to check password strength
    String passwordRegex = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$";
    return password != null && password.matches(passwordRegex);
}

public boolean isValidEmail(String email) {
    // Regex to validate email
    String emailRegex = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,6}$";
    return email != null && email.matches(emailRegex);
}

@PostMapping("/register")
public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
    if (!isValidEmail(request.getEmail())) {
        return ResponseEntity.badRequest().body("Invalid email format");
    }

    if (!isStrongPassword(request.getPassword())) {
        return ResponseEntity.badRequest().body("Password must be at least 8 characters long, contain an uppercase letter, a lowercase letter, a digit, and a special character");
    }

    if (userRepository.existsByEmail(request.getEmail())) {
        return ResponseEntity.badRequest().body("Email already exists");
    }

    User user = User.builder()
        .name(request.getName())
        .email(request.getEmail())
        .password(passwordEncoder.encode(request.getPassword()))
        .role("USER")
        .build();

    userRepository.save(user);
    return ResponseEntity.ok("User registered successfully");
}
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        final UserDetails userDetails = userDetailsService.loadUserByUsername(request.getEmail());
        final String jwt = jwtUtil.generateToken(userDetails.getUsername()); // Fix here

        return ResponseEntity.ok(new JwtResponse(jwt));
    }
}
