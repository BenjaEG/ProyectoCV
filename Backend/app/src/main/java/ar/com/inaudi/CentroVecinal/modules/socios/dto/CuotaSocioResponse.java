package ar.com.inaudi.CentroVecinal.modules.socios.dto;

import ar.com.inaudi.CentroVecinal.modules.socios.model.EstadoPagoCuota;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record CuotaSocioResponse(
        Long id,
        Long socioId,
        String periodo,
        BigDecimal monto,
        EstadoPagoCuota estadoPago,
        LocalDate fechaVencimiento,
        LocalDate fechaPago,
        String tipoComprobante,
        String numeroComprobante,
        String medioPago,
        String observacion,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
