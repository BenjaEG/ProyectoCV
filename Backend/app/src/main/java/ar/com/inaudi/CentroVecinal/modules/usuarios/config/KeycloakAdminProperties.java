package ar.com.inaudi.CentroVecinal.modules.usuarios.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.keycloak.admin")
public record KeycloakAdminProperties(
        String baseUrl,
        String realm,
        String clientId,
        String clientSecret
) {
}
