package com.auth.backend.service;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.auth.backend.model.User;
import com.auth.backend.repository.UserRepository;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class LimitService {

    private final UserRepository userRepository; //

    /**
     * A simple helper class to return the result of the limit check.
     */
    @Getter // Lombok annotation to auto-generate getters
    public static class LimitCheckResponse {
        private final boolean allowed;
        private final String reason;
        private final int httpStatus;

        public LimitCheckResponse(boolean allowed, String reason, int httpStatus) {
            this.allowed = allowed;
            this.reason = reason;
            this.httpStatus = httpStatus;
        }
    }

    /**
     * Checks if a user is allowed to make a request based on their trial status and daily limits.
     * If allowed, it increments their daily count. This entire operation is atomic.
     *
     * @param email The email of the user to check (from JWT 'sub' claim).
     * @return A LimitCheckResponse object with the result.
     */
    @Transactional // This is CRITICAL. It ensures data consistency.
    public LimitCheckResponse checkAndIncrementLimitByEmail(String email) {
        
        // 1. Find the user by their email
        User user = userRepository.findByEmail(email) //
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        LocalDate today = LocalDate.now();

        // 2. Check if 14-day trial is expired
        // We use the User's createdAt field for this
        LocalDateTime trialEndDate = user.getCreatedAt().plusDays(14);
        if (LocalDateTime.now().isAfter(trialEndDate)) {
            // Return 402 Payment Required
            return new LimitCheckResponse(false, "TRIAL_EXPIRED", 402);
        }

        // 3. Check if it's a new day. If so, reset the counter.
        if (user.getLastRequestDate() == null || !user.getLastRequestDate().isEqual(today)) {
            user.setDailyRequestCount(0);
            user.setLastRequestDate(today);
        }

        // 4. Check if daily limit is reached
        if (user.getDailyRequestCount() >= 10) {
            // Return 429 Too Many Requests
            return new LimitCheckResponse(false, "DAILY_LIMIT_REACHED", 429);
        }

        // 5. All checks passed. Increment and allow.
        user.setDailyRequestCount(user.getDailyRequestCount() + 1); //
        userRepository.save(user); // The @Transactional will handle the commit

        return new LimitCheckResponse(true, "ALLOWED", 200);
    }
}