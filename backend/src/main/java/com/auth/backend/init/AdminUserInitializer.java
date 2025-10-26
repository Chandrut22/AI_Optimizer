package com.auth.backend.init; // Or your main package

import com.auth.backend.enums.Role;     // Correct import for your Role enum
import com.auth.backend.model.User;     // Correct import for your User model
import com.auth.backend.repository.UserRepository; // Correct import for your UserRepository
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component // Make it a Spring bean
@RequiredArgsConstructor // Inject dependencies via constructor
public class AdminUserInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminUserInitializer.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

     // Load values from application.properties
    @Value("${admin.email}")
    private String adminEmail;

    @Value("${admin.password}")
    private String adminPassword;

    @Value("${admin.name:Admin User}") // optional default value
    private String adminName;

    @Override
    public void run(String... args) throws Exception {
        // Check if the admin user already exists
        if (userRepository.findByEmail(adminEmail).isEmpty()) {
            log.info("Admin user not found, creating one...");

            // Create the admin user
            User adminUser = User.builder()
                    .name(adminName) // Or any name you prefer
                    .email(adminEmail)
                    .password(passwordEncoder.encode(adminPassword)) // IMPORTANT: Encode the password!
                    .role(Role.ADMIN) // Set the role to ADMIN
                    // createdAt will be set by @PrePersist
                    .build();

            // Save the admin user to the database
            userRepository.save(adminUser);

            log.info("Admin user created successfully with email: {}", adminEmail);
        } else {
            log.info("Admin user with email {} already exists.", adminEmail);
        }
    }
}