package ar.com.inaudi.CentroVecinal.modules.socios.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;

public record CuotaSocioCreateRequest(
        @NotBlank(message = "periodo es obligatorio")
        @Size(min = 7, max = 7, message = "periodo debe tener formato yyyy-MM")
        String periodo,

        @NotNull(message = "monto es obligatorio")
        @DecimalMin(value = "0.01", message = "monto debe ser mayor a 0")
        BigDecimal monto,

        @NotNull(message = "fechaVencimiento es obligatoria")
        LocalDate fechaVencimiento,

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
