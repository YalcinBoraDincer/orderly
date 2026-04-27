package com.bora.orderly.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;


@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    // ── URL Sabitleri ──────────────────────────────────────────
    private static final String AUTH_ENDPOINTS       = "/api/auth/**";
    private static final String MENU_ENDPOINTS       = "/api/menu/**";
    private static final String CATEGORY_ENDPOINTS   = "/api/categories/**";
    private static final String KITCHEN_ENDPOINTS    = "/api/kitchen/**";
    private static final String SWAGGER_UI           = "/swagger-ui/**";
    private static final String SWAGGER_HTML         = "/swagger-ui.html";
    private static final String API_DOCS             = "/api-docs/**";
    private final CorsConfigurationSource corsConfigurationSource;
    // ───────────────────────────────────────────────────────────

    private final JwtAuthFilter jwtAuthFilter;
    private final UserDetailsService userDetailsService;
    private final JwtAuthEntryPoint jwtAuthEntryPoint;
    private final CustomAccessDeniedHandler accessDeniedHandler;
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource))

                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth

                        // Herkese açık
                        .requestMatchers(AUTH_ENDPOINTS).permitAll()
                        .requestMatchers(HttpMethod.GET, MENU_ENDPOINTS).permitAll()
                        .requestMatchers(HttpMethod.GET, CATEGORY_ENDPOINTS).permitAll()
                        .requestMatchers(SWAGGER_UI, SWAGGER_HTML, API_DOCS).permitAll()

                        // Sadece KITCHEN ve ADMIN
                        .requestMatchers(KITCHEN_ENDPOINTS).hasAnyRole("KITCHEN", "ADMIN")

                        // Geri kalanlar → giriş zorunlu
                        .anyRequest().authenticated()
                )
                .authenticationProvider(authenticationProvider())
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(jwtAuthEntryPoint)   // 401
                        .accessDeniedHandler(accessDeniedHandler))       // 403)

                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        // Spring Security 7 → UserDetailsService artık constructor'dan alınıyor
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
