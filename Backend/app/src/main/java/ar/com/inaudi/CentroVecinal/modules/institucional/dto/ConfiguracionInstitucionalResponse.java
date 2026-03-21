package ar.com.inaudi.CentroVecinal.modules.institucional.dto;

import java.time.LocalDateTime;

public record ConfiguracionInstitucionalResponse(
        Long id,
        String nombreCentroVecinal,
        String descripcionHome,
        String descripcionContacto,
        Boolean mostrarTelefono,
        String telefono,
        Boolean mostrarEmail,
        String email,
        Boolean mostrarDireccion,
        String direccion,
        Boolean mostrarHorarioAtencion,
        String horarioAtencion,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
