package com.logistics.config;

import com.logistics.security.JwtAuthenticationFilter;
import com.logistics.security.UserDetailsServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final UserDetailsServiceImpl userDetailsService;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of(
                "http://localhost:*",
                "http://127.0.0.1:*"
        ));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, CorsConfigurationSource corsConfigurationSource) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/register", "/api/auth/login").permitAll()
                        // Native WebSocket upgrade cannot send JWT in HTTP headers; auth runs on STOMP CONNECT
                        // (see WebSocketAuthChannelInterceptor). Without permitAll, handshake returns 403.
                        .requestMatchers("/ws", "/ws/**").permitAll()
                        .requestMatchers("/api/shipments/track/**").permitAll()
                        // Shipper: view bids on own shipments and accept a bid (service layer enforces ownership)
                        .requestMatchers(HttpMethod.GET, "/api/bids/shipment/**").hasRole("SHIPPER")
                        .requestMatchers(HttpMethod.POST, "/api/bids/*/accept").hasRole("SHIPPER")
                        // Carrier: place bid and list own bids
                        .requestMatchers(HttpMethod.POST, "/api/bids").hasRole("CARRIER")
                        .requestMatchers(HttpMethod.GET, "/api/bids").hasRole("CARRIER")
                        // Tracking: carrier posts updates; shipper or carrier can read history (service enforces)
                        .requestMatchers(HttpMethod.GET, "/api/tracking/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/tracking/**").hasRole("CARRIER")
                        .requestMatchers("/api/shipments/**").hasRole("SHIPPER")
                        .requestMatchers("/api/operations/**").hasRole("CARRIER")
                        .requestMatchers("/api/carrier/**").hasRole("CARRIER")
                        .requestMatchers("/api/marketplace/**").hasRole("CARRIER")
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .anyRequest().authenticated()
                )
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        var provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
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
