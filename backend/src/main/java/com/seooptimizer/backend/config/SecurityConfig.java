package com.seooptimizer.backend.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import com.seooptimizer.backend.security.CustomOAuth2UserService;
import com.seooptimizer.backend.security.JwtAuthenticationFilter;
import com.seooptimizer.backend.security.OAuth2SuccessHandler;
import com.seooptimizer.backend.security.RestAuthenticationEntryPoint;

import java.util.List;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final CustomOAuth2UserService customOAuth2UserService;
    private final OAuth2SuccessHandler oAuth2SuccessHandler;
    private final RestAuthenticationEntryPoint restAuthenticationEntryPoint;
    private final CorsConfig corsConfig;

    private CookieCsrfTokenRepository csrfTokenRepository() {
        CookieCsrfTokenRepository repo = CookieCsrfTokenRepository.withHttpOnlyFalse();
        // Keep the standards we use on the frontend:
        repo.setCookieName("XSRF-TOKEN");       // cookie name
        repo.setHeaderName("X-CSRF-TOKEN");     // header name that Axios will send
        repo.setCookiePath("/");                // send cookie everywhere
        return repo;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // CSRF
            .csrf(csrf -> csrf
                .csrfTokenRepository(csrfTokenRepository())
                // Don’t require CSRF for login/register (no session yet).
                .ignoringRequestMatchers(
                    new AntPathRequestMatcher("/api/auth/login", "POST"),
                    new AntPathRequestMatcher("/api/auth/register", "POST")
                )
            )
            // CORS
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            // Stateless JWT
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            // 401 handler
            .exceptionHandling(exception -> exception.authenticationEntryPoint(restAuthenticationEntryPoint))
            // Authorization
            .authorizeHttpRequests(auth -> auth
                // OPEN endpoints
                .requestMatchers(HttpMethod.GET, "/api/csrf-token").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/auth/register").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/auth/refresh-token").permitAll() // no auth, but CSRF applies
                .requestMatchers("/", "/login/**", "/oauth2/**", "/actuator/**", "/site.webmanifest").permitAll()

                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                // PROTECTED endpoints
                .requestMatchers("/api/auth/me").authenticated()

                // Everything else requires auth
                .anyRequest().authenticated()
            )
            // OAuth2 (if you use it)
            .oauth2Login(oauth -> oauth
                .userInfoEndpoint(userInfo -> userInfo.userService(customOAuth2UserService))
                .successHandler(oAuth2SuccessHandler)
            )
            // JWT filter
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // Dedicated CORS filter (optional but handy for non-browser clients too)
    @Bean
    public CorsFilter corsFilter() {
        return new CorsFilter(corsConfigurationSource());
    }

    private UrlBasedCorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        // IMPORTANT: Must be explicit domains when credentials=true
        config.setAllowedOrigins(corsConfig.getAllowedOrigins()); // e.g. ["https://app.example.com"]
        config.setAllowedMethods(corsConfig.getAllowedMethods()); // e.g. ["GET","POST","PUT","DELETE","OPTIONS"]
        config.setAllowedHeaders(List.of("Content-Type", "Authorization", "X-CSRF-TOKEN"));
        config.setAllowCredentials(true);
        // Optional:
        // config.setExposedHeaders(List.of("Set-Cookie"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
