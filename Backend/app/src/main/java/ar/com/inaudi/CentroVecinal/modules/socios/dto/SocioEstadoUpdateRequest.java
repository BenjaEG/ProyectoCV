package ar.com.inaudi.CentroVecinal.modules.socios.dto;

import ar.com.inaudi.CentroVecinal.modules.socios.model.EstadoSocio;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record SocioEstadoUpdateRequest(
        @NotNull(message = "estadoSocio es obligatorio")
        EstadoSocio estadoSocio,
        LocalDate fechaBaja
) {
}
