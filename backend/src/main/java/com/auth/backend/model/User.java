package com.auth.backend.model;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;   // <-- ADD @Getter

import com.auth.backend.dto.UserResponse;
import com.auth.backend.enums.AccountTier;   // <-- ADD @Setter
import com.auth.backend.enums.AuthProvider;
import com.auth.backend.enums.Role;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter // ADD this
@Setter // ADD this
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "_user",
        indexes = {
                @Index(name = "idx_user_email", columnList = "email", unique = true)
        }
)
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = true)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default // <-- ADD this to fix build warning
    private Role role = Role.USER;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default // <-- ADD this to fix build warning
    private AuthProvider authProvider = AuthProvider.LOCAL;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // --- Verification & Reset Fields ---

    // Note: @Getter on the class will create isEnabled(),
    // which correctly matches the method signature for UserDetails.
    @Column(columnDefinition = "boolean default false")
    @Builder.Default // <-- ADD this to fix build warning
    private boolean enabled = false;

    private String verificationCode;

    private LocalDateTime codeExpiration;

    // --- ADD FREE TRIAL FIELDS HERE ---

    @Column(name = "last_request_date")
    private LocalDate lastRequestDate;

    @Column(name = "daily_request_count", nullable = false, columnDefinition = "integer default 0")
    @Builder.Default // <-- ADD this to fix build warning
    private int dailyRequestCount = 0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "VARCHAR(50) DEFAULT 'FREE'")
    @Builder.Default // <-- ADD this to fix build warning
    private AccountTier accountTier = AccountTier.FREE;

    @Column(nullable = false, columnDefinition = "BOOLEAN DEFAULT false")
    @Builder.Default // <-- ADD this to fix build warning
    private boolean hasSelectedTier = false;
    
    
    // --- UserDetails Implementation ---

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(role.name()));
    }

    @Override
    public String getPassword() {
        return this.password;
    }

    @Override
    public String getUsername() {
        return this.email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    /**
     * Spring Security will check this method.
     * This override is correct and works with @Getter.
     */
    @Override
    public boolean isEnabled() {
        return this.enabled;
    }

    // --- DTO Helper Method ---

    public UserResponse toUserResponse() {
        return UserResponse.builder()
                .id(this.id)
                .name(this.name)
                .email(this.email)
                .role(this.role)
                .createdAt(this.createdAt)
                .authProvider(this.authProvider)
                .build();
    }
}