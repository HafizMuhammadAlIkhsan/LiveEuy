package com.liveeuy.catalog_service.security;

import com.liveeuy.catalog_service.controller.MediaController;
import com.liveeuy.catalog_service.service.MediaService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.MediaType;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = MediaController.class)
@Import(SecurityConfig.class)
class SecurityConfigTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private MediaService mediaService;

    @MockitoBean
    private JwtDecoder jwtDecoder;

    @Test
    @DisplayName("GET /media harus dapat diakses publik tanpa token")
    void testPublicGetMediaEndpoint() throws Exception {
        Page<?> emptyPage = new PageImpl<>(Collections.emptyList());
        when(mediaService.getAllMedia(any(), any(), any(), any(), anyInt(), anyInt()))
                .thenReturn((Page) emptyPage);

        mockMvc.perform(get("/media"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("POST /media tanpa token harus mengembalikan status 401 Unauthorized")
    void testPostMediaWithoutTokenReturns401() throws Exception {
        mockMvc.perform(post("/media")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
    }

    @Test
    @DisplayName("POST /media dengan role USER harus mengembalikan status 403 Forbidden")
    void testPostMediaWithUserRoleReturns403() throws Exception {
        mockMvc.perform(post("/media")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_USER")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"Sample Movie\",\"type\":\"MOVIE\"}"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403));
    }

    @Test
    @DisplayName("POST /media dengan role ADMIN harus diizinkan (lolos security filter)")
    void testPostMediaWithAdminRoleIsAuthorized() throws Exception {
        mockMvc.perform(post("/media")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_ADMIN")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"Sample Movie\",\"type\":\"MOVIE\"}"))
                // Karena content JSON mungkin invalid/DTO validation, responsenya bukan 401 atau 403
                .andExpect(result -> {
                    int status = result.getResponse().getStatus();
                    org.junit.jupiter.api.Assertions.assertTrue(status != 401 && status != 403,
                            "Status code tidak boleh 401 atau 403 untuk ADMIN");
                });
    }

    @Autowired
    private JwtAuthenticationConverter jwtAuthenticationConverter;

    @Test
    @DisplayName("Token JWT dengan claim role='admin' otomatis dipetakan ke wewenang ADMIN")
    void testJwtRoleAdminClaimMapping() throws Exception {
        org.springframework.security.oauth2.jwt.Jwt jwtToken = org.springframework.security.oauth2.jwt.Jwt.withTokenValue("mock-token")
                .header("alg", "RS256")
                .claim("iss", "liveeuy-auth-service")
                .claim("sub", "usr-123")
                .claim("role", "admin")
                .claim("email", "admin@liveeuy.id")
                .build();

        var auth = jwtAuthenticationConverter.convert(jwtToken);
        org.junit.jupiter.api.Assertions.assertNotNull(auth);
        org.junit.jupiter.api.Assertions.assertTrue(
                auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN")),
                "Authority ROLE_ADMIN harus ada dari claim role=admin"
        );

        mockMvc.perform(post("/media")
                        .with(jwt().authorities(auth.getAuthorities()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"Sample Movie\",\"type\":\"MOVIE\"}"))
                .andExpect(result -> {
                    int status = result.getResponse().getStatus();
                    org.junit.jupiter.api.Assertions.assertTrue(status != 401 && status != 403,
                            "Token dengan claim role='admin' harus diizinkan");
                });
    }

    @Test
    @DisplayName("Token JWT dengan claim role='user' ditolak dengan status 403 Forbidden")
    void testJwtRoleUserClaimForbidden() throws Exception {
        org.springframework.security.oauth2.jwt.Jwt jwtToken = org.springframework.security.oauth2.jwt.Jwt.withTokenValue("mock-token")
                .header("alg", "RS256")
                .claim("iss", "liveeuy-auth-service")
                .claim("sub", "usr-123")
                .claim("role", "user")
                .claim("email", "user@liveeuy.id")
                .build();

        var auth = jwtAuthenticationConverter.convert(jwtToken);
        org.junit.jupiter.api.Assertions.assertNotNull(auth);
        org.junit.jupiter.api.Assertions.assertFalse(
                auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN")),
                "Authority ROLE_ADMIN tidak boleh ada untuk role=user"
        );

        mockMvc.perform(post("/media")
                        .with(jwt().authorities(auth.getAuthorities()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"Sample Movie\",\"type\":\"MOVIE\"}"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403));
    }

    @Test
    @DisplayName("GET /media/featured dapat diakses publik tanpa token")
    void testPublicGetFeaturedMedia() throws Exception {
        when(mediaService.getFeaturedMedia()).thenReturn(null);

        mockMvc.perform(get("/media/featured"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(200));
    }

    @Test
    @DisplayName("GET /media/feed tanpa token harus mengembalikan status 401 Unauthorized")
    void testGetFeedWithoutTokenReturns401() throws Exception {
        mockMvc.perform(get("/media/feed"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
    }

    @Test
    @DisplayName("GET /media/feed dengan token terautentikasi berhasil mengakses feed sesuai tier")
    void testGetFeedWithAuthenticatedTokenReturnsOk() throws Exception {
        Page<?> emptyPage = new PageImpl<>(Collections.emptyList());
        when(mediaService.getAllMedia(any(), any(), any(), any(), anyInt(), anyInt()))
                .thenReturn((Page) emptyPage);

        mockMvc.perform(get("/media/feed")
                        .with(jwt().jwt(builder -> builder
                                .claim("sub", "usr-018f3a5b-9b4e")
                                .claim("email", "hafiz@liveeuy.id")
                                .claim("name", "Hafiz Muhammad")
                                .claim("tier", "VIP Cinema Ultra")
                                .claim("role", "user")
                        )))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.message").value("Feed kurasi katalog untuk member VIP Cinema Ultra"));
    }

    @Test
    @DisplayName("Token JWT dengan claim tier dipetakan ke authority TIER_...")
    void testJwtTierClaimMapping() {
        org.springframework.security.oauth2.jwt.Jwt jwtToken = org.springframework.security.oauth2.jwt.Jwt.withTokenValue("mock-token")
                .header("alg", "RS256")
                .claim("iss", "liveeuy-auth-service")
                .claim("sub", "usr-018f3a5b-9b4e")
                .claim("tier", "VIP Cinema Ultra")
                .claim("role", "user")
                .build();

        var auth = jwtAuthenticationConverter.convert(jwtToken);
        org.junit.jupiter.api.Assertions.assertNotNull(auth);
        org.junit.jupiter.api.Assertions.assertTrue(
                auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("TIER_VIP_CINEMA_ULTRA")),
                "Authority TIER_VIP_CINEMA_ULTRA harus dipetakan dari claim tier"
        );
    }

    @Test
    @DisplayName("SecurityUtils berhasil mengekstrak user ID, email, nama, role, dan tier")
    void testSecurityUtilsHelper() {
        org.springframework.security.oauth2.jwt.Jwt jwtToken = org.springframework.security.oauth2.jwt.Jwt.withTokenValue("mock-token")
                .header("alg", "RS256")
                .claim("iss", "liveeuy-auth-service")
                .claim("sub", "usr-018f3a5b-9b4e")
                .claim("email", "hafiz@liveeuy.id")
                .claim("name", "Hafiz Muhammad")
                .claim("role", "admin")
                .claim("tier", "VIP Cinema Ultra")
                .build();

        var auth = jwtAuthenticationConverter.convert(jwtToken);
        org.springframework.security.core.context.SecurityContextHolder.getContext().setAuthentication(auth);

        try {
            org.junit.jupiter.api.Assertions.assertEquals("usr-018f3a5b-9b4e", SecurityUtils.getCurrentUserId().orElse(null));
            org.junit.jupiter.api.Assertions.assertEquals("hafiz@liveeuy.id", SecurityUtils.getCurrentUserEmail().orElse(null));
            org.junit.jupiter.api.Assertions.assertEquals("Hafiz Muhammad", SecurityUtils.getCurrentUserName().orElse(null));
            org.junit.jupiter.api.Assertions.assertEquals("admin", SecurityUtils.getCurrentUserRole().orElse(null));
            org.junit.jupiter.api.Assertions.assertEquals("VIP Cinema Ultra", SecurityUtils.getCurrentUserTier().orElse(null));
            org.junit.jupiter.api.Assertions.assertTrue(SecurityUtils.isAdmin());
            org.junit.jupiter.api.Assertions.assertTrue(SecurityUtils.hasTier("VIP Cinema Ultra"));
            org.junit.jupiter.api.Assertions.assertFalse(SecurityUtils.hasTier("VIP Standard"));
        } finally {
            org.springframework.security.core.context.SecurityContextHolder.clearContext();
        }
    }
}
