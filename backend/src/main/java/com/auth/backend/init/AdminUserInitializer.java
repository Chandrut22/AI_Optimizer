package com.auth.backend.init;

import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.auth.backend.enums.AuthProvider;
import com.auth.backend.enums.Role;
import com.auth.backend.model.User;
import com.auth.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class AdminUserInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminUserInitializer.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private final String ADMIN_EMAIL = "admin@optimizer.com";
    private final String ADMIN_PASSWORD = "admin123";

    @Override
    public void run(String... args) throws Exception {
        Optional<User> existingAdmin = userRepository.findByEmail(ADMIN_EMAIL);

        if (existingAdmin.isEmpty()) {
            // 1. Admin user does not exist, create it
            log.info("Admin user not found, creating one...");
            User adminUser = User.builder()
                    .name("Admin User")
                    .email(ADMIN_EMAIL)
                    .password(passwordEncoder.encode(ADMIN_PASSWORD))
                    .role(Role.ADMIN)
                    .authProvider(AuthProvider.LOCAL) // Set provider
                    .enabled(true) // <<< SET TO TRUE
                    .build(); // createdAt will be set by @PrePersist

            userRepository.save(adminUser);
            log.info("Admin user created successfully with email: {}", ADMIN_EMAIL);
        } else {
            // 2. Admin user exists, check if it needs to be updated
            User admin = existingAdmin.get();
            boolean needsUpdate = false;

            // Check if provider is missing
            if (admin.getAuthProvider() == null) {
                admin.setAuthProvider(AuthProvider.LOCAL);
                needsUpdate = true;
                log.info("Updating existing admin user to set AuthProvider to LOCAL.");
            }
            
            // Check if admin is disabled
            if (!admin.isEnabled()) {
                 admin.setEnabled(true);
                 needsUpdate = true;
                 log.info("Updating existing admin user to set enabled=true.");
            }

            if (needsUpdate) {
                userRepository.save(admin);
                log.info("Admin user updated.");
            } else {
                log.info("Admin user with email {} already exists and is correctly configured.", ADMIN_EMAIL);
            }
        }
    }
}
