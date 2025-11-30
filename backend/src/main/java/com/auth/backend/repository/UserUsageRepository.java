package com.auth.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.auth.backend.model.User;
import com.auth.backend.model.UserUsage;

public interface UserUsageRepository extends JpaRepository<UserUsage, Integer> {
    Optional<UserUsage> findByUser(User user);
}