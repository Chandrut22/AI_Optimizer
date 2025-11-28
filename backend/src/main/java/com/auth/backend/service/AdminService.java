package com.auth.backend.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.auth.backend.dto.UserResponse;
import com.auth.backend.enums.Role;
import com.auth.backend.model.User;
import com.auth.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;


@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;

    /**
     * Finds a user by ID or throws an exception.
     */
    private User findUserById(Integer userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + userId));
    }

    /**
     * Retrieves the email of the currently authenticated admin.
     */
    private String getAuthenticatedAdminEmail() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    /**
     * Fetches all users and returns them as safe DTOs.
     */
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(User::toUserResponse) 
                .collect(Collectors.toList());
    }

    /**
     * Promotes a user to the ADMIN role.
     */
    public UserResponse promoteUser(Integer userId) {
        User user = findUserById(userId);
        user.setRole(Role.ADMIN);
        userRepository.save(user);
        return user.toUserResponse();
    }

    /**
     * Demotes a user to the USER role.
     * Prevents an admin from demoting themselves.
     */
    public UserResponse demoteUser(Integer userId) {
        String adminEmail = getAuthenticatedAdminEmail();
        User userToDemote = findUserById(userId);

        if (userToDemote.getEmail().equals(adminEmail)) {
            throw new IllegalArgumentException("Admin cannot demote themselves.");
        }

        userToDemote.setRole(Role.USER);
        userRepository.save(userToDemote);
        return userToDemote.toUserResponse();
    }

    /**
     * Deletes a user by their ID.
     * Prevents an admin from deleting themselves.
     */
    public void deleteUser(Integer userId) {
        String adminEmail = getAuthenticatedAdminEmail();
        User userToDelete = findUserById(userId);

        if (userToDelete.getEmail().equals(adminEmail)) {
            throw new IllegalArgumentException("Admin cannot delete themselves.");
        }

        userRepository.deleteById(userId);
    }
}