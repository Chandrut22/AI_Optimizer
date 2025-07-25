package com.seooptimizer.backend.controller;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

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

    @Autowired private AuthenticationManager authenticationManager;
    @Autowired private UserRepository userRepository;
    @Autowired private CustomerUserDetailsService userDetailsService;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtUtil jwtUtil;
    @Autowired private EmailService emailService;
    @Autowired private RefreshTokenService refreshTokenService;
    @Autowired private UserService userService;

    private final Map<String, Boolean> resetCodeVerifiedMap = new ConcurrentHashMap<>();


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
            return ResponseEntity.badRequest().body(new ApiResponse(400, "Invalid email format"));
        }

        if (!isStrongPassword(request.getPassword())) {
            return ResponseEntity.badRequest().body(new ApiResponse(400,
                    "Password must be at least 8 characters, with uppercase, lowercase, digit, and special character"));
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body(new ApiResponse(400, "Email already exists"));
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
            return new ResponseEntity<>(new ApiResponse(500, "Failed to send verification email"), HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return ResponseEntity.ok(new ApiResponse(200, "Registration successful. Please check your email for the verification code."));
    }


    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        Optional<User> optionalUser = userRepository.findByEmail(request.getEmail());
        if (optionalUser.isEmpty()) {
            return new ResponseEntity<>(new ApiResponse(404, "User not found"), HttpStatus.NOT_FOUND);
        }

        User user = optionalUser.get();

        if (!user.isEnabled()) {
            return new ResponseEntity<>(new ApiResponse(403, "Please verify your email first."), HttpStatus.FORBIDDEN);
        }

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        } catch (Exception e) {
            return new ResponseEntity<>(new ApiResponse(401, "Invalid email or password"), HttpStatus.UNAUTHORIZED);
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getEmail());
        String accessToken = jwtUtil.generateAccessToken(userDetails.getUsername());
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getEmail());

        return ResponseEntity.ok(new JwtResponse(accessToken, refreshToken.getToken()));
    }


    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshToken(HttpServletRequest request) {
        String oldRefreshToken = jwtUtil.extractRefreshTokenFromCookie(request);

        if (oldRefreshToken == null || !refreshTokenService.validate(oldRefreshToken)) {
            throw new TokenRefreshException(oldRefreshToken, "Invalid or expired refresh token");
        }

        String email = jwtUtil.extractUsername(oldRefreshToken);
        String newAccessToken = jwtUtil.generateAccessToken(email);
        String newRefreshToken = jwtUtil.rotateRefreshToken(email);

        refreshTokenService.deleteByToken(oldRefreshToken);
        refreshTokenService.saveToken(email, newRefreshToken);

        return ResponseEntity.ok(new JwtResponse(newAccessToken, newRefreshToken));
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

    @PostMapping("/verify-code")
    public ResponseEntity<?> verifyGenericCode(
            @RequestParam String email,
            @RequestParam String code,
            @RequestParam String type) {

        Optional<User> optionalUser = userRepository.findByEmail(email);
        if (optionalUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse(404, "User not found"));
        }

        User user = optionalUser.get();

        switch (type.toLowerCase()) {
            case "register":
                if (user.getVerificationCode() == null || !user.getVerificationCode().equals(code)) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body(new ApiResponse(400, "Invalid verification code"));
                }

                user.setEnabled(true);
                user.setVerificationCode(null);
                userRepository.save(user);

                return ResponseEntity.ok(new ApiResponse(200, "Email verified. You can now login."));

            case "reset":
                if (user.getResetCode() == null || !user.getResetCode().equals(code)) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body(new ApiResponse(400, "Invalid reset code"));
                }

                if (user.getResetCodeGeneratedAt() == null ||
                        user.getResetCodeGeneratedAt().plusMinutes(15).isBefore(LocalDateTime.now())) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body(new ApiResponse(400, "Reset code expired or invalid"));
                }

                resetCodeVerifiedMap.put(email, true);
                return ResponseEntity.ok(new ApiResponse(200, "Reset code verified. You can now reset your password."));

            default:
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ApiResponse(400, "Invalid verification type"));
        }
    }

    @PostMapping("/set-new-password")
    public ResponseEntity<?> setNewPassword(@RequestParam String email, @RequestParam String newPassword) {
        Boolean isVerified = resetCodeVerifiedMap.get(email);
        if (isVerified == null || !isVerified) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ApiResponse(403, "Reset code not verified. Please verify it first."));
        }

        Optional<User> optionalUser = userRepository.findByEmail(email);
        if (optionalUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ApiResponse(404, "User not found"));
        }

        User user = optionalUser.get();
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetCode(null);
        user.setResetCodeGeneratedAt(null);
        userRepository.save(user);
        resetCodeVerifiedMap.remove(email);

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

    @PostMapping("/resend-reset-code")
    public ResponseEntity<?> resendResetCode(@RequestParam String email) {
        Optional<User> optionalUser = userRepository.findByEmail(email);
        if (optionalUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse(404, "User not found"));
        }

        User user = optionalUser.get();

        String newCode = generateVerificationCode();
        user.setResetCode(newCode);
        user.setResetCodeGeneratedAt(LocalDateTime.now());
        userRepository.save(user);

        try {
            emailService.sendVerificationEmail("Password Reset Code", user.getEmail(), user.getName(), newCode);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(500, "Failed to send reset code email"));
        }

        return ResponseEntity.ok(new ApiResponse(200, "Reset code resent to your email"));
    }

}
