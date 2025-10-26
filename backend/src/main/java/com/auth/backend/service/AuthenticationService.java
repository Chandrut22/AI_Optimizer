package com.auth.backend.service;

// import org.springframework.boot.autoconfigure.couchbase.CouchbaseProperties;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.security.authentication.AuthenticationManager;
// import org.springframework.security.core.Authentication;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseCookie.ResponseCookieBuilder;
import org.springframework.beans.factory.annotation.Value;
import jakarta.servlet.http.HttpServletResponse;

import com.auth.backend.dto.AuthenticationRequest;
import com.auth.backend.dto.RegisterRequest;
import com.auth.backend.enums.Role;
import com.auth.backend.model.User;
import com.auth.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import java.time.Duration; // Import Duration
import com.auth.backend.service.JwtService;
import com.auth.backend.service.AuthenticationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    // Inject cookie properties
    @Value("${application.security.cookie.domain}")
    private String cookieDomain;
    @Value("${application.security.cookie.secure}")
    private boolean cookieSecure;
    @Value("${application.security.cookie.same-site}")
    private String cookieSameSite;
    @Value("${application.security.jwt.expiration}")
    private long jwtExpirationMs; // Use the existing expiration property
    @Value("${application.security.jwt.refresh-token.expiration}")
    private long refreshExpirationMs; // Use the existing expiration property

    // Add this near the top with other class-level declarations
    private static final Logger logger = LoggerFactory.getLogger(AuthenticationService.class);


    // Modified return type and added HttpServletResponse parameter
    public void register(RegisterRequest request, HttpServletResponse response) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already in use: " + request.getEmail());
        }

        var user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER) // Assuming hardcoded USER role based on previous request
                .build();
        userRepository.save(user);

        // Generate tokens
        var jwtToken = jwtService.generateToken(user);
        var refreshToken = jwtService.generateRefreshToken(user); // Assuming you still want a refresh token

        // Set cookies in the response
        addTokenCookie("access_token", jwtToken, Duration.ofMillis(jwtExpirationMs), response);
        addTokenCookie("refresh_token", refreshToken, Duration.ofMillis(refreshExpirationMs), response);

        // No need to return AuthenticationResponse anymore
    }

    // Modified return type and added HttpServletResponse parameter
    public void authenticate(AuthenticationRequest request, HttpServletResponse response) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        var user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("User not found after authentication"));

        // Generate tokens
        var jwtToken = jwtService.generateToken(user);
        var refreshToken = jwtService.generateRefreshToken(user);

        // Set cookies in the response
        addTokenCookie("access_token", jwtToken, Duration.ofMillis(jwtExpirationMs), response);
        addTokenCookie("refresh_token", refreshToken, Duration.ofMillis(refreshExpirationMs), response);

        // No need to return AuthenticationResponse anymore
    }

    // --- NEW REFRESH TOKEN METHOD ---
    public void refreshToken(String refreshToken, HttpServletResponse response) {
        // 1. Extract username (email) from the refresh token
        final String userEmail = jwtService.extractUsername(refreshToken);

        if (userEmail != null) {
            // 2. Find user in the database
            var user = this.userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found for refresh token"));

            // 3. Validate the refresh token (checks expiration, signature, and user match)
            if (jwtService.isTokenValid(refreshToken, user)) {
                // 4. Generate a NEW access token
                var newAccessToken = jwtService.generateToken(user);

                // 5. Set the new access token cookie (refresh token remains the same for now)
                addTokenCookie("access_token", newAccessToken, Duration.ofMillis(jwtExpirationMs), response);
                // Optional: Generate and set a new refresh token as well for better security (token rotation)
                // var newRefreshToken = jwtService.generateRefreshToken(user);
                // addTokenCookie("refresh_token", newRefreshToken, Duration.ofMillis(refreshExpirationMs), response);

            } else {
                 throw new IllegalArgumentException("Refresh token is invalid or expired");
            }
        } else {
            throw new IllegalArgumentException("Cannot extract user email from refresh token");
        }
    }

    // Replace the addTokenCookie method with this fixed version
    public void addTokenCookie(String cookieName, String token, Duration maxAge, HttpServletResponse response) {
        ResponseCookieBuilder cookieBuilder = ResponseCookie.from(cookieName, token)
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite(cookieSameSite)
                .path("/")
                .maxAge(maxAge);

        // Only add the domain attribute if it's not null or empty
        if (cookieDomain != null && !cookieDomain.isEmpty()) {
            cookieBuilder.domain(cookieDomain);
            logger.info("Setting cookie domain to: {}", cookieDomain);
        } else {
            logger.info("No cookie domain set, defaulting to request domain.");
        }
        
        response.addHeader(HttpHeaders.SET_COOKIE, cookieBuilder.build().toString());
    }
}