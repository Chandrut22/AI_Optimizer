package com.auth.backend.service;

import java.io.IOException;
import java.time.Duration;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import com.auth.backend.model.User;
import com.auth.backend.repository.UserRepository;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private static final Logger log = LoggerFactory.getLogger(OAuth2LoginSuccessHandler.class);
    
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final CookieService cookieService; 

    @Value("${application.security.oauth2.frontend-redirect-url}")
    private String frontendRedirectUrl;
    @Value("${application.security.jwt.expiration}")
    private long jwtExpirationMs;
    @Value("${application.security.jwt.refresh-token.expiration}")
    private long refreshExpirationMs;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        OidcUser oidcUser = (OidcUser) authentication.getPrincipal();
        String email = oidcUser.getEmail();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found after OAuth2 login: " + email));

        String accessToken = jwtService.generateToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        // ✅ Use CookieService to set cookies
        cookieService.addTokenCookie("access_token", accessToken, Duration.ofMillis(jwtExpirationMs), response);
        cookieService.addTokenCookie("refresh_token", refreshToken, Duration.ofMillis(refreshExpirationMs), response);

        String targetUrl = UriComponentsBuilder.fromUriString(frontendRedirectUrl)
                .queryParam("loginSuccess", true)
                .build().toUriString();
        
        log.info("OAuth2 login successful for user {}. Redirecting to {}", email, targetUrl);

        clearAuthenticationAttributes(request);
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}