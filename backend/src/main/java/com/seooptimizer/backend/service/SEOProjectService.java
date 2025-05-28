package com.seooptimizer.backend.service;


import java.util.List;

import com.seooptimizer.backend.dto.SEOProjectRequest;
import com.seooptimizer.backend.dto.SEOProjectResponse;

public interface SEOProjectService {
    SEOProjectResponse createProject(Long userId, SEOProjectRequest request);
    List<SEOProjectResponse> getProjectsByUserId(Long userId);
}

