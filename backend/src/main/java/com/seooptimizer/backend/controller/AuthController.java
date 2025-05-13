package com.seooptimizer.backend.controller;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.seooptimizer.backend.dto.ApiResponse;
import com.seooptimizer.backend.dto.JwtResponse;
import com.seooptimizer.backend.dto.LoginRequest;
import com.seooptimizer.backend.dto.RegisterRequest;
import com.seooptimizer.backend.model.User;
import com.seooptimizer.backend.repository.UserRepository;
import com.seooptimizer.backend.security.CustomerUserDetailsService;
import com.seooptimizer.backend.security.JwtUtil;
import com.seooptimizer.backend.service.EmailService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CustomerUserDetailsService userDetailsService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private EmailService emailService;

    public boolean isStrongPassword(String password) {
        String passwordRegex = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$";
        return password != null && password.matches(passwordRegex);
    }

    public boolean isValidEmail(String email) {
        String emailRegex = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,6}$";
        return email != null && email.matches(emailRegex);
    }

    private String generateVerificationCode() {
        return String.valueOf((int)(Math.random() * 900000) + 100000);
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        if (!isValidEmail(request.getEmail())) {
            return new ResponseEntity<>(new ApiResponse(400, "Invalid email format"), HttpStatus.BAD_REQUEST);
        }

        if (!isStrongPassword(request.getPassword())) {
            return new ResponseEntity<>(new ApiResponse(400,
                    "Password must be at least 8 characters long, contain an uppercase letter, a lowercase letter, a digit, and a special character"),
                    HttpStatus.BAD_REQUEST);
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            return new ResponseEntity<>(new ApiResponse(400, "Email already exists"), HttpStatus.BAD_REQUEST);
        }

        String code = generateVerificationCode();

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role("USER")
                .enabled(false)
                .verificationCode(code)
                .build();

        userRepository.save(user);

        try {
            emailService.sendVerificationEmail(request.getEmail(), request.getName(), code);
        } catch (Exception e) {
            return new ResponseEntity<>(new ApiResponse(500, "Failed to send verification email"),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return new ResponseEntity<>(new ApiResponse(200,
                "Registration successful. Please check your email for verification code."),
                HttpStatus.OK);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        Optional<User> optionalUser = userRepository.findByEmail(request.getEmail());
        if (optionalUser.isEmpty()) {
            return new ResponseEntity<>(new ApiResponse(404, "User not found"), HttpStatus.NOT_FOUND);
        }

        User user = optionalUser.get();

        if (!user.isEnabled()) {
            return new ResponseEntity<>(new ApiResponse(403, "Please verify your email first."),
                    HttpStatus.FORBIDDEN);
        }

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        } catch (Exception e) {
            return new ResponseEntity<>(new ApiResponse(401, "Invalid email or password"),
                    HttpStatus.UNAUTHORIZED);
        }

        final UserDetails userDetails = userDetailsService.loadUserByUsername(request.getEmail());
        final String jwt = jwtUtil.generateToken(userDetails.getUsername());

        return ResponseEntity.ok(new JwtResponse(jwt));
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyCode(@RequestParam String email, @RequestParam String code) {
        Optional<User> optionalUser = userRepository.findByEmail(email);
        if (optionalUser.isEmpty()) {
            return new ResponseEntity<>(new ApiResponse(400, "Invalid email"), HttpStatus.BAD_REQUEST);
        }

        User user = optionalUser.get();
        if (user.getVerificationCode() != null && user.getVerificationCode().equals(code)) {
            user.setEnabled(true);
            user.setVerificationCode(null);
            userRepository.save(user);
            return new ResponseEntity<>(new ApiResponse(200, "Email verified. You can now login."),
                    HttpStatus.OK);
        } else {
            return new ResponseEntity<>(new ApiResponse(400, "Invalid verification code"),
                    HttpStatus.BAD_REQUEST);
        }
    }
}
