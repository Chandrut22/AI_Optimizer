package com.auth.backend.service;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.auth.backend.enums.AccountTier;
import com.auth.backend.model.User;
import com.auth.backend.repository.UserRepository; // Import AccountTier

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class LimitService {

    private final UserRepository userRepository;

    // --- DTO for Usage Details (Used by both responses) ---
    @Getter
    public static class UsageDetails {
        private final Object dailyCount; // Use Object for "N/A"
        private final Object dailyMax;   // Use Object for "UNLIMITED"
        private final Object trialEndDate; // Use Object for "N/A"

        public UsageDetails(Object dailyCount, Object dailyMax, Object trialEndDate) {
            this.dailyCount = dailyCount;
            this.dailyMax = dailyMax;
            this.trialEndDate = trialEndDate;
        }

        // Static factory for a PRO user
        public static UsageDetails pro() {
            return new UsageDetails("N/A", "UNLIMITED", "N/A");
        }
        
        // Static factory for a FREE user
        public static UsageDetails free(int dailyCount, LocalDateTime trialEndDate) {
            return new UsageDetails(dailyCount, 10, trialEndDate.toLocalDate().toString());
        }
    }

    // --- 1. DTO for Check & Increment (Existing) ---
    @Getter 
    public static class LimitCheckResponse {
        private final boolean allowed;
        private final String reason;
        private final int httpStatus;
        private final UsageDetails usage; // Can be null

        // Constructor for DENIED responses
        public LimitCheckResponse(boolean allowed, String reason, int httpStatus) {
            this.allowed = allowed;
            this.reason = reason;
            this.httpStatus = httpStatus;
            this.usage = null; 
        }

        // Constructor for ALLOWED responses
        public LimitCheckResponse(boolean allowed, String reason, int httpStatus, UsageDetails usage) {
            this.allowed = allowed;
            this.reason = reason;
            this.httpStatus = httpStatus;
            this.usage = usage;
        }
    }

    // --- 2. NEW DTO for Read-Only Status Check ---
    @Getter
    public static class UsageStatusResponse {
        private final boolean hasSelectedTier;
        private final AccountTier accountTier;
        private final UsageDetails usage; // Can be null if tier not selected
        private final String trialStatus; // e.g., "ACTIVE", "EXPIRED", "N/A"

        public UsageStatusResponse(User user, UsageDetails usage, String trialStatus) {
            this.hasSelectedTier = user.isHasSelectedTier();
            this.accountTier = user.getAccountTier();
            this.usage = usage;
            this.trialStatus = trialStatus;
        }
        
        // Special constructor for user who hasn't selected tier
        public UsageStatusResponse(User user) {
            this.hasSelectedTier = user.isHasSelectedTier();
            this.accountTier = user.getAccountTier();
            this.usage = null;
            this.trialStatus = "N/A";
        }
    }


    /**
     * [ACTION 1: WRITE]
     * Checks if a user is allowed, and if so, INCREMENTS their count.
     * This is for the FastAPI agent.
     */
    @Transactional
    public LimitCheckResponse checkAndIncrementLimitByEmail(String email) {
        
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        if (!user.isHasSelectedTier()) {
            return new LimitCheckResponse(false, "TIER_NOT_SELECTED", 403); 
        }

        if (user.getAccountTier() == AccountTier.PRO) {
            return new LimitCheckResponse(true, "ALLOWED_PRO", 200, UsageDetails.pro());
        }

        // --- FREE TIER LOGIC ---
        LocalDate today = LocalDate.now();
        LocalDateTime trialEndDate = user.getCreatedAt().plusDays(14);

        if (LocalDateTime.now().isAfter(trialEndDate)) {
            return new LimitCheckResponse(false, "TRIAL_EXPIRED", 402);
        }

        if (user.getLastRequestDate() == null || !user.getLastRequestDate().isEqual(today)) {
            user.setDailyRequestCount(0);
            user.setLastRequestDate(today);
        }

        if (user.getDailyRequestCount() >= 10) {
            return new LimitCheckResponse(false, "DAILY_LIMIT_REACHED", 429);
        }

        // This is the "WRITE" part of the operation
        user.setDailyRequestCount(user.getDailyRequestCount() + 1);
        userRepository.save(user);

        UsageDetails usage = UsageDetails.free(user.getDailyRequestCount(), trialEndDate);
        return new LimitCheckResponse(true, "ALLOWED", 200, usage);
    }

    /**
     * [ACTION 2: READ]
     * Gets the user's current usage status WITHOUT incrementing the count.
     * This is for the frontend dashboard.
     */
    @Transactional // Use Transactional to safely save the daily reset
    public UsageStatusResponse getUserUsageStatus(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        // 1. If tier not selected, return basic info
        if (!user.isHasSelectedTier()) {
            return new UsageStatusResponse(user);
        }

        // 2. If PRO, return PRO details
        if (user.getAccountTier() == AccountTier.PRO) {
            return new UsageStatusResponse(user, UsageDetails.pro(), "N/A");
        }

        // 3. If FREE, get full details
        // This is a good place to reset the counter for the dashboard
        // *before* they make their first request of the day.
        LocalDate today = LocalDate.now();
        if (user.getLastRequestDate() == null || !user.getLastRequestDate().isEqual(today)) {
            user.setDailyRequestCount(0);
            user.setLastRequestDate(today);
            userRepository.save(user); // Save the reset
        }

        LocalDateTime trialEndDate = user.getCreatedAt().plusDays(14);
        UsageDetails usage = UsageDetails.free(user.getDailyRequestCount(), trialEndDate);
        
        String trialStatus = LocalDateTime.now().isAfter(trialEndDate) ? "EXPIRED" : "ACTIVE";

        return new UsageStatusResponse(user, usage, trialStatus);
    }
}