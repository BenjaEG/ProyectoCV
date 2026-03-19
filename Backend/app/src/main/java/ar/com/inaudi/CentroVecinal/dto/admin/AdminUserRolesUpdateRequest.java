package ar.com.inaudi.CentroVecinal.dto.admin;

import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record AdminUserRolesUpdateRequest(
        @NotEmpty(message = "roles es obligatorio")
        List<String> roles
) {
}
