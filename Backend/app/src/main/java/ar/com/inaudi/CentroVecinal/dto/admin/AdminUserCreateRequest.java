package ar.com.inaudi.CentroVecinal.dto.admin;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.List;

public record AdminUserCreateRequest(
        @NotBlank(message = "username es obligatorio")
        String username,

        @NotBlank(message = "email es obligatorio")
        @Email(message = "email debe tener un formato valido")
        String email,

        @NotBlank(message = "firstName es obligatorio")
        String firstName,

        @NotBlank(message = "lastName es obligatorio")
        String lastName,

        boolean enabled,

        boolean emailVerified,

        @NotBlank(message = "password es obligatorio")
        @Size(min = 8, message = "password debe tener al menos 8 caracteres")
        String password,

        @NotEmpty(message = "roles es obligatorio")
        List<@NotBlank(message = "rol invalido") String> roles
) {
}
