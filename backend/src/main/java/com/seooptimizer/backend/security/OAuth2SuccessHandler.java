package com.seooptimizer.backend.security;

import java.io.IOException;
import java.time.Duration;
import java.util.Collections;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import com.seooptimizer.backend.enumtype.AuthProvider;
import com.seooptimizer.backend.enumtype.Role;
import com.seooptimizer.backend.model.RefreshToken;
import com.seooptimizer.backend.model.User;
import com.seooptimizer.backend.repository.UserRepository;
import com.seooptimizer.backend.service.RefreshTokenService;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final RefreshTokenService refreshTokenService;

    // ✅ Update with your production frontend URL
    private final String frontendRedirectUrl = "https://ai-optimizer-beta.vercel.app/oauth-success";

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {

        DefaultOAuth2User oauthUser = (DefaultOAuth2User) authentication.getPrincipal();
        String email = (String) oauthUser.getAttributes().get("email");
        String name = (String) oauthUser.getAttributes().get("name");

        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setName(name);
            newUser.setProvider(AuthProvider.GOOGLE);
            newUser.setRole(Role.USER);
            newUser.setEnabled(true);
            newUser.setCredits(100); // Default credits
            return userRepository.save(newUser);
        });

        // ✅ Generate JWT tokens with roles
        var authorities = Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));
        String accessToken = jwtUtil.generateAccessToken(user.getEmail(), authorities);
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getEmail());

        // ✅ Create HttpOnly cookies using ResponseCookie
        ResponseCookie accessTokenCookie = ResponseCookie.from("access_token", accessToken)
                .httpOnly(true)
                .secure(true) // ❗ Use true in production (requires HTTPS)
                .sameSite("None") // ❗ Required for cross-site cookies
                .path("/")
                .maxAge(Duration.ofMinutes(15))
                .build();

        ResponseCookie refreshTokenCookie = ResponseCookie.from("refresh_token", refreshToken.getToken())
                .httpOnly(true)
                .secure(true)
                .sameSite("None")
                .path("/")
                .maxAge(Duration.ofDays(7))
                .build();

        // ✅ Add cookies to response header
        response.addHeader(HttpHeaders.SET_COOKIE, accessTokenCookie.toString());
        response.addHeader(HttpHeaders.SET_COOKIE, refreshTokenCookie.toString());

        // ✅ Redirect to frontend success page
        response.sendRedirect(frontendRedirectUrl);
    }
}
