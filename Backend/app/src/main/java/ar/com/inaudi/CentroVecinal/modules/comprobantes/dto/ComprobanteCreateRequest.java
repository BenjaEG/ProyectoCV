package ar.com.inaudi.CentroVecinal.modules.comprobantes.dto;

import ar.com.inaudi.CentroVecinal.modules.comprobantes.model.OrigenComprobante;
import ar.com.inaudi.CentroVecinal.modules.comprobantes.model.TipoComprobante;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

public record ComprobanteCreateRequest(
        Long socioId,
        @NotNull TipoComprobante tipoComprobante,
        @NotNull OrigenComprobante origen,
        @NotNull LocalDate fechaEmision,
        @NotBlank String concepto,
        String descripcion,
        @NotNull @DecimalMin(value = "0.01") BigDecimal monto,
        String medioPago,
        String nombrePagador,
        String dniPagador,
        String referenciaOrigenId,
        String observaciones
) {
}
