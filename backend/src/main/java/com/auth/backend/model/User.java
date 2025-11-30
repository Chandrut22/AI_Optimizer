package com.auth.backend.model;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.hibernate.annotations.CreationTimestamp;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.auth.backend.dto.UserResponse;
import com.auth.backend.enums.AuthProvider;
import com.auth.backend.enums.Role;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter 
@Setter 
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
    @Builder.Default
    private Role role = Role.USER;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private AuthProvider authProvider = AuthProvider.LOCAL;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // --- Verification & Reset Fields ---

    @Column(nullable = false)
    @Builder.Default
    private boolean enabled = false;

    private String verificationCode;

    private LocalDateTime codeExpiration;

    // --- Relationships ---

    // 1. Connection to ScanHistory (One User -> Many Scans)
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private Set<ScanHistory> scanHistories = new HashSet<>();

    // 2. Connection to UserUsage (One User <-> One Usage Record)
    // cascade = CascadeType.ALL ensures saving User also saves UserUsage
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.EAGER, orphanRemoval = true)
    private UserUsage userUsage;
    
    // --- UserDetails Implementation ---

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(role.name()));
    }

    @Override
    public String getPassword() { return this.password; }

    @Override
    public String getUsername() { return this.email; }

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return this.enabled; }

    // --- DTO Helper Method ---

    public UserResponse toUserResponse() {
        // Safe check for null userUsage (in case of legacy data)
        boolean tierSelected = (this.userUsage != null) && this.userUsage.isHasSelectedTier();

        return UserResponse.builder()
                .id(this.id)
                .name(this.name)
                .email(this.email)
                .role(this.role)
                .createdAt(this.createdAt)
                .authProvider(this.authProvider)
                .hasSelectedTier(tierSelected)
                .build();
    }
}