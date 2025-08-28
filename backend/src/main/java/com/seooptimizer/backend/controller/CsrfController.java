package com.seooptimizer.backend.controller;

import java.util.Map;

import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api")
public class CsrfController {

    @GetMapping("/csrf-token")
    public Map<String, String> csrf(HttpServletRequest request) {
        // Spring Security automatically attaches CsrfToken to the request
        CsrfToken token = (CsrfToken) request.getAttribute(CsrfToken.class.getName());

        if (token == null) {
            throw new IllegalStateException("CSRF token not available. Check SecurityConfig setup.");
        }

        // ✅ Return the SAME token that was already set in the XSRF-TOKEN cookie
        return Map.of("csrfToken", token.getToken());
    }
}