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
        // Get the authentication object from Spring Security's context
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        // The principal's name is the email (as defined in User.getUsername())
        String userEmail = authentication.getName();

        // Find the user in the repository
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + userEmail));

        // Convert the User entity to a safe UserResponse DTO and return it
        return user.toUserResponse();
    }

    @Transactional
    public void selectAccountTier(String email, AccountTier tier) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        // (In a real app, selecting PRO would go to a payment flow first)

        user.setAccountTier(tier);
        user.setHasSelectedTier(true); // <-- This is the important part

        userRepository.save(user);
    }

    // You could add other user-specific methods here later, like:
    // public UserResponse updateMyPassword(String oldPassword, String newPassword) { ... }
    // public UserResponse updateMyName(String newName) { ... }
}