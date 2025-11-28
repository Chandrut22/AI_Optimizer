package com.auth.backend.service;

import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.InternalAuthenticationServiceException;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.oidc.user.OidcUser; // Import
import org.springframework.stereotype.Service;

import com.auth.backend.enums.AuthProvider;
import com.auth.backend.enums.Role;
import com.auth.backend.model.User;
import com.auth.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CustomOidcUserService extends OidcUserService {

    private static final Logger log = LoggerFactory.getLogger(CustomOidcUserService.class);
    private final UserRepository userRepository;

    @Override
    public OidcUser loadUser(OidcUserRequest userRequest) throws OAuth2AuthenticationException {
        OidcUser oidcUser = super.loadUser(userRequest);

        try {
            processOidcUser(oidcUser);
            
            return oidcUser;
        } catch (Exception ex) {
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
            User user = userOptional.get();
            
            if (user.getAuthProvider() != AuthProvider.GOOGLE) {
                log.warn("User with email {} already exists with {} provider.", email, user.getAuthProvider());
                throw new OAuth2AuthenticationException(
                    "User with email " + email + " already exists. Please log in with your " +
                    user.getAuthProvider() + " account."
                );
            }
            
            log.debug("Found existing Google user: {}", email);
            return user;
        } else {
            log.info("Creating new user from Google login: {}", email);
            
            User newUser = User.builder()
                    .email(email)
                    .name(oidcUser.getFullName())
                    .authProvider(AuthProvider.GOOGLE) 
                    .role(Role.USER)
                    .build();
            
            return userRepository.save(newUser);
        }
    }
}