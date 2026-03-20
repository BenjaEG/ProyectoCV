package ar.com.inaudi.CentroVecinal.modules.socios.dto;

import ar.com.inaudi.CentroVecinal.modules.socios.model.TipoSocio;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record SocioUpdateRequest(
        @NotBlank(message = "nombre es obligatorio")
        @Size(max = 120, message = "nombre no puede superar 120 caracteres")
        String nombre,

        @NotBlank(message = "apellido es obligatorio")
        @Size(max = 120, message = "apellido no puede superar 120 caracteres")
        String apellido,

        @NotBlank(message = "dni es obligatorio")
        @Size(max = 32, message = "dni no puede superar 32 caracteres")
        String dni,

        @NotBlank(message = "domicilio es obligatorio")
        @Size(max = 255, message = "domicilio no puede superar 255 caracteres")
        String domicilio,

        @NotNull(message = "fechaAlta es obligatoria")
        LocalDate fechaAlta,

        @NotNull(message = "tipoSocio es obligatorio")
        TipoSocio tipoSocio,

        @Size(max = 2000, message = "observaciones no puede superar 2000 caracteres")
        String observaciones
) {
}
