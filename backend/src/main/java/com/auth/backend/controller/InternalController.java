package com.auth.backend.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.auth.backend.service.LimitService;
import com.auth.backend.service.LimitService.LimitCheckResponse;
import com.auth.backend.service.LimitService.UsageStatusResponse;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/usage")
@RequiredArgsConstructor
public class InternalController {

    private final LimitService limitService;

    /**
     * [WRITE] Endpoint for the FastAPI agent to check AND increment usage.
     * This should be secured appropriately (e.g., by ensuring only the agent can call it or via user token).
     */
    @PostMapping("/check-limit")
    public ResponseEntity<?> checkUserLimit(Authentication authentication) {
        
        if (authentication == null || !authentication.isAuthenticated()) {
             return ResponseEntity.status(401)
                     .body(Map.of("allowed", false, "reason", "UNAUTHENTICATED"));
        }
        String email = authentication.getName();

        try {
            // Use the service method that performs the check and increment logic
            LimitCheckResponse response = limitService.checkAndIncrementLimitByEmail(email);

            Map<String, Object> body = new HashMap<>();
            body.put("allowed", response.isAllowed());
            body.put("reason", response.getReason());

            // Include usage stats if allowed (or even if denied, for context)
            if (response.getUsage() != null) {
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

    /**
     * [READ] New endpoint for the frontend dashboard to get status ONLY.
     * This does NOT increment the usage count.
     */
    @GetMapping("/status")
    public ResponseEntity<?> getUserUsageStatus(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401)
                    .body(Map.of("error", "UNAUTHENTICATED"));
        }
        String email = authentication.getName();

        try {
            // Use the service method that only fetches status
            UsageStatusResponse response = limitService.getUserUsageStatus(email);
            return ResponseEntity.ok(response);
                    
        } catch (UsernameNotFoundException e) {
            return ResponseEntity.status(404)
                    .body(Map.of("error", "USER_NOT_FOUND"));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("error", "INTERNAL_SERVER_ERROR"));
        }
    }
}