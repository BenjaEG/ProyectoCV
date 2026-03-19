package ar.com.inaudi.CentroVecinal.dto.admin;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record AdminUserUpdateRequest(
        @NotBlank(message = "email es obligatorio")
        @Email(message = "email debe tener un formato valido")
        String email,

        @NotBlank(message = "firstName es obligatorio")
        String firstName,

        @NotBlank(message = "lastName es obligatorio")
        String lastName,

        boolean enabled,

        boolean emailVerified
) {
}
