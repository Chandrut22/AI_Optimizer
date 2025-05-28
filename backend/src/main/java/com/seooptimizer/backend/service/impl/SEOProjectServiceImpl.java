package com.seooptimizer.backend.service.impl;

import com.seooptimizer.backend.dto.SEOProjectRequest;
import com.seooptimizer.backend.dto.SEOProjectResponse;
import com.seooptimizer.backend.model.SEOProject;
import com.seooptimizer.backend.model.User;
import com.seooptimizer.backend.repository.SEOProjectRepository;
import com.seooptimizer.backend.repository.UserRepository;
import com.seooptimizer.backend.service.SEOProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SEOProjectServiceImpl implements SEOProjectService {

    private final SEOProjectRepository projectRepository;
    private final UserRepository userRepository;

    @Override
    public SEOProjectResponse createProject(Long userId, SEOProjectRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        SEOProject project = SEOProject.builder()
                .projectName(request.getProjectName())
                .websiteUrl(request.getWebsiteUrl())
                .user(user)
                .build();

        projectRepository.save(project);

        return SEOProjectResponse.builder()
                .id(project.getId())
                .projectName(project.getProjectName())
                .websiteUrl(project.getWebsiteUrl())
                .createdAt(project.getCreatedAt())
                .build();
    }

    @Override
    public List<SEOProjectResponse> getProjectsByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return projectRepository.findByUser(user).stream()
                .map(project -> SEOProjectResponse.builder()
                        .id(project.getId())
                        .projectName(project.getProjectName())
                        .websiteUrl(project.getWebsiteUrl())
                        .createdAt(project.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }
}
