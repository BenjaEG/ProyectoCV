package ar.com.inaudi.CentroVecinal.modules.comprobantes.service;

import ar.com.inaudi.CentroVecinal.dto.common.PageResponseDTO;
import ar.com.inaudi.CentroVecinal.exception.BadRequestException;
import ar.com.inaudi.CentroVecinal.exception.ResourceNotFoundException;
import ar.com.inaudi.CentroVecinal.modules.comprobantes.dto.ComprobanteCreateRequest;
import ar.com.inaudi.CentroVecinal.modules.comprobantes.dto.ComprobanteDetailResponse;
import ar.com.inaudi.CentroVecinal.modules.comprobantes.dto.ComprobanteListItemResponse;
import ar.com.inaudi.CentroVecinal.modules.comprobantes.dto.ComprobanteUpdateRequest;
import ar.com.inaudi.CentroVecinal.modules.comprobantes.mapper.ComprobanteMapper;
import ar.com.inaudi.CentroVecinal.modules.comprobantes.model.Comprobante;
import ar.com.inaudi.CentroVecinal.modules.comprobantes.model.EstadoComprobante;
import ar.com.inaudi.CentroVecinal.modules.comprobantes.model.OrigenComprobante;
import ar.com.inaudi.CentroVecinal.modules.comprobantes.model.TipoComprobante;
import ar.com.inaudi.CentroVecinal.modules.comprobantes.repository.ComprobanteRepository;
import ar.com.inaudi.CentroVecinal.modules.comprobantes.repository.ComprobanteSpecifications;
import ar.com.inaudi.CentroVecinal.modules.socios.model.CuotaSocio;
import ar.com.inaudi.CentroVecinal.modules.socios.model.Socio;
import ar.com.inaudi.CentroVecinal.modules.socios.repository.CuotaSocioRepository;
import ar.com.inaudi.CentroVecinal.modules.socios.repository.SocioRepository;
import ar.com.inaudi.CentroVecinal.security.CurrentUser;
import java.time.LocalDateTime;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ComprobanteService {

    private final ComprobanteRepository comprobanteRepository;
    private final SocioRepository socioRepository;
    private final CuotaSocioRepository cuotaSocioRepository;

    public ComprobanteService(
            ComprobanteRepository comprobanteRepository,
            SocioRepository socioRepository,
            CuotaSocioRepository cuotaSocioRepository
    ) {
        this.comprobanteRepository = comprobanteRepository;
        this.socioRepository = socioRepository;
        this.cuotaSocioRepository = cuotaSocioRepository;
    }

    @Transactional(readOnly = true)
    public PageResponseDTO<ComprobanteListItemResponse> getComprobantes(
            String q,
            EstadoComprobante estado,
            TipoComprobante tipo,
            OrigenComprobante origen,
            Long socioId,
            Pageable pageable
    ) {
        Specification<Comprobante> specification = Specification.allOf(
                ComprobanteSpecifications.qContains(q),
                ComprobanteSpecifications.hasEstado(estado),
                ComprobanteSpecifications.hasTipo(tipo),
                ComprobanteSpecifications.hasOrigen(origen),
                ComprobanteSpecifications.hasSocioId(socioId)
        );

        Page<Comprobante> page = comprobanteRepository.findAll(specification, pageable);

        return PageResponseDTO.<ComprobanteListItemResponse>builder()
                .content(page.getContent().stream().map(ComprobanteMapper::toListItem).toList())
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .build();
    }

    @Transactional(readOnly = true)
    public ComprobanteDetailResponse getComprobanteById(Long comprobanteId) {
        return ComprobanteMapper.toDetail(findExistingComprobante(comprobanteId));
    }

    @Transactional(readOnly = true)
    public ComprobanteDetailResponse getCurrentNeighborComprobanteByCuotaId(CurrentUser currentUser, Long cuotaId) {
        if (!currentUser.isNeighbor()) {
            throw new BadRequestException("No tienes permisos para consultar comprobantes de pagos");
        }

        Socio socio = socioRepository.findByUserId(currentUser.userId())
                .orElseThrow(() -> new ResourceNotFoundException("No se encontro un socio vinculado a tu cuenta"));

        CuotaSocio cuota = cuotaSocioRepository.findByIdAndSocioId(cuotaId, socio.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Pago no encontrado"));

        if (cuota.getNumeroComprobante() == null || cuota.getNumeroComprobante().isBlank()) {
            throw new ResourceNotFoundException("El pago seleccionado no tiene un comprobante asociado");
        }

        Comprobante comprobante = comprobanteRepository.findByNumero(cuota.getNumeroComprobante().trim())
                .orElseThrow(() -> new ResourceNotFoundException("Comprobante no encontrado"));

        if (comprobante.getSocio() == null || !comprobante.getSocio().getId().equals(socio.getId())) {
            throw new ResourceNotFoundException("Comprobante no encontrado");
        }

        return ComprobanteMapper.toDetail(comprobante);
    }

    @Transactional
    public ComprobanteDetailResponse createComprobante(ComprobanteCreateRequest request, CurrentUser currentUser) {
        Socio socio = resolveSocio(request.socioId());
        Payload payload = normalizePayload(
                socio,
                request.nombrePagador(),
                request.dniPagador(),
                request.concepto(),
                request.descripcion(),
                request.medioPago(),
                request.referenciaOrigenId(),
                request.observaciones()
        );

        Comprobante comprobante = new Comprobante();
        LocalDateTime now = LocalDateTime.now();
        long secuenciaNumero = nextSequenceNumber();

        comprobante.setSecuenciaNumero(secuenciaNumero);
        comprobante.setNumero(buildNumero(request.tipoComprobante(), secuenciaNumero));
        comprobante.setTipoComprobante(request.tipoComprobante());
        comprobante.setEstado(EstadoComprobante.EMITIDO);
        comprobante.setOrigen(request.origen());
        comprobante.setSocio(socio);
        comprobante.setFechaEmision(request.fechaEmision());
        comprobante.setConcepto(payload.concepto());
        comprobante.setDescripcion(payload.descripcion());
        comprobante.setMonto(request.monto());
        comprobante.setMedioPago(payload.medioPago());
        comprobante.setNombrePagador(payload.nombrePagador());
        comprobante.setDniPagador(payload.dniPagador());
        comprobante.setReferenciaOrigenId(payload.referenciaOrigenId());
        comprobante.setObservaciones(payload.observaciones());
        comprobante.setCreatedByUserId(currentUser.userId());
        comprobante.setCreatedByUsername(currentUser.username());
        comprobante.setCreatedAt(now);
        comprobante.setUpdatedAt(now);

        return ComprobanteMapper.toDetail(comprobanteRepository.save(comprobante));
    }

    @Transactional
    public ComprobanteDetailResponse updateComprobante(Long comprobanteId, ComprobanteUpdateRequest request) {
        Comprobante comprobante = findExistingComprobante(comprobanteId);
        if (comprobante.getEstado() == EstadoComprobante.ANULADO) {
            throw new BadRequestException("No se puede editar un comprobante anulado");
        }

        Socio socio = resolveSocio(request.socioId());
        Payload payload = normalizePayload(
                socio,
                request.nombrePagador(),
                request.dniPagador(),
                request.concepto(),
                request.descripcion(),
                request.medioPago(),
                request.referenciaOrigenId(),
                request.observaciones()
        );

        comprobante.setTipoComprobante(request.tipoComprobante());
        comprobante.setOrigen(request.origen());
        comprobante.setSocio(socio);
        comprobante.setFechaEmision(request.fechaEmision());
        comprobante.setConcepto(payload.concepto());
        comprobante.setDescripcion(payload.descripcion());
        comprobante.setMonto(request.monto());
        comprobante.setMedioPago(payload.medioPago());
        comprobante.setNombrePagador(payload.nombrePagador());
        comprobante.setDniPagador(payload.dniPagador());
        comprobante.setReferenciaOrigenId(payload.referenciaOrigenId());
        comprobante.setObservaciones(payload.observaciones());
        comprobante.setUpdatedAt(LocalDateTime.now());

        return ComprobanteMapper.toDetail(comprobanteRepository.save(comprobante));
    }

    @Transactional
    public ComprobanteDetailResponse anularComprobante(Long comprobanteId) {
        Comprobante comprobante = findExistingComprobante(comprobanteId);
        if (comprobante.getEstado() == EstadoComprobante.ANULADO) {
            throw new BadRequestException("El comprobante ya se encuentra anulado");
        }

        comprobante.setEstado(EstadoComprobante.ANULADO);
        comprobante.setAnulledAt(LocalDateTime.now());
        comprobante.setUpdatedAt(LocalDateTime.now());

        return ComprobanteMapper.toDetail(comprobanteRepository.save(comprobante));
    }

    private Comprobante findExistingComprobante(Long comprobanteId) {
        return comprobanteRepository.findById(comprobanteId)
                .orElseThrow(() -> new ResourceNotFoundException("Comprobante no encontrado"));
    }

    private Socio resolveSocio(Long socioId) {
        if (socioId == null) {
            return null;
        }

        return socioRepository.findById(socioId)
                .orElseThrow(() -> new ResourceNotFoundException("Socio no encontrado"));
    }

    private long nextSequenceNumber() {
        return comprobanteRepository.findTopByOrderBySecuenciaNumeroDesc()
                .map(comprobante -> comprobante.getSecuenciaNumero() + 1)
                .orElse(1L);
    }

    private String buildNumero(TipoComprobante tipoComprobante, long secuenciaNumero) {
        String prefix = switch (tipoComprobante) {
            case RECIBO -> "REC";
            case COMPROBANTE_INTERNO -> "CMP";
        };

        return prefix + "-" + String.format("%06d", secuenciaNumero);
    }

    private Payload normalizePayload(
            Socio socio,
            String nombrePagador,
            String dniPagador,
            String concepto,
            String descripcion,
            String medioPago,
            String referenciaOrigenId,
            String observaciones
    ) {
        String normalizedNombrePagador = normalizeOptional(nombrePagador);
        String normalizedDniPagador = normalizeOptional(dniPagador);

        if (socio != null) {
            if (normalizedNombrePagador == null) {
                normalizedNombrePagador = (socio.getNombre() + " " + socio.getApellido()).trim();
            }
            if (normalizedDniPagador == null) {
                normalizedDniPagador = socio.getDni();
            }
        }

        if (normalizedNombrePagador == null) {
            throw new BadRequestException("Debes informar un socio o el nombre del pagador");
        }

        String normalizedConcepto = normalizeRequired(concepto, "concepto");

        return new Payload(
                normalizedNombrePagador,
                normalizedDniPagador,
                normalizedConcepto,
                normalizeOptional(descripcion),
                normalizeOptional(medioPago),
                normalizeOptional(referenciaOrigenId),
                normalizeOptional(observaciones)
        );
    }

    private String normalizeRequired(String value, String fieldName) {
        String normalized = normalizeOptional(value);
        if (normalized == null) {
            throw new BadRequestException(fieldName + " es obligatorio");
        }
        return normalized;
    }

    private String normalizeOptional(String value) {
        if (value == null) {
            return null;
        }
        String normalized = value.trim();
        return normalized.isEmpty() ? null : normalized;
    }

    private record Payload(
            String nombrePagador,
            String dniPagador,
            String concepto,
            String descripcion,
            String medioPago,
            String referenciaOrigenId,
            String observaciones
    ) {
    }
}
