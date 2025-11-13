package com.auth.backend.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.auth.backend.service.LimitService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/internal")
@RequiredArgsConstructor
public class InternalController {

    private final LimitService limitService;

    /**
     * Internal endpoint for the FastAPI agent to check usage limits.
     * It gets the user's email from the forwarded JWT.
     *
     * @param authentication The authenticated user from Spring Security.
     * @return A ResponseEntity with the check result.
     */
    // --- 1. CHANGE THE URL (remove {email}) ---
    @PostMapping("/users/check-limit")
    // --- 2. CHANGE THE METHOD SIGNATURE (inject Authentication) ---
    public ResponseEntity<?> checkUserLimit(Authentication authentication) { 
        
        // --- 3. GET THE EMAIL FROM THE TOKEN ---
        if (authentication == null || !authentication.isAuthenticated()) {
             return ResponseEntity.status(401)
                    .body(Map.of("allowed", false, "reason", "UNAUTHENTICATED"));
        }
        String email = authentication.getName(); // This is the user's email
        // ------------------------------------

        try {
            // Call the service method (this one is already correct)
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