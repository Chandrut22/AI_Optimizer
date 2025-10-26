package com.auth.backend.service;

import com.auth.backend.enums.AuthProvider;
import com.auth.backend.enums.Role;
import com.auth.backend.model.User;
import com.auth.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.InternalAuthenticationServiceException; // Import
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CustomOidcUserService extends OidcUserService {

    private static final Logger log = LoggerFactory.getLogger(CustomOidcUserService.class);
    private final UserRepository userRepository;

    @Override
    public OidcUser loadUser(OidcUserRequest userRequest) throws OAuth2AuthenticationException {
        // 1. Delegate to the default service to fetch the OidcUser from Google
        OidcUser oidcUser = super.loadUser(userRequest);

        try {
            // 2. Process the OidcUser: Find or create a corresponding user in your local DB
            processOidcUser(oidcUser);
            
            // 3. Return the original oidcUser
            // Your OAuth2LoginSuccessHandler will use the email from this principal
            // to query your database again and get the full User entity.
            return oidcUser;
        } catch (Exception ex) {
            // Catch internal exceptions (like our email conflict) and re-throw them
            // so Spring Security's OAuth2 flow can handle them.
            throw new InternalAuthenticationServiceException(ex.getMessage(), ex.getCause());
        }
    }

    /**
     * Finds an existing user by email or creates a new one.
     * This ensures every Google login corresponds to a record in your local user table.
     */
    private User processOidcUser(OidcUser oidcUser) {
        String email = oidcUser.getEmail();
        Optional<User> userOptional = userRepository.findByEmail(email);

        if (userOptional.isPresent()) {
            // --- User already exists ---
            User user = userOptional.get();
            
            // --- FIX: Handle Auth Provider Conflict ---
            if (user.getAuthProvider() != AuthProvider.GOOGLE) {
                // User already exists but signed up locally (or with another provider)
                log.warn("User with email {} already exists with {} provider.", email, user.getAuthProvider());
                // Throw an exception to stop the authentication flow
                // Your frontend can catch this error and display a message
                throw new OAuth2AuthenticationException(
                    "User with email " + email + " already exists. Please log in with your " +
                    user.getAuthProvider() + " account."
                );
            }
            // -----------------------------------------
            
            log.debug("Found existing Google user: {}", email);
            return user;
        } else {
            // --- New user - create one ---
            log.info("Creating new user from Google login: {}", email);
            
            // Ensure your User model's password field is nullable for this to work
            User newUser = User.builder()
                    .email(email)
                    .name(oidcUser.getFullName())
                    .authProvider(AuthProvider.GOOGLE) // Set the provider
                    .role(Role.USER) // Default role for new users
                    // Password field is left null
                    .build();
            
            return userRepository.save(newUser);
        }
    }
}