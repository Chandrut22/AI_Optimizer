package com.seooptimizer.backend.dto;

import java.time.LocalDateTime;

import com.seooptimizer.backend.enumtype.AuthProvider;
import com.seooptimizer.backend.enumtype.Role;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String name;
    private String email;
    private Role role;
    private AuthProvider provider;
    private Integer usageCount;
    private Integer credits;
    private LocalDateTime createdAt;
}