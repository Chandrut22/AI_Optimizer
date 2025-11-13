package com.auth.backend.controller;

import java.util.Map; //

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.auth.backend.service.LimitService;

import lombok.RequiredArgsConstructor;

@RestController
// --- 1. CHANGE THIS LINE ---
@RequestMapping("/api/v1/usage") // <-- Renamed from /internal
@RequiredArgsConstructor
// --- (Optional) Rename class to UsageController ---
public class InternalController { 

    private final LimitService limitService;

    /**
     * Internal endpoint for the FastAPI agent to check usage limits.
     * It gets the user's email from the forwarded JWT.
     */
    // --- 2. THIS URL IS NOW /api/v1/usage/check-limit ---
    @PostMapping("/check-limit") 
    public ResponseEntity<?> checkUserLimit(Authentication authentication) { 
        
        if (authentication == null || !authentication.isAuthenticated()) {
             return ResponseEntity.status(401)
                    .body(Map.of("allowed", false, "reason", "UNAUTHENTICATED"));
        }
        String email = authentication.getName(); // This is the user's email

        try {
            LimitService.LimitCheckResponse response = limitService.checkAndIncrementLimitByEmail(email); 

            return ResponseEntity.status(response.getHttpStatus())
                    .body(Map.of("allowed", response.isAllowed(), "reason", response.getReason()));
                    
        } catch (UsernameNotFoundException e) {
            return ResponseEntity.status(404)
                    .body(Map.of("allowed", false, "reason", "USER_NOT_FOUND"));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("allowed", false, "reason", "INTERNAL_SERVER_ERROR"));
        }
    }
}