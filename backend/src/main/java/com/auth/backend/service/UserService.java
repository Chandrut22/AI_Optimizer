package com.auth.backend.service;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.auth.backend.dto.UserResponse;
import com.auth.backend.enums.AccountTier;
import com.auth.backend.model.User;
import com.auth.backend.model.UserUsage;
import com.auth.backend.repository.UserRepository;
import com.auth.backend.repository.UserUsageRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserUsageRepository userUsageRepository;

    public UserResponse getMyInfo() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        
        return user.toUserResponse();
    }

    public void selectAccountTier(String email, AccountTier tier) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        UserUsage usage = user.getUserUsage();
        if (usage == null) {
             usage = UserUsage.builder()
                    .user(user)
                    .dailyRequestCount(0)
                    .build();
        }

        usage.setAccountTier(tier);
        usage.setHasSelectedTier(true);
        
        userUsageRepository.save(usage);
    }
}