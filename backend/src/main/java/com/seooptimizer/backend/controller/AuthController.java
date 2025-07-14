package com.seooptimizer.backend.controller;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.seooptimizer.backend.dto.ApiResponse;
import com.seooptimizer.backend.dto.JwtResponse;
import com.seooptimizer.backend.dto.LoginRequest;
import com.seooptimizer.backend.dto.RegisterRequest;
import com.seooptimizer.backend.enumtype.AuthProvider;
import com.seooptimizer.backend.enumtype.Role;
import com.seooptimizer.backend.exception.TokenRefreshException;
import com.seooptimizer.backend.model.RefreshToken;
import com.seooptimizer.backend.model.User;
import com.seooptimizer.backend.repository.UserRepository;
import com.seooptimizer.backend.security.CustomerUserDetailsService;
import com.seooptimizer.backend.security.JwtUtil;
import com.seooptimizer.backend.service.EmailService;
import com.seooptimizer.backend.service.RefreshTokenService;
import com.seooptimizer.backend.service.UserService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

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

    @Autowired
    private RefreshTokenService refreshTokenService;

    @Autowired
    private UserService userService;

    private boolean isStrongPassword(String password) {
        String passwordRegex = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$";
        return password != null && password.matches(passwordRegex);
    }

    private boolean isValidEmail(String email) {
        String emailRegex = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,6}$";
        return email != null && email.matches(emailRegex);
    }

    private String generateVerificationCode() {
        return String.valueOf((int) (Math.random() * 900000) + 100000);
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
                .role(Role.USER)
                .enabled(false)
                .provider(AuthProvider.LOCAL)
                .verificationCode(code)
                .build();

        userRepository.save(user);

        try {
            emailService.sendVerificationEmail("Email Verification", request.getEmail(), request.getName(), code);
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
        final String accessToken = jwtUtil.generateAccessToken(userDetails.getUsername());
        final RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getEmail());

        return ResponseEntity.ok(new JwtResponse(accessToken, refreshToken.getToken()));
    }
    // Only the relevant part inside @PostMapping("/refresh-token")

    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshToken(HttpServletRequest request) {
        String oldRefreshToken = jwtUtil.extractRefreshTokenFromCookie(request);

        if (oldRefreshToken == null || !refreshTokenService.validate(oldRefreshToken)) {
            throw new TokenRefreshException(oldRefreshToken, "Invalid or expired refresh token");
        }

        String email = jwtUtil.extractUsername(oldRefreshToken);

        // Create new tokens
        String newAccessToken = jwtUtil.generateAccessToken(email);
        String newRefreshToken = jwtUtil.rotateRefreshToken(email);

        refreshTokenService.deleteByToken(oldRefreshToken); // Optional cleanup
        refreshTokenService.saveToken(email, newRefreshToken); // You need this method in service

        return ResponseEntity.ok(new JwtResponse(newAccessToken, newRefreshToken));
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

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestParam String email) {
        Optional<User> optionalUser = userRepository.findByEmail(email);
        if (optionalUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ApiResponse(404, "User not found"));
        }

        User user = optionalUser.get();
        String resetCode = generateVerificationCode();
        user.setResetCode(resetCode);
        user.setResetCodeGeneratedAt(LocalDateTime.now());
        userRepository.save(user);

        try {
            emailService.sendVerificationEmail("Password Reset", user.getEmail(), user.getName(), resetCode);
        } catch (Exception e) {
            return new ResponseEntity<>(new ApiResponse(500, "Failed to send verification email"), HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return ResponseEntity.ok(new ApiResponse(200, "Password reset code sent to email"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestParam String email, @RequestParam String code, @RequestParam String newPassword) {
        Optional<User> optionalUser = userRepository.findByEmail(email);
        if (optionalUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ApiResponse(404, "User not found"));
        }

        User user = optionalUser.get();

        if (user.getResetCode() == null || !user.getResetCode().equals(code)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ApiResponse(400, "Invalid reset code"));
        }

        if (user.getResetCodeGeneratedAt() == null ||
            user.getResetCodeGeneratedAt().plusMinutes(15).isBefore(LocalDateTime.now())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse(400, "Reset code expired or invalid"));
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetCode(null);
        user.setResetCodeGeneratedAt(null);
        userRepository.save(user);

        return ResponseEntity.ok(new ApiResponse(200, "Password has been successfully reset"));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request, HttpServletResponse response) {
        String refreshToken = jwtUtil.extractRefreshTokenFromCookie(request);
        if (refreshToken != null) {
            refreshTokenService.deleteByToken(refreshToken);
        }
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok(new ApiResponse(200, "Logged out successfully"));
    }

    @GetMapping("/visit")
    public ResponseEntity<String> logVisit(@RequestParam Long userId) {
        userService.trackDailyVisit(userId);
        return ResponseEntity.ok("Visit Tracked");
    }

    @PostMapping("/resend-verification-code")
    public ResponseEntity<?> resendVerificationCode(@RequestParam String email) {
        Optional<User> optionalUser = userRepository.findByEmail(email);
        if (optionalUser.isEmpty()) {
            return new ResponseEntity<>(new ApiResponse(404, "User not found"), HttpStatus.NOT_FOUND);
        }

        User user = optionalUser.get();

        if (user.isEnabled()) {
            return new ResponseEntity<>(new ApiResponse(400, "User already verified"), HttpStatus.BAD_REQUEST);
        }

        String newCode = generateVerificationCode();
        user.setVerificationCode(newCode);
        userRepository.save(user);

        try {
            emailService.sendVerificationEmail("Resend Verification Code", user.getEmail(), user.getName(), newCode);
        } catch (Exception e) {
            return new ResponseEntity<>(new ApiResponse(500, "Failed to send verification email"), HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return new ResponseEntity<>(new ApiResponse(200, "Verification code resent to your email"), HttpStatus.OK);
    }


}