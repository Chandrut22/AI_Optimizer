package com.auth.backend.controller;

import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.auth.backend.dto.ScanHistoryDto;
import com.auth.backend.dto.SelectTierRequest;
import com.auth.backend.dto.UserResponse;
import com.auth.backend.service.ScanHistoryService;
import com.auth.backend.service.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private static final Logger log = LoggerFactory.getLogger(UserController.class);
    private final UserService userService;
    private final ScanHistoryService scanHistoryService;

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserResponse> getMyInfo() {
        log.info("Request to get current user info");
        return ResponseEntity.ok(userService.getMyInfo());
    }

    @GetMapping("/history")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ScanHistoryDto>> getMyScanHistory(Authentication authentication) {
        log.info("Request to get scan history for user: {}", authentication.getName());
        return ResponseEntity.ok(scanHistoryService.getScanHistory(authentication.getName()));
    }

    @PostMapping("/select-tier")
    public ResponseEntity<?> selectTier(
            Authentication authentication, 
            @Valid @RequestBody SelectTierRequest request
    ) {
        String email = authentication.getName();
        userService.selectAccountTier(email, request.getTier());

        return ResponseEntity.ok(Map.of("message", "Account tier selected successfully"));
    }
}
