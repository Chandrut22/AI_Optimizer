package com.auth.backend.service;

// import org.springframework.boot.autoconfigure.couchbase.CouchbaseProperties;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.security.authentication.AuthenticationManager;
// import org.springframework.security.core.Authentication;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.beans.factory.annotation.Value;
import jakarta.servlet.http.HttpServletResponse;

import com.auth.backend.dto.AuthenticationRequest;
import com.auth.backend.dto.RegisterRequest;
import com.auth.backend.enums.Role;
import com.auth.backend.model.User;
import com.auth.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import java.time.Duration; // Import Duration

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

    // Helper method to create and add a cookie
    private void addTokenCookie(String cookieName, String token, Duration maxAge, HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from(cookieName, token)
                .httpOnly(true)            // Essential for security
                .secure(cookieSecure)      // Should be true in production (HTTPS)
                .sameSite(cookieSameSite)  // "None" for cross-subdomain, requires Secure=true
                .path("/")                 // Available for all paths
                .domain(cookieDomain)      // Set the root domain (e.g., .yourdomain.com)
                .maxAge(maxAge)            // Set expiration
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
}