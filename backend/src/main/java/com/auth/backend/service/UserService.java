package com.auth.backend.service;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.auth.backend.dto.UserResponse;
import com.auth.backend.enums.AccountTier;
import com.auth.backend.model.User;
import com.auth.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    /**
     * Retrieves the currently authenticated user's details.
     *
     * @return UserResponse DTO containing the authenticated user's data.
     */
    public UserResponse getMyInfo() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        String userEmail = authentication.getName();

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + userEmail));

        return user.toUserResponse();
    }

    @Transactional
    public void selectAccountTier(String email, AccountTier tier) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));


        user.setAccountTier(tier);
        user.setHasSelectedTier(true); 

        userRepository.save(user);
    }

}