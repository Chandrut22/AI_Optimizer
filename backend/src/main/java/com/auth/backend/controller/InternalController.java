package com.auth.backend.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.auth.backend.service.LimitService; // Handle this exception

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/internal")
@RequiredArgsConstructor
public class InternalController {

    // Inject the new LimitService
    private final LimitService limitService;

    /**
     * Internal endpoint for the FastAPI agent to check usage limits.
     * This endpoint should ONLY be accessible from within your internal network (e.g., Docker)
     * and not exposed to the public internet.
     *
     * @param userId The ID of the user to check (from the JWT 'sub' claim).
     * @return A ResponseEntity with the check result.
     */
    @PostMapping("/users/{userId}/check-limit")
    public ResponseEntity<?> checkUserLimit(@PathVariable Integer userId) {
        try {
            // Call the service method
            LimitService.LimitCheckResponse response = limitService.checkAndIncrementLimit(userId);

            // Return a response with the correct HTTP status and body
            return ResponseEntity.status(response.getHttpStatus())
                    .body(Map.of("allowed", response.isAllowed(), "reason", response.getReason()));
                    
        } catch (UsernameNotFoundException e) {
            // Handle the case where the user ID from the token doesn't exist
            return ResponseEntity.status(404)
                    .body(Map.of("allowed", false, "reason", "USER_NOT_FOUND"));
        } catch (Exception e) {
            // Catch other potential errors
            return ResponseEntity.status(500)
                    .body(Map.of("allowed", false, "reason", "INTERNAL_SERVER_ERROR"));
        }
    }
}