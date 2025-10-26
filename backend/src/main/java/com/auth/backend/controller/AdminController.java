package com.auth.backend.controller;

import com.auth.backend.dto.UserResponse;
import com.auth.backend.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ADMIN')") // <<< Secures all endpoints in this controller
public class AdminController {

    private static final Logger log = LoggerFactory.getLogger(AdminController.class);
    private final AdminService adminService;

    /**
     * Get a list of all users.
     * Accessible only by ADMIN.
     */
    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        log.info("Admin request to get all users");
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    /**
     * Promote a user to ADMIN.
     * Accessible only by ADMIN.
     */
    @PutMapping("/users/promote/{id}")
    public ResponseEntity<UserResponse> promoteUser(@PathVariable Integer id) {
        log.info("Admin request to promote user with id: {}", id);
        UserResponse updatedUser = adminService.promoteUser(id);
        return ResponseEntity.ok(updatedUser);
    }

    /**
     * Demote a user to USER.
     * Accessible only by ADMIN.
     */
    @PutMapping("/users/demote/{id}")
    public ResponseEntity<UserResponse> demoteUser(@PathVariable Integer id) {
        log.info("Admin request to demote user with id: {}", id);
        UserResponse updatedUser = adminService.demoteUser(id);
        return ResponseEntity.ok(updatedUser);
    }

    /**
     * Delete a user.
     * Accessible only by ADMIN.
     */
    @DeleteMapping("/users/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable Integer id) {
        log.info("Admin request to delete user with id: {}", id);
        adminService.deleteUser(id);
        return ResponseEntity.ok("User deleted successfully.");
    }

    // --- Exception Handlers for this Controller ---

    @ExceptionHandler(UsernameNotFoundException.class)
    public ResponseEntity<String> handleUserNotFound(UsernameNotFoundException ex) {
        log.error("Admin action failed: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleIllegalArgument(IllegalArgumentException ex) {
        log.error("Admin action failed: {}", ex.getMessage());
        // e.g., "Admin cannot demote themselves."
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
    }
}