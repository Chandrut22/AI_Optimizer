// backend/src/main/java/com/seooptimizer/backend/security/CustomOAuth2UserService.java

package com.seooptimizer.backend.security;

import java.util.Optional;

import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import com.seooptimizer.backend.enumtype.AuthProvider;
import com.seooptimizer.backend.enumtype.Role;
import com.seooptimizer.backend.model.User;
import com.seooptimizer.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oauth2User = super.loadUser(userRequest);

        String email = oauth2User.getAttribute("email");
        String name = oauth2User.getAttribute("name");
        AuthProvider provider = AuthProvider.valueOf(userRequest.getClientRegistration().getRegistrationId().toUpperCase()); // e.g., GOOGLE

        Optional<User> userOptional = userRepository.findByEmail(email);
        User user;

        if (userOptional.isPresent()) {
            user = userOptional.get();
            // Update existing user details if necessary
            if (user.getProvider() != provider) {
                // Handle case where user tries to login with different OAuth provider
                throw new OAuth2AuthenticationException("Looks like you're signed up with " + user.getProvider() + " account. Please use your " + user.getProvider() + " account to login.");
            }
            user.setName(name); // Update name in case it changed
            // You might want to update other fields here as well
            userRepository.save(user);
        } else {
            // Register new user
            user = User.builder()
                    .email(email)
                    .name(name)
                    .provider(provider)
                    .role(Role.USER) // Assign a default role
                    .enabled(true)
                    .usageCount(0)
                    .credits(0)
                    .build();
            userRepository.save(user);
        }
        // Return a custom OAuth2User implementation if you need to store more details
        // For simplicity, we can return the default one for now, as OAuth2SuccessHandler
        // will fetch the user from the DB again.
        return oauth2User; // Or your custom UserPrincipal/UserDetails implementation
    }
}