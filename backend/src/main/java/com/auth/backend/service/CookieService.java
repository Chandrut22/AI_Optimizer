package com.auth.backend.service;

import java.time.Duration;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseCookie.ResponseCookieBuilder;
import org.springframework.stereotype.Service;

import jakarta.servlet.http.HttpServletResponse;

@Service
public class CookieService {

    private static final Logger log = LoggerFactory.getLogger(CookieService.class);

    @Value("${application.security.cookie.domain}")
    private String cookieDomain;
    @Value("${application.security.cookie.secure}")
    private boolean cookieSecure;
    @Value("${application.security.cookie.same-site}")
    private String cookieSameSite;

    /**
     * Helper method to create and add a cookie to the HttpServletResponse.
     */
    public void addTokenCookie(String cookieName, String token, Duration maxAge, HttpServletResponse response) {
        ResponseCookieBuilder cookieBuilder = ResponseCookie.from(cookieName, token)
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite(cookieSameSite)
                .path("/")
                .maxAge(maxAge);

        if (cookieDomain != null && !cookieDomain.isEmpty()) {
            cookieBuilder.domain(cookieDomain);
        }
        
        response.addHeader(HttpHeaders.SET_COOKIE, cookieBuilder.build().toString());
    }

    /**
     * Helper method to clear a cookie by setting its maxAge to 0.
     */
    public void clearTokenCookie(String cookieName, HttpServletResponse response) {
        ResponseCookieBuilder cookieBuilder = ResponseCookie.from(cookieName, "")
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite(cookieSameSite)
                .path("/")
                .maxAge(0);

        if (cookieDomain != null && !cookieDomain.isEmpty()) {
            cookieBuilder.domain(cookieDomain);
        }

        response.addHeader(HttpHeaders.SET_COOKIE, cookieBuilder.build().toString());
        log.debug("Cleared cookie: {}", cookieName);
    }
}