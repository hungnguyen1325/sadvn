package com.app.backend.configs;

import com.app.backend.core.jwt.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.*;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    @Profile("dev")
    public SecurityFilterChain filterChainDev(HttpSecurity http, CorsConfigurationSource corsConfigurationSourceDev) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSourceDev))
            .csrf(AbstractHttpConfigurer::disable)
            .authorizeHttpRequests(auth -> auth
                    .anyRequest().permitAll()
            );
        return http.build();
    }

    @Bean
    @Profile("!dev")
    public SecurityFilterChain filterChainProd(HttpSecurity http, CorsConfigurationSource corsConfigurationSourceProd) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSourceProd))
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(session ->
                    session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth ->
                auth.requestMatchers(
                        "/api/v1/health/ping",
                        "/api/v1/auth/login"
                    ).permitAll()
                    .requestMatchers(
                        "/api/v1/business",
                        "/api/v1/business/search",
                        "/api/v1/business/update",
                        "/api/v1/business/delete/*",
                        "/api/v1/customer/**"
                    ).authenticated()
                    .requestMatchers(
                        "/api/v1/business/*"
                    ).permitAll()
                    .anyRequest().authenticated())
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}