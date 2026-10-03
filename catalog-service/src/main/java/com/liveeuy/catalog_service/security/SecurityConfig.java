package com.liveeuy.catalog_service.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.liveeuy.catalog_service.config.MessageConstants;
import com.liveeuy.catalog_service.dto.ApiResponse;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Value("${spring.security.oauth2.resourceserver.jwt.jwk-set-uri:http://localhost:8080/.well-known/jwks.json}")
    private String jwkSetUri;

    @Value("${app.jwt.issuer:${spring.security.oauth2.resourceserver.jwt.issuer-uri:liveeuy-auth-service}}")
    private String expectedIssuer;

    @Value("${app.cors.allowed-origins:http://localhost:3000,http://localhost:5173}")
    private String[] allowedOrigins;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(Customizer.withDefaults())
            .headers(headers -> headers.frameOptions(frame -> frame.sameOrigin()))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Dokumentasi Swagger & OpenAPI
                .requestMatchers(
                    "/v3/api-docs/**",
                    "/swagger-ui/**",
                    "/swagger-ui.html",
                    "/swagger-resources/**",
                    "/webjars/**"
                ).permitAll()

                // Health check & Info Actuator publik untuk monitoring liveness/readiness
                .requestMatchers("/actuator/health", "/actuator/info", "/health/**").permitAll()

                // Endpoint Actuator sensitif (heapdump, env, beans, dll) wajib memiliki role ADMIN
                .requestMatchers("/actuator/**")
                    .hasAnyAuthority("ROLE_ADMIN", "ROLE_admin", "SCOPE_admin", "admin")

                // H2 Console (dev & test) wajib memiliki role ADMIN
                .requestMatchers("/h2-console/**")
                    .hasAnyAuthority("ROLE_ADMIN", "ROLE_admin", "SCOPE_admin", "admin")

                // Feed kurasi personalisasi user terautentikasi (berdasarkan JWT tier & profile)
                .requestMatchers(HttpMethod.GET, "/media/feed", "/api/v1/media/feed").authenticated()

                // Public Catalog Read (pengunjung dapat melihat katalog media, detail, & featured)
                .requestMatchers(HttpMethod.GET, "/media", "/media/**", "/seasons", "/seasons/**", "/api/v1/media/**", "/api/v1/seasons/**").permitAll()

                // Batch Endpoint untuk query media berdasarkan ID (inter-service / public)
                .requestMatchers(HttpMethod.POST, "/media/batch", "/api/v1/media/batch").permitAll()

                // Write Catalog (Create, Update, Delete) membutuhkan hak akses ADMIN
                .requestMatchers(HttpMethod.POST, "/media", "/media/**", "/seasons/**", "/api/v1/media/**", "/api/v1/seasons/**")
                    .hasAnyAuthority("ROLE_ADMIN", "ROLE_admin", "SCOPE_admin", "admin")
                .requestMatchers(HttpMethod.PUT, "/media/**", "/seasons/**", "/api/v1/media/**", "/api/v1/seasons/**")
                    .hasAnyAuthority("ROLE_ADMIN", "ROLE_admin", "SCOPE_admin", "admin")
                .requestMatchers(HttpMethod.DELETE, "/media/**", "/seasons/**", "/api/v1/media/**", "/api/v1/seasons/**")
                    .hasAnyAuthority("ROLE_ADMIN", "ROLE_admin", "SCOPE_admin", "admin")

                // Semua endpoint lainnya harus terautentikasi
                .anyRequest().authenticated()
            )
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt
                    .decoder(jwtDecoder())
                    .jwtAuthenticationConverter(jwtAuthenticationConverter())
                )
                .authenticationEntryPoint(customAuthenticationEntryPoint())
                .accessDeniedHandler(customAccessDeniedHandler())
            )
            .exceptionHandling(exceptions -> exceptions
                .authenticationEntryPoint(customAuthenticationEntryPoint())
                .accessDeniedHandler(customAccessDeniedHandler())
            );

        return http.build();
    }

    @Bean
    public JwtDecoder jwtDecoder() {
        NimbusJwtDecoder decoder = NimbusJwtDecoder.withJwkSetUri(jwkSetUri).build();

        OAuth2TokenValidator<Jwt> timestampValidator = new JwtTimestampValidator();
        OAuth2TokenValidator<Jwt> issuerValidator = new JwtClaimValidator<String>(
            JwtClaimNames.ISS,
            iss -> expectedIssuer == null || expectedIssuer.isBlank() || expectedIssuer.equals(iss)
        );

        OAuth2TokenValidator<Jwt> combinedValidator = new DelegatingOAuth2TokenValidator<>(timestampValidator, issuerValidator);
        decoder.setJwtValidator(combinedValidator);
        return decoder;
    }

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter defaultConverter = new JwtGrantedAuthoritiesConverter();

        Converter<Jwt, Collection<GrantedAuthority>> customAuthoritiesConverter = jwt -> {
            Collection<GrantedAuthority> authorities = new ArrayList<>(defaultConverter.convert(jwt));

            // Ekstrak claim 'role' (misal: "admin", "user")
            Object roleClaim = jwt.getClaim("role");
            if (roleClaim instanceof String role && !role.isBlank()) {
                authorities.add(new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()));
                authorities.add(new SimpleGrantedAuthority("ROLE_" + role));
                authorities.add(new SimpleGrantedAuthority(role));
                authorities.add(new SimpleGrantedAuthority("SCOPE_" + role));
            } else if (roleClaim instanceof Collection<?> roles) {
                for (Object r : roles) {
                    if (r != null) {
                        String roleStr = r.toString();
                        authorities.add(new SimpleGrantedAuthority("ROLE_" + roleStr.toUpperCase()));
                        authorities.add(new SimpleGrantedAuthority("ROLE_" + roleStr));
                        authorities.add(new SimpleGrantedAuthority(roleStr));
                        authorities.add(new SimpleGrantedAuthority("SCOPE_" + roleStr));
                    }
                }
            }

            // Ekstrak claim 'tier' (misal: "VIP Cinema Ultra")
            Object tierClaim = jwt.getClaim("tier");
            if (tierClaim instanceof String tier && !tier.isBlank()) {
                authorities.add(new SimpleGrantedAuthority("TIER_" + tier.toUpperCase().replace(" ", "_")));
            }

            return authorities;
        };

        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setPrincipalClaimName("sub");
        converter.setJwtGrantedAuthoritiesConverter(customAuthoritiesConverter);
        return converter;
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(allowedOrigins));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public AuthenticationEntryPoint customAuthenticationEntryPoint() {
        return (request, response, authException) -> {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            ApiResponse<Void> apiResponse = ApiResponse.error(
                HttpServletResponse.SC_UNAUTHORIZED,
                MessageConstants.Security.unauthorized(authException.getMessage())
            );
            response.getWriter().write(objectMapper.writeValueAsString(apiResponse));
        };
    }

    @Bean
    public AccessDeniedHandler customAccessDeniedHandler() {
        return (request, response, accessDeniedException) -> {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            ApiResponse<Void> apiResponse = ApiResponse.error(
                HttpServletResponse.SC_FORBIDDEN,
                MessageConstants.Security.FORBIDDEN
            );
            response.getWriter().write(objectMapper.writeValueAsString(apiResponse));
        };
    }
}
