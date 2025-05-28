package com.seooptimizer.backend.controller;

import com.seooptimizer.backend.dto.SEOProjectRequest;
import com.seooptimizer.backend.dto.SEOProjectResponse;
import com.seooptimizer.backend.service.SEOProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final SEOProjectService projectService;

    @PostMapping("/user/{userId}")
    public ResponseEntity<SEOProjectResponse> createProject(
            @PathVariable Long userId,
            @RequestBody SEOProjectRequest request) {
        return ResponseEntity.ok(projectService.createProject(userId, request));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<SEOProjectResponse>> getProjects(
            @PathVariable Long userId) {
        return ResponseEntity.ok(projectService.getProjectsByUserId(userId));
    }
}
