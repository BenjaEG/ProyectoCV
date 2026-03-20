package ar.com.inaudi.CentroVecinal.modules.comprobantes.mapper;

import ar.com.inaudi.CentroVecinal.modules.comprobantes.dto.ComprobanteDetailResponse;
import ar.com.inaudi.CentroVecinal.modules.comprobantes.dto.ComprobanteListItemResponse;
import ar.com.inaudi.CentroVecinal.modules.comprobantes.model.Comprobante;
import ar.com.inaudi.CentroVecinal.modules.socios.model.Socio;

public final class ComprobanteMapper {

    private ComprobanteMapper() {
    }

    public static ComprobanteListItemResponse toListItem(Comprobante comprobante) {
        Socio socio = comprobante.getSocio();

        return new ComprobanteListItemResponse(
                comprobante.getId(),
                comprobante.getNumero(),
                comprobante.getTipoComprobante(),
                comprobante.getEstado(),
                comprobante.getOrigen(),
                comprobante.getFechaEmision(),
                comprobante.getConcepto(),
                comprobante.getMonto(),
                socio != null ? socio.getId() : null,
                socio != null ? nombreCompleto(socio) : null,
                comprobante.getNombrePagador()
        );
    }

    public static ComprobanteDetailResponse toDetail(Comprobante comprobante) {
        Socio socio = comprobante.getSocio();

        return new ComprobanteDetailResponse(
                comprobante.getId(),
                comprobante.getNumero(),
                comprobante.getTipoComprobante(),
                comprobante.getEstado(),
                comprobante.getOrigen(),
                comprobante.getFechaEmision(),
                comprobante.getConcepto(),
                comprobante.getDescripcion(),
                comprobante.getMonto(),
                comprobante.getMedioPago(),
                socio != null ? socio.getId() : null,
                socio != null ? nombreCompleto(socio) : null,
                socio != null ? socio.getDni() : null,
                comprobante.getNombrePagador(),
                comprobante.getDniPagador(),
                comprobante.getReferenciaOrigenId(),
                comprobante.getObservaciones(),
                comprobante.getCreatedByUsername(),
                comprobante.getCreatedAt(),
                comprobante.getUpdatedAt(),
                comprobante.getAnulledAt()
        );
    }

    private static String nombreCompleto(Socio socio) {
        return (socio.getNombre() + " " + socio.getApellido()).trim();
    }
}
