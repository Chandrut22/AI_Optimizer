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

    // --- NEW: Nested class for detailed usage stats ---
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

    /**
     * A simple helper class to return the result of the limit check.
     */
    @Getter // Lombok annotation to auto-generate getters
    public static class LimitCheckResponse {
        private final boolean allowed;
        private final String reason;
        private final int httpStatus;
        private final UsageDetails usage; // <-- NEW FIELD

        // Constructor for DENIED responses
        public LimitCheckResponse(boolean allowed, String reason, int httpStatus) {
            this.allowed = allowed;
            this.reason = reason;
            this.httpStatus = httpStatus;
            this.usage = null; // No usage details if not allowed
        }

        // Constructor for ALLOWED responses
        public LimitCheckResponse(boolean allowed, String reason, int httpStatus, UsageDetails usage) {
            this.allowed = allowed;
            this.reason = reason;
            this.httpStatus = httpStatus;
            this.usage = usage;
        }
    }

    @Transactional
    public LimitCheckResponse checkAndIncrementLimitByEmail(String email) {
        
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        // 1. TIER SELECTION CHECK (No change)
        if (!user.isHasSelectedTier()) {
            return new LimitCheckResponse(false, "TIER_NOT_SELECTED", 403); 
        }

        // 2. PRO TIER CHECK (Enhancement)
        if (user.getAccountTier() == AccountTier.PRO) {
            // Return ALLOWED with PRO usage details
            return new LimitCheckResponse(true, "ALLOWED_PRO", 200, UsageDetails.pro());
        }

        // 3. FREE TIER LOGIC
        LocalDate today = LocalDate.now();
        LocalDateTime trialEndDate = user.getCreatedAt().plusDays(14);

        // Check if 14-day trial is expired
        if (LocalDateTime.now().isAfter(trialEndDate)) {
            return new LimitCheckResponse(false, "TRIAL_EXPIRED", 402);
        }

        // Check if it's a new day. If so, reset the counter.
        if (user.getLastRequestDate() == null || !user.getLastRequestDate().isEqual(today)) {
            user.setDailyRequestCount(0);
            user.setLastRequestDate(today);
        }

        // Check if daily limit is reached
        if (user.getDailyRequestCount() >= 10) {
            return new LimitCheckResponse(false, "DAILY_LIMIT_REACHED", 429);
        }

        // 5. All checks passed. Increment and allow.
        user.setDailyRequestCount(user.getDailyRequestCount() + 1);
        userRepository.save(user);

        // --- ENHANCED RESPONSE ---
        // Return ALLOWED with FREE usage details
        UsageDetails usage = UsageDetails.free(user.getDailyRequestCount(), trialEndDate);
        return new LimitCheckResponse(true, "ALLOWED", 200, usage);
    }
}