package com.seooptimizer.backend.security;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import com.seooptimizer.backend.model.User;
import com.seooptimizer.backend.repository.UserRepository;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    // Frontend URL where user is redirected after successful OAuth login
    private final String frontendUrl = "https://ai-optimizer-beta.vercel.app/oauth-success";

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {

        DefaultOAuth2User oauthUser = (DefaultOAuth2User) authentication.getPrincipal();

        // Extract email from OAuth2 user
        String email = (String) oauthUser.getAttributes().get("email");

        // Fetch user from DB to get the username
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found after OAuth login"));

        // Generate JWT using username
        String jwt = jwtUtil.generateAccessToken(user.getName());

        // Optional: generate refresh token too
        // String refreshToken = jwtUtil.generateRefreshToken(user.getUsername());

        // Encode and redirect to frontend with the access token
        String redirectUrl = frontendUrl + "?token=" + URLEncoder.encode(jwt, StandardCharsets.UTF_8);
        response.sendRedirect(redirectUrl);
    }
}
