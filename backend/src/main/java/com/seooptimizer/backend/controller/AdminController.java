package com.seooptimizer.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.seooptimizer.backend.dto.UserResponse;
import com.seooptimizer.backend.model.User;
import com.seooptimizer.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(user -> new UserResponse(
                    user.getId(),
                    user.getName(),
                    user.getEmail(),
                    user.getRole(),
                    user.getProvider(),
                    user.getUsageCount(),
                    user.getCredits(),
                    user.getCreatedAt()
                ))
                .toList();
    }

    @PutMapping("/promote/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public User promoteToAdmin(@PathVariable Long userId) {
        return userRepository.findById(userId).map(user -> {
            user.setRole(com.seooptimizer.backend.enumtype.Role.ADMIN);
            return userRepository.save(user);
        }).orElseThrow(() -> new RuntimeException("User not found"));
    }

    @DeleteMapping("/delete/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deleteUser(@PathVariable Long userId) {
        return userRepository.findById(userId).map(user -> {
            userRepository.delete(user);
            return ResponseEntity.ok("User deleted successfully.");
        }).orElse(ResponseEntity.notFound().build());
    }
}
