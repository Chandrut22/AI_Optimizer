package com.auth.backend.controller;

import com.auth.backend.dto.ScanHistoryDto;
import com.auth.backend.service.ScanHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/scans")
@RequiredArgsConstructor
public class ScanHistoryController {

    private final ScanHistoryService scanHistoryService;

    /**
     * GET /api/v1/scans
     * Fetches the authenticated user's scan history.
     * (Called by the frontend dashboard on page load)
     */
    @GetMapping
    public ResponseEntity<List<ScanHistoryDto>> getUserScanHistory(Authentication authentication) {
        String email = authentication.getName();
        List<ScanHistoryDto> history = scanHistoryService.getScanHistory(email);
        return ResponseEntity.ok(history);
    }

    /**
     * POST /api/v1/scans
     * Creates a new scan history record for the authenticated user.
     * (Called by the frontend when a user clicks "Scan")
     */
    @PostMapping
    public ResponseEntity<ScanHistoryDto> createScanRecord(
            Authentication authentication,
            @RequestBody Map<String, String> requestBody
    ) {
        String email = authentication.getName();
        String url = requestBody.get("url");

        if (url == null || url.isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        ScanHistoryDto newScan = scanHistoryService.createScan(email, url);
        return ResponseEntity.status(HttpStatus.CREATED).body(newScan);
    }
}