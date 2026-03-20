package ar.com.inaudi.CentroVecinal.modules.socios.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record CuotaSocioPagoRequest(
        @NotNull(message = "fechaPago es obligatoria")
        LocalDate fechaPago,

        @Size(max = 80, message = "tipoComprobante no puede superar 80 caracteres")
        String tipoComprobante,

        @Size(max = 80, message = "numeroComprobante no puede superar 80 caracteres")
        String numeroComprobante,

        @Size(max = 80, message = "medioPago no puede superar 80 caracteres")
        String medioPago,

        @Size(max = 2000, message = "observacion no puede superar 2000 caracteres")
        String observacion
) {
}
