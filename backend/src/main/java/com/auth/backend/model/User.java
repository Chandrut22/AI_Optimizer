package com.auth.backend.model;

import com.auth.backend.dto.UserResponse;
import com.auth.backend.enums.AuthProvider;
import com.auth.backend.enums.Role;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data; 
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDate; 
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Data // Includes @Getter, @Setter, @ToString, @EqualsAndHashCode, @RequiredArgsConstructor
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "_user",
        indexes = {
                // Index for fast email lookup
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

    @Column(nullable = true) // Must be nullable to allow Google/OAuth users
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false) // Ensures every user has a provider (LOCAL or GOOGLE)
    private AuthProvider authProvider;

    @CreationTimestamp // Use @CreationTimestamp for automatic setting
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // --- Verification & Reset Fields ---

    @Column(columnDefinition = "boolean default false")
    private boolean enabled = false; // Default to false for new registrations

    private String verificationCode; // For email verification or password reset

    private LocalDateTime codeExpiration; // Expiration time for the code

    // --- ADD FREE TRIAL FIELDS HERE ---

    // Tracks the last day a request was made, to know when to reset the counter
    @Column(name = "last_request_date")
    private LocalDate lastRequestDate;

    // Tracks the number of requests made today
    @Column(name = "daily_request_count", nullable = false)
    private int dailyRequestCount = 0;

    // --- Lifecycle Callbacks ---

    // @PrePersist is no longer needed if using @CreationTimestamp
    // @PrePersist
    // protected void onCreate() {
    //     this.createdAt = LocalDateTime.now();
    // }

    // --- UserDetails Implementation ---

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(role.name()));
    }

    @Override
    public String getPassword() {
        return this.password;
    }

    /**
     * UserDetails uses "username" as the identifier.
     * We use the email field for this purpose.
     */
    @Override
    public String getUsername() {
        return this.email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true; // Or add logic for this
    }

    @Override
    public boolean isAccountNonLocked() {
        return true; // Or add logic for this
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true; // Or add logic for this
    }

    /**
     * Spring Security will check this method.
     * For local accounts, login fails until this is true (after verification).
     */
    @Override
    public boolean isEnabled() {
        return this.enabled;
    }

    // --- DTO Helper Method ---

    /**
     * Converts this User entity to a safe-to-return UserResponse DTO.
     * @return UserResponse object without sensitive data (like password).
     */
    public UserResponse toUserResponse() {
        return UserResponse.builder()
                .id(this.id)
                .name(this.name)
                .email(this.email)
                .role(this.role)
                .createdAt(this.createdAt)
                .authProvider(this.authProvider) // Include auth provider
                .build();
    }
}
