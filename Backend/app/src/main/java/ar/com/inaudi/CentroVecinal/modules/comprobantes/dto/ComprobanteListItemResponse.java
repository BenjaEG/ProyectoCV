package ar.com.inaudi.CentroVecinal.modules.comprobantes.dto;

import ar.com.inaudi.CentroVecinal.modules.comprobantes.model.EstadoComprobante;
import ar.com.inaudi.CentroVecinal.modules.comprobantes.model.OrigenComprobante;
import ar.com.inaudi.CentroVecinal.modules.comprobantes.model.TipoComprobante;
import java.math.BigDecimal;
import java.time.LocalDate;

public record ComprobanteListItemResponse(
        Long id,
        String numero,
        TipoComprobante tipoComprobante,
        EstadoComprobante estado,
        OrigenComprobante origen,
        LocalDate fechaEmision,
        String concepto,
        BigDecimal monto,
        Long socioId,
        String socioNombreCompleto,
        String nombrePagador
) {
}
