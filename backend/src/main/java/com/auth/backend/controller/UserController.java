package com.auth.backend.controller;

import com.auth.backend.dto.UserResponse;
import com.auth.backend.dto.SelectTierRequest;
import com.auth.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import jakarta.validation.Valid;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private static final Logger log = LoggerFactory.getLogger(UserController.class);
    private final UserService userService;

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()") // Ensures a user is logged in
    public ResponseEntity<UserResponse> getMyInfo() {
        log.info("Request to get current user info");
        // The service layer will fetch the user info from the security context
        return ResponseEntity.ok(userService.getMyInfo());
    }

    @PostMapping("/select-tier")
    public ResponseEntity<?> selectTier(
            Authentication authentication, // This works because of the cookie
            @Valid @RequestBody SelectTierRequest request
    ) {
        String email = authentication.getName();
        userService.selectAccountTier(email, request.getTier());

        return ResponseEntity.ok(Map.of("message", "Account tier selected successfully"));
    }
}
