package ar.com.inaudi.CentroVecinal.service;

import ar.com.inaudi.CentroVecinal.config.KeycloakAdminProperties;
import ar.com.inaudi.CentroVecinal.exception.ExternalServiceException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.net.URI;
import java.util.List;
import java.util.Map;

@Component
public class KeycloakAdminClient {

    private final RestClient restClient;
    private final KeycloakAdminProperties properties;

    public KeycloakAdminClient(RestClient keycloakAdminRestClient, KeycloakAdminProperties properties) {
        this.restClient = keycloakAdminRestClient;
        this.properties = properties;
    }

    public List<Map<String, Object>> getUsers(String search, Integer first, Integer max) {
        return getList(adminUri("/users?search=%s&first=%d&max=%d".formatted(
                encode(search),
                first != null ? first : 0,
                max != null ? max : 50
        )));
    }

    public List<Map<String, Object>> getUsersByRole(String roleName) {
        return getList(adminUri("/roles/%s/users".formatted(encodePath(roleName))));
    }

    public Map<String, Object> getUser(String userId) {
        return getMap(adminUri("/users/%s".formatted(encodePath(userId))));
    }

    public URI createUser(Map<String, Object> body) {
        try {
            return restClient.post()
                    .uri(adminUri("/users"))
                    .header(HttpHeaders.AUTHORIZATION, bearerToken())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .toBodilessEntity()
                    .getHeaders()
                    .getLocation();
        } catch (RestClientResponseException ex) {
            throw mapException("No se pudo crear el usuario en Keycloak", ex);
        }
    }

    public void updateUser(String userId, Map<String, Object> body) {
        executePut(adminUri("/users/%s".formatted(encodePath(userId))), body, "No se pudo actualizar el usuario en Keycloak");
    }

    public List<Map<String, Object>> getRealmRolesForUser(String userId) {
        return getList(adminUri("/users/%s/role-mappings/realm".formatted(encodePath(userId))));
    }

    public Map<String, Object> getRealmRole(String roleName) {
        return getMap(adminUri("/roles/%s".formatted(encodePath(roleName))));
    }

    public void addRealmRolesToUser(String userId, List<Map<String, Object>> roles) {
        executePost(adminUri("/users/%s/role-mappings/realm".formatted(encodePath(userId))), roles,
                "No se pudieron asignar roles al usuario");
    }

    public void removeRealmRolesFromUser(String userId, List<Map<String, Object>> roles) {
        try {
            restClient.method(org.springframework.http.HttpMethod.DELETE)
                    .uri(adminUri("/users/%s/role-mappings/realm".formatted(encodePath(userId))))
                    .header(HttpHeaders.AUTHORIZATION, bearerToken())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(roles)
                    .retrieve()
                    .toBodilessEntity();
        } catch (RestClientResponseException ex) {
            throw mapException("No se pudieron quitar roles al usuario", ex);
        }
    }

    public void resetPassword(String userId, Map<String, Object> body) {
        executePut(adminUri("/users/%s/reset-password".formatted(encodePath(userId))), body,
                "No se pudo resetear la password del usuario");
    }

    private void executePost(String uri, Object body, String message) {
        try {
            restClient.post()
                    .uri(uri)
                    .header(HttpHeaders.AUTHORIZATION, bearerToken())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .toBodilessEntity();
        } catch (RestClientResponseException ex) {
            throw mapException(message, ex);
        }
    }

    private void executePut(String uri, Object body, String message) {
        try {
            restClient.put()
                    .uri(uri)
                    .header(HttpHeaders.AUTHORIZATION, bearerToken())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .toBodilessEntity();
        } catch (RestClientResponseException ex) {
            throw mapException(message, ex);
        }
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> getList(String uri) {
        try {
            List<?> response = restClient.get()
                    .uri(uri)
                    .header(HttpHeaders.AUTHORIZATION, bearerToken())
                    .retrieve()
                    .body(List.class);
            return (List<Map<String, Object>>) response;
        } catch (RestClientResponseException ex) {
            throw mapException("No se pudo consultar Keycloak", ex);
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> getMap(String uri) {
        try {
            return restClient.get()
                    .uri(uri)
                    .header(HttpHeaders.AUTHORIZATION, bearerToken())
                    .retrieve()
                    .body(Map.class);
        } catch (RestClientResponseException ex) {
            throw mapException("No se pudo consultar Keycloak", ex);
        }
    }

    private String bearerToken() {
        MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
        formData.add("grant_type", "client_credentials");
        formData.add("client_id", properties.clientId());
        formData.add("client_secret", properties.clientSecret());

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restClient.post()
                    .uri("/realms/%s/protocol/openid-connect/token".formatted(properties.realm()))
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .body(formData)
                    .retrieve()
                    .body(Map.class);

            Object token = response != null ? response.get("access_token") : null;
            if (!(token instanceof String accessToken) || accessToken.isBlank()) {
                throw new ExternalServiceException("Keycloak no devolvio access_token para el cliente tecnico");
            }

            return "Bearer " + accessToken;
        } catch (RestClientResponseException ex) {
            throw mapException("No se pudo obtener el token administrativo de Keycloak", ex);
        }
    }

    private ExternalServiceException mapException(String message, RestClientResponseException ex) {
        String details = ex.getResponseBodyAsString();
        if (details == null || details.isBlank()) {
            return new ExternalServiceException(message + " (status " + ex.getStatusCode().value() + ")", ex);
        }
        return new ExternalServiceException(message + ": " + details, ex);
    }

    private String adminUri(String suffix) {
        return "/admin/realms/%s%s".formatted(properties.realm(), suffix);
    }

    private String encode(String value) {
        if (value == null) {
            return "";
        }
        return java.net.URLEncoder.encode(value, java.nio.charset.StandardCharsets.UTF_8);
    }

    private String encodePath(String value) {
        return encode(value).replace("+", "%20");
    }
}
