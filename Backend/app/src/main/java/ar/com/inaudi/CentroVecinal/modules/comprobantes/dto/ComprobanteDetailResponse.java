package ar.com.inaudi.CentroVecinal.modules.comprobantes.dto;

import ar.com.inaudi.CentroVecinal.modules.comprobantes.model.EstadoComprobante;
import ar.com.inaudi.CentroVecinal.modules.comprobantes.model.OrigenComprobante;
import ar.com.inaudi.CentroVecinal.modules.comprobantes.model.TipoComprobante;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record ComprobanteDetailResponse(
        Long id,
        String numero,
        TipoComprobante tipoComprobante,
        EstadoComprobante estado,
        OrigenComprobante origen,
        LocalDate fechaEmision,
        String concepto,
        String descripcion,
        BigDecimal monto,
        String medioPago,
        Long socioId,
        String socioNombreCompleto,
        String socioDni,
        String nombrePagador,
        String dniPagador,
        String referenciaOrigenId,
        String observaciones,
        String createdByUsername,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        LocalDateTime anulledAt
) {
}
