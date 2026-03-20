package ar.com.inaudi.CentroVecinal.modules.usuarios.dto.admin;

import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record AdminUserRolesUpdateRequest(
        @NotEmpty(message = "roles es obligatorio")
        List<String> roles
) {
}
