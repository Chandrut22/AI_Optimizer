package com.seooptimizer.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.seooptimizer.backend.model.User;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Boolean existsByEmail(String email);
    Optional<User> findByVerificationCode(String code);
    Optional<User> findByResetCode(String resetCode);
    Optional<User> findByEmailAndEnabledTrue(String email);

}