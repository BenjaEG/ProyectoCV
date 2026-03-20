package ar.com.inaudi.CentroVecinal.modules.usuarios.dto.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AdminUserPasswordResetRequest(
        @NotBlank(message = "password es obligatorio")
        @Size(min = 8, message = "password debe tener al menos 8 caracteres")
        String password,
        boolean temporary
) {
}
