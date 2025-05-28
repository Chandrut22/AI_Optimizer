package com.seooptimizer.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.seooptimizer.backend.model.SEOProject;
import com.seooptimizer.backend.model.User;

public interface SEOProjectRepository extends JpaRepository<SEOProject, Long> {
    List<SEOProject> findByUser(User user);
}
