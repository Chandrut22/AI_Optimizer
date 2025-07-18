package com.seooptimizer.backend.security;

import java.io.IOException;
import java.net.URLEncoder;

import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final String frontendUrl = "https://ai-optimizer-beta.vercel.app/oauth-success"; // replace if needed

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {

        var oauthUser = (org.springframework.security.oauth2.core.user.DefaultOAuth2User) authentication.getPrincipal();
        String jwt = (String) oauthUser.getAttributes().get("jwt");

        String redirectUrl = frontendUrl + "?token=" + URLEncoder.encode(jwt, "UTF-8");

        response.sendRedirect(redirectUrl);
    }
}
