package ar.com.inaudi.CentroVecinal.service;

import ar.com.inaudi.CentroVecinal.dto.admin.*;
import ar.com.inaudi.CentroVecinal.exception.BadRequestException;
import ar.com.inaudi.CentroVecinal.exception.ResourceNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.net.URI;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class AdminUserService {

    private static final List<String> SUPPORTED_ROLES = List.of("ROLE_VECINO", "ROLE_OPERADOR", "ROLE_ADMIN");

    private final KeycloakAdminClient keycloakAdminClient;

    public AdminUserService(KeycloakAdminClient keycloakAdminClient) {
        this.keycloakAdminClient = keycloakAdminClient;
    }

    public Page<AdminUserListItemResponse> listUsers(String search, Boolean enabled, String role, Pageable pageable) {
        validateRoleIfPresent(role);

        List<Map<String, Object>> users = StringUtils.hasText(role)
                ? keycloakAdminClient.getUsersByRole(role.trim())
                : keycloakAdminClient.getUsers(search, 0, Math.max(pageable.getPageSize() * 5, 100));

        List<AdminUserListItemResponse> filtered = users.stream()
                .map(this::toListItemResponse)
                .filter(user -> matchesSearch(user, search))
                .filter(user -> enabled == null || user.enabled() == enabled)
                .sorted(Comparator.comparing(AdminUserListItemResponse::username, Comparator.nullsLast(String::compareToIgnoreCase)))
                .toList();

        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), filtered.size());
        List<AdminUserListItemResponse> pageContent = start >= filtered.size() ? List.of() : filtered.subList(start, end);

        return new PageImpl<>(pageContent, pageable, filtered.size());
    }

    public AdminUserDetailResponse getUserById(String userId) {
        return toDetailResponse(getRequiredUserRepresentation(userId));
    }

    public AdminUserDetailResponse createUser(AdminUserCreateRequest request) {
        validateRoles(request.roles());

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("username", normalizeUsername(request.username()));
        payload.put("email", normalizeEmail(request.email()));
        payload.put("firstName", request.firstName().trim());
        payload.put("lastName", request.lastName().trim());
        payload.put("enabled", request.enabled());
        payload.put("emailVerified", request.emailVerified());
        payload.put("credentials", List.of(Map.of(
                "type", "password",
                "value", request.password(),
                "temporary", true
        )));

        URI location = keycloakAdminClient.createUser(payload);
        String userId = extractUserId(location);
        syncRoles(userId, request.roles());

        return getUserById(userId);
    }

    public AdminUserDetailResponse updateUser(String userId, AdminUserUpdateRequest request) {
        Map<String, Object> existingUser = getRequiredUserRepresentation(userId);
        existingUser.put("email", normalizeEmail(request.email()));
        existingUser.put("firstName", request.firstName().trim());
        existingUser.put("lastName", request.lastName().trim());
        existingUser.put("enabled", request.enabled());
        existingUser.put("emailVerified", request.emailVerified());

        keycloakAdminClient.updateUser(userId, sanitizeUserRepresentation(existingUser));
        return getUserById(userId);
    }

    public AdminUserDetailResponse updateUserStatus(String userId, AdminUserStatusUpdateRequest request) {
        Map<String, Object> existingUser = getRequiredUserRepresentation(userId);
        existingUser.put("enabled", request.enabled());

        keycloakAdminClient.updateUser(userId, sanitizeUserRepresentation(existingUser));
        return getUserById(userId);
    }

    public AdminUserDetailResponse updateUserRoles(String userId, AdminUserRolesUpdateRequest request) {
        validateRoles(request.roles());
        getRequiredUserRepresentation(userId);
        syncRoles(userId, request.roles());
        return getUserById(userId);
    }

    public void resetPassword(String userId, AdminUserPasswordResetRequest request) {
        getRequiredUserRepresentation(userId);

        keycloakAdminClient.resetPassword(userId, Map.of(
                "type", "password",
                "value", request.password(),
                "temporary", request.temporary()
        ));
    }

    public List<KeycloakRoleResponse> listAvailableRoles() {
        return SUPPORTED_ROLES.stream()
                .map(role -> new KeycloakRoleResponse(role, null))
                .toList();
    }

    private void syncRoles(String userId, List<String> requestedRoles) {
        List<String> normalizedRequestedRoles = requestedRoles.stream()
                .map(String::trim)
                .filter(StringUtils::hasText)
                .distinct()
                .toList();

        List<Map<String, Object>> currentRoles = keycloakAdminClient.getRealmRolesForUser(userId).stream()
                .filter(role -> SUPPORTED_ROLES.contains(role.get("name")))
                .toList();

        Set<String> currentRoleNames = currentRoles.stream()
                .map(role -> (String) role.get("name"))
                .collect(Collectors.toSet());

        List<Map<String, Object>> rolesToAdd = normalizedRequestedRoles.stream()
                .filter(role -> !currentRoleNames.contains(role))
                .map(keycloakAdminClient::getRealmRole)
                .toList();

        List<Map<String, Object>> rolesToRemove = currentRoles.stream()
                .filter(role -> !normalizedRequestedRoles.contains(role.get("name")))
                .toList();

        if (!rolesToAdd.isEmpty()) {
            keycloakAdminClient.addRealmRolesToUser(userId, rolesToAdd);
        }

        if (!rolesToRemove.isEmpty()) {
            keycloakAdminClient.removeRealmRolesFromUser(userId, rolesToRemove);
        }
    }

    private AdminUserListItemResponse toListItemResponse(Map<String, Object> user) {
        String userId = stringValue(user.get("id"));
        List<String> roles = userId != null
                ? keycloakAdminClient.getRealmRolesForUser(userId).stream()
                .map(role -> stringValue(role.get("name")))
                .filter(SUPPORTED_ROLES::contains)
                .sorted()
                .toList()
                : List.of();

        return new AdminUserListItemResponse(
                userId,
                stringValue(user.get("username")),
                stringValue(user.get("email")),
                stringValue(user.get("firstName")),
                stringValue(user.get("lastName")),
                booleanValue(user.get("enabled")),
                booleanValue(user.get("emailVerified")),
                longValue(user.get("createdTimestamp")),
                roles
        );
    }

    @SuppressWarnings("unchecked")
    private AdminUserDetailResponse toDetailResponse(Map<String, Object> user) {
        String userId = stringValue(user.get("id"));
        List<String> roles = keycloakAdminClient.getRealmRolesForUser(userId).stream()
                .map(role -> stringValue(role.get("name")))
                .filter(SUPPORTED_ROLES::contains)
                .sorted()
                .toList();

        Map<String, List<String>> attributes = Optional.ofNullable((Map<String, List<String>>) user.get("attributes"))
                .orElseGet(Map::of);

        return new AdminUserDetailResponse(
                userId,
                stringValue(user.get("username")),
                stringValue(user.get("email")),
                stringValue(user.get("firstName")),
                stringValue(user.get("lastName")),
                booleanValue(user.get("enabled")),
                booleanValue(user.get("emailVerified")),
                longValue(user.get("createdTimestamp")),
                roles,
                attributes
        );
    }

    private Map<String, Object> getRequiredUserRepresentation(String userId) {
        try {
            return keycloakAdminClient.getUser(userId);
        } catch (Exception ex) {
            if (ex.getMessage() != null && ex.getMessage().contains("404")) {
                throw new ResourceNotFoundException("No se encontro el usuario solicitado");
            }
            throw ex;
        }
    }

    private Map<String, Object> sanitizeUserRepresentation(Map<String, Object> existingUser) {
        Map<String, Object> sanitized = new LinkedHashMap<>();
        copyIfPresent(existingUser, sanitized, "id");
        copyIfPresent(existingUser, sanitized, "username");
        copyIfPresent(existingUser, sanitized, "email");
        copyIfPresent(existingUser, sanitized, "firstName");
        copyIfPresent(existingUser, sanitized, "lastName");
        copyIfPresent(existingUser, sanitized, "enabled");
        copyIfPresent(existingUser, sanitized, "emailVerified");
        copyIfPresent(existingUser, sanitized, "attributes");
        return sanitized;
    }

    private void copyIfPresent(Map<String, Object> source, Map<String, Object> target, String key) {
        if (source.containsKey(key)) {
            target.put(key, source.get(key));
        }
    }

    private boolean matchesSearch(AdminUserListItemResponse user, String search) {
        if (!StringUtils.hasText(search)) {
            return true;
        }

        String normalizedSearch = search.trim().toLowerCase();
        return Stream.of(user.username(), user.email(), user.firstName(), user.lastName())
                .filter(Objects::nonNull)
                .map(String::toLowerCase)
                .anyMatch(value -> value.contains(normalizedSearch));
    }

    private void validateRoleIfPresent(String role) {
        if (StringUtils.hasText(role) && !SUPPORTED_ROLES.contains(role.trim())) {
            throw new BadRequestException("Rol no soportado");
        }
    }

    private void validateRoles(List<String> roles) {
        List<String> invalidRoles = roles.stream()
                .map(String::trim)
                .filter(role -> !SUPPORTED_ROLES.contains(role))
                .toList();

        if (!invalidRoles.isEmpty()) {
            throw new BadRequestException("Roles invalidos: " + String.join(", ", invalidRoles));
        }
    }

    private String extractUserId(URI location) {
        if (location == null || location.getPath() == null) {
            throw new BadRequestException("Keycloak no devolvio la ubicacion del usuario creado");
        }

        String path = location.getPath();
        int lastSlash = path.lastIndexOf('/');
        if (lastSlash < 0 || lastSlash == path.length() - 1) {
            throw new BadRequestException("No se pudo determinar el id del usuario creado");
        }

        return path.substring(lastSlash + 1);
    }

    private String normalizeUsername(String username) {
        return username.trim().toLowerCase();
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase();
    }

    private String stringValue(Object value) {
        return value != null ? value.toString() : null;
    }

    private boolean booleanValue(Object value) {
        return value instanceof Boolean bool && bool;
    }

    private Long longValue(Object value) {
        if (value instanceof Number number) {
            return number.longValue();
        }
        return null;
    }
}
