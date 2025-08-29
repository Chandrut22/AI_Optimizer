package com.seooptimizer.backend.controller;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;

@RestController
public class CsrfController {

    @GetMapping("/api/csrf-token")
    public ResponseEntity<Map<String, String>> getCsrfToken(HttpServletRequest request) {
        CsrfToken csrf = (CsrfToken) request.getAttribute(CsrfToken.class.getName());

        // Overwrite cookie so cookie value == JSON value
        ResponseCookie cookie = ResponseCookie.from("XSRF-TOKEN", csrf.getToken())
            .httpOnly(false)          // frontend reads it
            .secure(true)             // PRODUCTION: HTTPS only
            .sameSite("None")         // cross-site SPA (Vercel/Netlify/etc.)
            .path("/")
            .build();

        return ResponseEntity.ok()
            .header(HttpHeaders.SET_COOKIE, cookie.toString())
            .body(Map.of("token", csrf.getToken())); // matches cookie
    }
}
