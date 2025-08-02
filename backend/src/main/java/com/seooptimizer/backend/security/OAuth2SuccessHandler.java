package com.seooptimizer.backend.security;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import com.seooptimizer.backend.enumtype.AuthProvider;
import com.seooptimizer.backend.enumtype.Role;
import com.seooptimizer.backend.model.User;
import com.seooptimizer.backend.repository.UserRepository;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    private final String frontendUrl = "https://ai-optimizer-beta.vercel.app/oauth-success";

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
            newUser.setCredits(100); // optional default
            return userRepository.save(newUser);
        });

        // ✅ Generate JWT token
        String jwt = jwtUtil.generateAccessToken(user.getName());

        // ✅ Create secure HttpOnly cookie for the JWT
        Cookie jwtCookie = new Cookie("jwt", jwt);
        jwtCookie.setHttpOnly(true);
        jwtCookie.setSecure(true); // set true in production with HTTPS
        jwtCookie.setPath("/");
        jwtCookie.setMaxAge(7 * 24 * 60 * 60); // 7 days

        // ✅ Add cookie to response
        response.addCookie(jwtCookie);

        // ✅ Redirect to frontend success page (no token in URL)
        response.sendRedirect(frontendUrl);
    }
}
