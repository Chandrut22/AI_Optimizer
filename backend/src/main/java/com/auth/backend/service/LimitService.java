package com.auth.backend.service;

import java.time.LocalDate;
import java.util.Map;

import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.auth.backend.enums.AccountTier;
import com.auth.backend.model.User;
import com.auth.backend.model.UserUsage;
import com.auth.backend.repository.UserRepository;
import com.auth.backend.repository.UserUsageRepository;

import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class LimitService {

    private final UserUsageRepository userUsageRepository;
    private final UserRepository userRepository;

    // Define limits
    private static final int FREE_TIER_LIMIT = 5;
    private static final int PRO_TIER_LIMIT = 25;
    // private static final int ENTERPRISE_TIER_LIMIT = 1000;

    // --- DTOs for Controller Responses ---

    @Data
    @Builder
    public static class LimitCheckResponse {
        private boolean allowed;
        private String reason;
        private Map<String, Object> usage; // Details like current count/max
        private int httpStatus; // e.g., 200 or 429
    }

    @Data
    @Builder
    public static class UsageStatusResponse {
        private int dailyCount;
        private int dailyMax;
        private String tier;
        private boolean hasSelectedTier;
        private String resetDate;
    }

    // --- Core Logic ---

    /**
     * [WRITE] Checks limit for a user by email.
     * If allowed: Increments counter, Updates date, Returns success.
     * If denied: Returns failure with 429 status.
     */
    @Transactional
    public LimitCheckResponse checkAndIncrementLimitByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        // Get or Create the separate usage record
        UserUsage usage = getOrCreateUsage(user);
        
        // Reset if it's a new day
        resetCounterIfNewDay(usage);

        AccountTier tier = usage.getAccountTier();
        int limit = getLimitForTier(tier);
        int currentCount = usage.getDailyRequestCount();

        // Check Limit
        if (currentCount >= limit) {
            return LimitCheckResponse.builder()
                    .allowed(false)
                    .reason("Daily limit reached for " + tier + " tier.")
                    .usage(Map.of(
                            "current", currentCount,
                            "max", limit,
                            "tier", tier
                    ))
                    .httpStatus(429) // Too Many Requests
                    .build();
        }

        // Increment and Save
        usage.setDailyRequestCount(currentCount + 1);
        userUsageRepository.save(usage);

        return LimitCheckResponse.builder()
                .allowed(true)
                .reason("Request authorized")
                .usage(Map.of(
                        "current", usage.getDailyRequestCount() + 1,
                        "max", limit,
                        "tier", tier
                ))
                .httpStatus(200)
                .build();
    }

    /**
     * [READ] Gets current usage status without incrementing.
     * Used by the frontend dashboard to show progress bars.
     */
    @Transactional
    public UsageStatusResponse getUserUsageStatus(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        UserUsage usage = getOrCreateUsage(user);
        
        // Ensure the data displayed is accurate for "today"
        resetCounterIfNewDay(usage); 

        return UsageStatusResponse.builder()
                .dailyCount(usage.getDailyRequestCount())
                .dailyMax(getLimitForTier(usage.getAccountTier()))
                .tier(usage.getAccountTier().name())
                .hasSelectedTier(usage.isHasSelectedTier())
                .resetDate(LocalDate.now().plusDays(1).toString()) // Tomorrow
                .build();
    }

    // --- Helper Methods ---

    private UserUsage getOrCreateUsage(User user) {
        UserUsage usage = user.getUserUsage();
        
        // Recovery mechanism: If UserUsage is missing for an existing user, create it.
        if (usage == null) {
            usage = UserUsage.builder()
                    .user(user)
                    .accountTier(AccountTier.FREE)
                    .dailyRequestCount(0)
                    .lastRequestDate(LocalDate.now())
                    .hasSelectedTier(false)
                    .build();
            user.setUserUsage(usage);
            // Saving usage cascades if configured, but explicit save is safer here
            userUsageRepository.save(usage);
        }
        return usage;
    }

    private void resetCounterIfNewDay(UserUsage usage) {
        LocalDate today = LocalDate.now();
        if (usage.getLastRequestDate() == null || !usage.getLastRequestDate().isEqual(today)) {
            usage.setDailyRequestCount(0);
            usage.setLastRequestDate(today);
            userUsageRepository.save(usage);
        }
    }

    private int getLimitForTier(AccountTier tier) {
        if (tier == null) return FREE_TIER_LIMIT;
        return switch (tier) {
            case PRO -> PRO_TIER_LIMIT;
            // case ENTERPRISE -> ENTERPRISE_TIER_LIMIT;
            default -> FREE_TIER_LIMIT;
        };
    }
}