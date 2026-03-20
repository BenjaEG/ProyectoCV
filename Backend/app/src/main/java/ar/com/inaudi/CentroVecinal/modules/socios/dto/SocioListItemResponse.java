package ar.com.inaudi.CentroVecinal.modules.socios.dto;

import ar.com.inaudi.CentroVecinal.modules.socios.model.EstadoSocio;
import ar.com.inaudi.CentroVecinal.modules.socios.model.TipoSocio;
import java.time.LocalDate;

public record SocioListItemResponse(
        Long id,
        String userId,
        String nombre,
        String apellido,
        String nombreCompleto,
        String dni,
        String domicilio,
        LocalDate fechaAlta,
        LocalDate fechaBaja,
        TipoSocio tipoSocio,
        EstadoSocio estadoSocio
) {
}
