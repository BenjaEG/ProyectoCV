package ar.com.inaudi.CentroVecinal;

import ar.com.inaudi.CentroVecinal.dto.admin.*;
import ar.com.inaudi.CentroVecinal.service.AdminUserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AdminUserApiIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AdminUserService adminUserService;

    @Test
    void nonAdminCannotAccessAdminUsers() throws Exception {
        mockMvc.perform(get("/api/admin/users")
                        .with(jwtFor("vecino-1", "vecino1", "ROLE_VECINO")))
                .andExpect(status().isForbidden());
    }

    @Test
    void adminCanListUsers() throws Exception {
        AdminUserListItemResponse user = new AdminUserListItemResponse(
                "user-1",
                "vecino1",
                "vecino1@test.local",
                "Vecino",
                "Uno",
                true,
                true,
                1L,
                List.of("ROLE_VECINO")
        );

        when(adminUserService.listUsers(eq("vec"), eq(true), eq("ROLE_VECINO"), any()))
                .thenReturn(new PageImpl<>(List.of(user), PageRequest.of(0, 10), 1));

        mockMvc.perform(get("/api/admin/users")
                        .param("search", "vec")
                        .param("enabled", "true")
                        .param("role", "ROLE_VECINO")
                        .with(jwtFor("admin-1", "admin", "ROLE_ADMIN")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value("user-1"))
                .andExpect(jsonPath("$.content[0].username").value("vecino1"))
                .andExpect(jsonPath("$.content[0].roles[0]").value("ROLE_VECINO"));
    }

    @Test
    void adminCanGetUserDetail() throws Exception {
        AdminUserDetailResponse response = new AdminUserDetailResponse(
                "user-1",
                "operador1",
                "operador1@test.local",
                "Operador",
                "Uno",
                true,
                true,
                1L,
                List.of("ROLE_OPERADOR"),
                Map.of()
        );

        when(adminUserService.getUserById("user-1")).thenReturn(response);

        mockMvc.perform(get("/api/admin/users/user-1")
                        .with(jwtFor("admin-1", "admin", "ROLE_ADMIN")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("operador1"))
                .andExpect(jsonPath("$.roles[0]").value("ROLE_OPERADOR"));
    }

    @Test
    void adminCanCreateUser() throws Exception {
        AdminUserDetailResponse response = new AdminUserDetailResponse(
                "user-99",
                "nuevo@test.local",
                "nuevo@test.local",
                "Nuevo",
                "Usuario",
                true,
                false,
                1L,
                List.of("ROLE_VECINO"),
                Map.of()
        );

        when(adminUserService.createUser(any())).thenReturn(response);

        String body = """
                {
                  "username": "nuevo@test.local",
                  "email": "nuevo@test.local",
                  "firstName": "Nuevo",
                  "lastName": "Usuario",
                  "enabled": true,
                  "emailVerified": false,
                  "password": "Password123",
                  "roles": ["ROLE_VECINO"]
                }
                """;

        mockMvc.perform(post("/api/admin/users")
                        .with(jwtFor("admin-1", "admin", "ROLE_ADMIN"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("user-99"))
                .andExpect(jsonPath("$.email").value("nuevo@test.local"));
    }

    @Test
    void createUserValidatesPayload() throws Exception {
        String body = """
                {
                  "username": "",
                  "email": "no-es-mail",
                  "firstName": "",
                  "lastName": "",
                  "enabled": true,
                  "emailVerified": false,
                  "password": "123",
                  "roles": []
                }
                """;

        mockMvc.perform(post("/api/admin/users")
                        .with(jwtFor("admin-1", "admin", "ROLE_ADMIN"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Validation error"));
    }

    @Test
    void adminCanUpdateRoles() throws Exception {
        AdminUserDetailResponse response = new AdminUserDetailResponse(
                "user-1",
                "admin1",
                "admin1@test.local",
                "Admin",
                "Uno",
                true,
                true,
                1L,
                List.of("ROLE_ADMIN"),
                Map.of()
        );

        when(adminUserService.updateUserRoles(eq("user-1"), any())).thenReturn(response);

        mockMvc.perform(patch("/api/admin/users/user-1/roles")
                        .with(jwtFor("admin-1", "admin", "ROLE_ADMIN"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                { "roles": ["ROLE_ADMIN"] }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.roles[0]").value("ROLE_ADMIN"));
    }

    @Test
    void adminCanResetPassword() throws Exception {
        mockMvc.perform(patch("/api/admin/users/user-1/password")
                        .with(jwtFor("admin-1", "admin", "ROLE_ADMIN"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                { "password": "NuevaPassword123", "temporary": true }
                                """))
                .andExpect(status().isOk());
    }

    @Test
    void adminCanListAvailableRoles() throws Exception {
        when(adminUserService.listAvailableRoles()).thenReturn(List.of(
                new KeycloakRoleResponse("ROLE_VECINO", null),
                new KeycloakRoleResponse("ROLE_OPERADOR", null),
                new KeycloakRoleResponse("ROLE_ADMIN", null)
        ));

        mockMvc.perform(get("/api/admin/users/roles")
                        .with(jwtFor("admin-1", "admin", "ROLE_ADMIN")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("ROLE_VECINO"))
                .andExpect(jsonPath("$[2].name").value("ROLE_ADMIN"));
    }

    private SecurityMockMvcRequestPostProcessors.JwtRequestPostProcessor jwtFor(
            String sub,
            String username,
            String... roles
    ) {
        return jwt()
                .jwt(jwt -> jwt
                        .subject(sub)
                        .claim("preferred_username", username)
                        .claim("roles", List.of(roles)))
                .authorities(List.of(roles).stream()
                        .map(SimpleGrantedAuthority::new)
                        .map(GrantedAuthority.class::cast)
                        .toList());
    }
}
