package com.auth.backend.model;

import java.time.LocalDate;

import com.auth.backend.enums.AccountTier;
import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "user_usage")
public class UserUsage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // --- Subscription / Tier Info ---
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private AccountTier accountTier = AccountTier.FREE;

    @Column(nullable = false)
    @Builder.Default
    private boolean hasSelectedTier = false;

    // --- Usage Tracking ---

    @Column(name = "last_request_date")
    private LocalDate lastRequestDate;

    @Column(name = "daily_request_count", nullable = false)
    @Builder.Default
    private int dailyRequestCount = 0;

    // --- Relationship to User (1-to-1) ---
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false, unique = true)
    @JsonIgnore
    private User user;

   
}