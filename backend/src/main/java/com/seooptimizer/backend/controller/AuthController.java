package com.seooptimizer.backend.controller;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.seooptimizer.backend.dto.LoginRequest;
import com.seooptimizer.backend.dto.RegisterRequest;
import com.seooptimizer.backend.dto.UserResponse;
import com.seooptimizer.backend.enumtype.AuthProvider;
import com.seooptimizer.backend.enumtype.Role;
import com.seooptimizer.backend.model.RefreshToken;
import com.seooptimizer.backend.model.User;
import com.seooptimizer.backend.repository.UserRepository;
import com.seooptimizer.backend.security.CustomerUserDetailsService;
import com.seooptimizer.backend.security.JwtUtil;
import com.seooptimizer.backend.service.EmailService;
import com.seooptimizer.backend.service.RefreshTokenService;
import com.seooptimizer.backend.service.UserService;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
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

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(HttpServletRequest request) {
        logger.info("Received request to /me endpoint");

        String accessToken = jwtUtil.extractTokenFromCookie(request, "access_token");
        if (accessToken == null) {
            logger.warn("No access token found in cookies");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }

        String username;
        try {
            username = jwtUtil.extractUsername(accessToken);
            logger.debug("Extracted username from token: {}", username);
        } catch (Exception e) {
            logger.error("Invalid access token", e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
        }

        User user;
        try {
            user = userRepository.findByEmail(username)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        } catch (UsernameNotFoundException ex) {
            logger.error("User not found: {}", username);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        logger.info("Successfully retrieved user data for: {}", username);

        UserResponse response = new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getProvider(),
                user.getUsageCount(),
                user.getCredits(),
                user.getCreatedAt()
        );

        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        logger.info("Received registration request for email: {}", request.getEmail());

        // Validate email format
        if (!isValidEmail(request.getEmail())) {
            logger.warn("Invalid email format: {}", request.getEmail());
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid email format"));
        }

        // Validate password strength
        if (!isStrongPassword(request.getPassword())) {
            logger.warn("Weak password attempt for email: {}", request.getEmail());
            return ResponseEntity.badRequest().body(Map.of("error",
                    "Password must be at least 8 characters, with uppercase, lowercase, digit, and special character"));
        }

        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            logger.warn("Attempt to register with existing email: {}", request.getEmail());
            return ResponseEntity.badRequest().body(Map.of("error", "Email already exists"));
        }

        // Generate verification code
        String code = generateVerificationCode();
        logger.debug("Generated verification code for {}: {}", request.getEmail(), code);

        // Save user
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
        logger.info("User saved in database: {}", request.getEmail());

        // Send verification email
        try {
            emailService.sendVerificationEmail("Email Verification", request.getEmail(), request.getName(), code);
            logger.info("Verification email sent to: {}", request.getEmail());
        } catch (Exception e) {
            logger.error("Failed to send verification email to {}: {}", request.getEmail(), e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to send verification email"));
        }

        logger.info("Registration successful for email: {}", request.getEmail());
        return ResponseEntity.ok(Map.of("message", "Registration successful. Please check your email for the verification code."));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        logger.info("Received login request for email: {}", request.getEmail());

        Optional<User> optionalUser = userRepository.findByEmail(request.getEmail());
        if (optionalUser.isEmpty()) {
            logger.warn("Login failed: User not found - {}", request.getEmail());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "User not found"));
        }

        User user = optionalUser.get();

        if (!user.isEnabled()) {
            logger.warn("Login failed: Email not verified - {}", request.getEmail());
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Please verify your email first."));
        }

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (Exception e) {
            logger.error("Login failed: Invalid credentials for {}", request.getEmail(), e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid email or password"));
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getEmail());
        String accessToken = jwtUtil.generateAccessToken(userDetails.getUsername());
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getEmail());

        // ✅ Access token cookie (short-lived, 15 min)
        ResponseCookie accessCookie = ResponseCookie.from("access_token", accessToken)
                .httpOnly(true)
                .secure(true)
                .path("/")                  // sent with all requests
                .sameSite("None")           // required for cross-site
                .maxAge(15 * 60)            // 15 minutes
                .build();

        // ✅ Refresh token cookie (7 days, scoped only to refresh endpoint)
        ResponseCookie refreshCookie = ResponseCookie.from("refresh_token", refreshToken.getToken())
                .httpOnly(true)
                .secure(true)
                .path("/") // restrict usage only to refresh-token endpoint
                .sameSite("None")
                .maxAge(7 * 24 * 60 * 60)   // 7 days
                .build();

        logger.info("Login successful for {}", request.getEmail());

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, accessCookie.toString())
                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                .body(Map.of("message", "Login successful"));
    }


    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshToken(HttpServletRequest request) {
        logger.info("Incoming refresh token request");

        String oldRefreshToken = jwtUtil.extractRefreshTokenFromCookie(request);

        if (oldRefreshToken == null) {
            logger.warn("Refresh token missing in request");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Missing refresh token"));
        }

        Optional<RefreshToken> optionalToken = refreshTokenService.findByToken(oldRefreshToken);
        if (optionalToken.isEmpty()) {
            logger.warn("Invalid refresh token received");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid refresh token"));
        }

        RefreshToken storedToken = optionalToken.get();
        Instant expiryInstant = storedToken.getExpiryDate()
                .atZone(ZoneId.systemDefault())
                .toInstant();

        if (Instant.now().isAfter(expiryInstant)) {
            logger.info("Expired refresh token for user: {}", storedToken.getUser().getEmail());
            refreshTokenService.deleteByToken(oldRefreshToken);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Refresh token has expired. Please login again."));
        }

        User user = storedToken.getUser();
        String email = user.getEmail();

        logger.info("Rotating refresh token for user: {}", email);

        // ✅ Rotate: delete old token + save new one
        refreshTokenService.deleteByToken(oldRefreshToken);
        String newRefreshToken = refreshTokenService.saveToken(email);

        String newAccessToken = jwtUtil.generateAccessToken(email);

        // ✅ Access token cookie (15 min)
        ResponseCookie accessTokenCookie = ResponseCookie.from("access_token", newAccessToken)
                .httpOnly(true)
                .secure(true)
                .path("/")                   // access token should be sent everywhere
                .maxAge(15 * 60)
                .sameSite("None")
                .build();

        // ✅ Refresh token cookie (7 days, only for /api/auth/refresh-token)
        ResponseCookie refreshTokenCookie = ResponseCookie.from("refresh_token", newRefreshToken)
                .httpOnly(true)
                .secure(true)
                .path("/") // 🔥 restrict to refresh endpoint
                .maxAge(7 * 24 * 60 * 60)
                .sameSite("None")
                .build();

        logger.info("Successfully refreshed tokens for user: {}", email);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, accessTokenCookie.toString())
                .header(HttpHeaders.SET_COOKIE, refreshTokenCookie.toString())
                .body(Map.of("message", "Tokens refreshed successfully"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestParam String email) {
        logger.info("Received forgot password request for email: {}", email);
        Optional<User> optionalUser = userRepository.findByEmail(email);
        if (optionalUser.isEmpty()) {
            logger.error("Forgot password failed: User not found with email {}", email); // log error
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "User not found"));
        }

        User user = optionalUser.get();
        String resetCode = generateVerificationCode();
        user.setResetCode(resetCode);
        user.setResetCodeGeneratedAt(LocalDateTime.now());
        userRepository.save(user);

        try {
            emailService.sendVerificationEmail("Password Reset", user.getEmail(), user.getName(), resetCode);
        } catch (Exception e) {
            logger.error("Error sending password reset email to {}: {}", user.getEmail(), e.getMessage(), e); // log exception
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to send verification email"));
        }

        logger.info("Password reset code sent successfully to {}", user.getEmail()); // success log
        return ResponseEntity.ok(Map.of("message", "Password reset code sent to email"));
    }

   @PostMapping("/verify-code")
    public ResponseEntity<?> verifyGenericCode(
            @RequestParam String email,
            @RequestParam String code,
            @RequestParam String type) {

        logger.info("Received verification request: email={}, type={}", email, type);

        Optional<User> optionalUser = userRepository.findByEmail(email);
        if (optionalUser.isEmpty()) {
            logger.warn("Verification failed: No user found with email={}", email);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "User not found"));
        }

        User user = optionalUser.get();
        logger.debug("User found: id={}, email={}", user.getId(), user.getEmail());

        switch (type.toLowerCase()) {
            case "register":
                logger.info("Processing registration verification for email={}", email);

                if (user.getVerificationCode() == null || !user.getVerificationCode().equals(code)) {
                    logger.warn("Invalid registration code for email={}", email);
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body(Map.of("error", "Invalid verification code"));
                }

                user.setEnabled(true);
                user.setVerificationCode(null);
                userRepository.save(user);

                logger.info("Registration verification successful for email={}", email);
                return ResponseEntity.ok(Map.of("message", "Email verified. You can now login."));

            case "reset":
                logger.info("Processing password reset verification for email={}", email);

                if (user.getResetCode() == null || !user.getResetCode().equals(code)) {
                    logger.warn("Invalid reset code for email={}", email);
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body(Map.of("error", "Invalid reset code"));
                }

                if (user.getResetCodeGeneratedAt() == null ||
                        user.getResetCodeGeneratedAt().plusMinutes(15).isBefore(LocalDateTime.now())) {
                    logger.warn("Expired reset code for email={}", email);
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body(Map.of("error", "Reset code expired or invalid"));
                }

                resetCodeVerifiedMap.put(email, true);
                logger.info("Password reset code verified for email={}", email);
                return ResponseEntity.ok(Map.of("message", "Reset code verified. You can now reset your password."));

            default:
                logger.error("Invalid verification type={} provided for email={}", type, email);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Invalid verification type"));
        }
    }

    @PostMapping("/set-new-password")
    public ResponseEntity<?> setNewPassword(@RequestParam String email, @RequestParam String newPassword) {
        logger.info("Received request to set new password for email: {}", email);
        Boolean isVerified = resetCodeVerifiedMap.get(email);
        if (isVerified == null || !isVerified) {
            logger.error("Password reset attempt failed for email {}: reset code not verified", email);
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Reset code not verified. Please verify it first."));
        }

        Optional<User> optionalUser = userRepository.findByEmail(email);
        if (optionalUser.isEmpty()) {
            logger.error("Password reset attempt failed: user not found for email {}", email);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "User not found"));
        }

        User user = optionalUser.get();
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetCode(null);
        user.setResetCodeGeneratedAt(null);
        userRepository.save(user);
        resetCodeVerifiedMap.remove(email);

        logger.info("Password successfully reset for email {}", email);
        return ResponseEntity.ok(Map.of("message", "Password has been successfully reset"));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        String clientIp = request.getRemoteAddr();

        logger.info("Logout request received from IP: {}", clientIp);

        // ✅ Delete access token cookie
        ResponseCookie deleteAccessToken = ResponseCookie.from("access_token", "")
                .httpOnly(true)
                .secure(true)
                .path("/")              // matches login path
                .maxAge(0)              // expire immediately
                .sameSite("None")
                .build();

        // ✅ Delete refresh token cookie (path must match refresh-token)
        ResponseCookie deleteRefreshToken = ResponseCookie.from("refresh_token", "")
                .httpOnly(true)
                .secure(true)
                .path("/api/auth/refresh-token") // matches refresh cookie path
                .maxAge(0)              // expire immediately
                .sameSite("None")
                .build();

        // (Optional) Remove refresh token from DB if present
        String refreshToken = jwtUtil.extractRefreshTokenFromCookie(request);
        if (refreshToken != null) {
            refreshTokenService.deleteByToken(refreshToken);
            logger.info("Refresh token deleted from DB for IP: {}", clientIp);
        }

        logger.info("Access and refresh tokens cleared for client IP: {}", clientIp);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, deleteAccessToken.toString())
                .header(HttpHeaders.SET_COOKIE, deleteRefreshToken.toString())
                .body(Map.of("message", "Logged out successfully"));
    }


    @GetMapping("/visit")
    public ResponseEntity<?> logVisit(@RequestParam Long userId) {
        logger.info("Received visit tracking request for userId: {}", userId);

        try {
            userService.trackDailyVisit(userId);
            logger.info("Visit successfully tracked for userId: {}", userId);
            return ResponseEntity.ok(Map.of("message", "Visit Tracked"));
        } catch (Exception e) {
            logger.error("Error tracking visit for userId: {}", userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to track visit"));
        }
    }

    @PostMapping("/resend-reset-code")
    public ResponseEntity<?> resendResetCode(@RequestParam String email) {
        logger.info("Resend reset code request received for email: {}", email);

        Optional<User> optionalUser = userRepository.findByEmail(email);
        if (optionalUser.isEmpty()) {
            logger.warn("User not found for email: {}", email);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "User not found"));
        }

        User user = optionalUser.get();
        String newCode = generateVerificationCode();
        user.setResetCode(newCode);
        user.setResetCodeGeneratedAt(LocalDateTime.now());
        userRepository.save(user);

        try {
            emailService.sendVerificationEmail(
                "Password Reset Code",
                user.getEmail(),
                user.getName(),
                newCode
            );
            logger.info("Reset code sent successfully to email: {}", email);
        } catch (Exception e) {
            logger.error("Failed to send reset code to email: {}", email, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to send reset code email"));
        }

        return ResponseEntity.ok(Map.of("message", "Reset code resent to your email"));
    }
}
