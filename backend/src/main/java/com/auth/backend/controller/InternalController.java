package com.auth.backend.controller;

import java.util.HashMap;
import java.util.Map; // Import HashMap

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.auth.backend.service.LimitService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/usage")
@RequiredArgsConstructor
public class InternalController { 

    private final LimitService limitService;

    @PostMapping("/check-limit") 
    public ResponseEntity<?> checkUserLimit(Authentication authentication) { 
        
        if (authentication == null || !authentication.isAuthenticated()) {
             return ResponseEntity.status(401)
                    .body(Map.of("allowed", false, "reason", "UNAUTHENTICATED"));
        }
        String email = authentication.getName();

        try {
            LimitService.LimitCheckResponse response = limitService.checkAndIncrementLimitByEmail(email); 

            // --- THIS IS THE NEW LOGIC ---
            
            // Build the response body
            Map<String, Object> body = new HashMap<>();
            body.put("allowed", response.isAllowed());
            body.put("reason", response.getReason());

            // If the request was allowed, add the detailed usage object
            if (response.isAllowed() && response.getUsage() != null) {
                body.put("usage", response.getUsage());
            }

            return ResponseEntity.status(response.getHttpStatus()).body(body);
                    
        } catch (UsernameNotFoundException e) {
            return ResponseEntity.status(404)
                    .body(Map.of("allowed", false, "reason", "USER_NOT_FOUND"));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("allowed", false, "reason", "INTERNAL_SERVER_ERROR"));
        }
    }
}