package ar.com.inaudi.CentroVecinal.modules.institucional.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ConfiguracionInstitucionalRequest(
        @NotBlank String nombreCentroVecinal,
        @NotBlank String descripcionHome,
        @NotBlank String descripcionContacto,
        @NotNull Boolean mostrarTelefono,
        String telefono,
        @NotNull Boolean mostrarEmail,
        String email,
        @NotNull Boolean mostrarDireccion,
        String direccion,
        @NotNull Boolean mostrarHorarioAtencion,
        String horarioAtencion
) {
}
