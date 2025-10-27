package com.auth.backend.dto;

import com.auth.backend.enums.Role;
import com.auth.backend.enums.AuthProvider;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserResponse {
    private Integer id;
    private String name;
    private String email;
    private Role role;
    private LocalDateTime createdAt;
    private AuthProvider authProvider;
}