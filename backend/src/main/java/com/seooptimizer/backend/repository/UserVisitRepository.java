package com.seooptimizer.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.seooptimizer.backend.model.UserVisit;

public interface UserVisitRepository extends JpaRepository<UserVisit, Long> {
}
