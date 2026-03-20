package ar.com.inaudi.CentroVecinal.modules.socios.mapper;

import ar.com.inaudi.CentroVecinal.modules.socios.dto.CuotaSocioResponse;
import ar.com.inaudi.CentroVecinal.modules.socios.dto.SocioDetailResponse;
import ar.com.inaudi.CentroVecinal.modules.socios.dto.SocioListItemResponse;
import ar.com.inaudi.CentroVecinal.modules.socios.model.CuotaSocio;
import ar.com.inaudi.CentroVecinal.modules.socios.model.Socio;

public final class SocioMapper {

    private SocioMapper() {
    }

    public static SocioListItemResponse toListItem(Socio socio) {
        return new SocioListItemResponse(
                socio.getId(),
                socio.getUserId(),
                socio.getNombre(),
                socio.getApellido(),
                nombreCompleto(socio),
                socio.getDni(),
                socio.getDomicilio(),
                socio.getFechaAlta(),
                socio.getFechaBaja(),
                socio.getTipoSocio(),
                socio.getEstadoSocio()
        );
    }

    public static SocioDetailResponse toDetail(Socio socio) {
        return new SocioDetailResponse(
                socio.getId(),
                socio.getUserId(),
                socio.getNombre(),
                socio.getApellido(),
                nombreCompleto(socio),
                socio.getDni(),
                socio.getDomicilio(),
                socio.getFechaAlta(),
                socio.getFechaBaja(),
                socio.getTipoSocio(),
                socio.getEstadoSocio(),
                socio.getObservaciones(),
                socio.getCreatedAt(),
                socio.getUpdatedAt()
        );
    }

    public static CuotaSocioResponse toResponse(CuotaSocio cuota) {
        return new CuotaSocioResponse(
                cuota.getId(),
                cuota.getSocio().getId(),
                cuota.getPeriodo(),
                cuota.getMonto(),
                cuota.getEstadoPago(),
                cuota.getFechaVencimiento(),
                cuota.getFechaPago(),
                cuota.getTipoComprobante(),
                cuota.getNumeroComprobante(),
                cuota.getMedioPago(),
                cuota.getObservacion(),
                cuota.getCreatedAt(),
                cuota.getUpdatedAt()
        );
    }

    private static String nombreCompleto(Socio socio) {
        return (socio.getNombre() + " " + socio.getApellido()).trim();
    }
}
