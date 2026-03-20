package ar.com.inaudi.CentroVecinal.modules.socios.service;

import ar.com.inaudi.CentroVecinal.dto.common.PageResponseDTO;
import ar.com.inaudi.CentroVecinal.exception.BadRequestException;
import ar.com.inaudi.CentroVecinal.exception.ForbiddenException;
import ar.com.inaudi.CentroVecinal.exception.ResourceNotFoundException;
import ar.com.inaudi.CentroVecinal.modules.socios.dto.CuotaSocioCreateRequest;
import ar.com.inaudi.CentroVecinal.modules.socios.dto.CuotaSocioPagoRequest;
import ar.com.inaudi.CentroVecinal.modules.socios.dto.CuotaSocioResponse;
import ar.com.inaudi.CentroVecinal.modules.socios.dto.CuotaSocioUpdateRequest;
import ar.com.inaudi.CentroVecinal.modules.socios.mapper.SocioMapper;
import ar.com.inaudi.CentroVecinal.modules.socios.model.CuotaSocio;
import ar.com.inaudi.CentroVecinal.modules.socios.model.EstadoPagoCuota;
import ar.com.inaudi.CentroVecinal.modules.socios.model.Socio;
import ar.com.inaudi.CentroVecinal.modules.socios.repository.CuotaSocioRepository;
import ar.com.inaudi.CentroVecinal.security.CurrentUser;
import java.time.LocalDateTime;
import java.time.YearMonth;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CuotaSocioService {

    private final CuotaSocioRepository cuotaSocioRepository;
    private final SocioService socioService;

    public CuotaSocioService(CuotaSocioRepository cuotaSocioRepository, SocioService socioService) {
        this.cuotaSocioRepository = cuotaSocioRepository;
        this.socioService = socioService;
    }

    @Transactional(readOnly = true)
    public PageResponseDTO<CuotaSocioResponse> getCuotasBySocio(Long socioId, Pageable pageable) {
        socioService.findExistingSocio(socioId);
        Page<CuotaSocio> page = cuotaSocioRepository.findBySocioIdOrderByPeriodoDesc(socioId, pageable);

        return PageResponseDTO.<CuotaSocioResponse>builder()
                .content(page.getContent().stream().map(SocioMapper::toResponse).toList())
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .build();
    }

    @Transactional(readOnly = true)
    public PageResponseDTO<CuotaSocioResponse> getCurrentNeighborCuotas(CurrentUser currentUser, Pageable pageable) {
        if (!currentUser.isNeighbor()) {
            throw new ForbiddenException("No tienes permisos para consultar las cuotas de vecino");
        }

        Socio socio = socioService.findSocioByUserId(currentUser.userId());
        Page<CuotaSocio> page = cuotaSocioRepository.findBySocioIdOrderByPeriodoDesc(socio.getId(), pageable);

        return PageResponseDTO.<CuotaSocioResponse>builder()
                .content(page.getContent().stream().map(SocioMapper::toResponse).toList())
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .build();
    }

    @Transactional
    public CuotaSocioResponse createCuota(Long socioId, CuotaSocioCreateRequest request) {
        Socio socio = socioService.findExistingSocio(socioId);
        String periodo = normalizePeriodo(request.periodo());
        validateUniquePeriodo(socioId, periodo, null);

        CuotaSocio cuota = new CuotaSocio();
        LocalDateTime now = LocalDateTime.now();

        cuota.setSocio(socio);
        cuota.setPeriodo(periodo);
        cuota.setMonto(request.monto());
        cuota.setEstadoPago(resolveEstadoInicial(request.fechaVencimiento()));
        cuota.setFechaVencimiento(request.fechaVencimiento());
        cuota.setFechaPago(null);
        cuota.setTipoComprobante(normalizeOptional(request.tipoComprobante()));
        cuota.setNumeroComprobante(normalizeOptional(request.numeroComprobante()));
        cuota.setMedioPago(normalizeOptional(request.medioPago()));
        cuota.setObservacion(normalizeOptional(request.observacion()));
        cuota.setCreatedAt(now);
        cuota.setUpdatedAt(now);

        return SocioMapper.toResponse(cuotaSocioRepository.save(cuota));
    }

    @Transactional
    public CuotaSocioResponse updateCuota(Long socioId, Long cuotaId, CuotaSocioUpdateRequest request) {
        CuotaSocio cuota = findExistingCuota(socioId, cuotaId);
        String periodo = normalizePeriodo(request.periodo());
        validateUniquePeriodo(socioId, periodo, cuotaId);

        cuota.setPeriodo(periodo);
        cuota.setMonto(request.monto());
        cuota.setFechaVencimiento(request.fechaVencimiento());
        cuota.setTipoComprobante(normalizeOptional(request.tipoComprobante()));
        cuota.setNumeroComprobante(normalizeOptional(request.numeroComprobante()));
        cuota.setMedioPago(normalizeOptional(request.medioPago()));
        cuota.setObservacion(normalizeOptional(request.observacion()));
        cuota.setUpdatedAt(LocalDateTime.now());

        if (cuota.getEstadoPago() != EstadoPagoCuota.PAGADA && cuota.getEstadoPago() != EstadoPagoCuota.ANULADA) {
            cuota.setEstadoPago(resolveEstadoInicial(request.fechaVencimiento()));
        }

        return SocioMapper.toResponse(cuotaSocioRepository.save(cuota));
    }

    @Transactional
    public CuotaSocioResponse pagarCuota(Long socioId, Long cuotaId, CuotaSocioPagoRequest request) {
        CuotaSocio cuota = findExistingCuota(socioId, cuotaId);

        if (cuota.getEstadoPago() == EstadoPagoCuota.ANULADA) {
            throw new BadRequestException("No se puede registrar el pago de una cuota anulada");
        }

        cuota.setEstadoPago(EstadoPagoCuota.PAGADA);
        cuota.setFechaPago(request.fechaPago());
        cuota.setTipoComprobante(normalizeOptional(request.tipoComprobante()));
        cuota.setNumeroComprobante(normalizeOptional(request.numeroComprobante()));
        cuota.setMedioPago(normalizeOptional(request.medioPago()));
        cuota.setObservacion(normalizeOptional(request.observacion()));
        cuota.setUpdatedAt(LocalDateTime.now());

        return SocioMapper.toResponse(cuotaSocioRepository.save(cuota));
    }

    @Transactional
    public CuotaSocioResponse anularCuota(Long socioId, Long cuotaId) {
        CuotaSocio cuota = findExistingCuota(socioId, cuotaId);
        cuota.setEstadoPago(EstadoPagoCuota.ANULADA);
        cuota.setUpdatedAt(LocalDateTime.now());
        return SocioMapper.toResponse(cuotaSocioRepository.save(cuota));
    }

    private CuotaSocio findExistingCuota(Long socioId, Long cuotaId) {
        return cuotaSocioRepository.findByIdAndSocioId(cuotaId, socioId)
                .orElseThrow(() -> new ResourceNotFoundException("Cuota no encontrada"));
    }

    private void validateUniquePeriodo(Long socioId, String periodo, Long cuotaId) {
        boolean exists = cuotaId == null
                ? cuotaSocioRepository.existsBySocioIdAndPeriodo(socioId, periodo)
                : cuotaSocioRepository.existsBySocioIdAndPeriodoAndIdNot(socioId, periodo, cuotaId);

        if (exists) {
            throw new BadRequestException("Ya existe una cuota registrada para ese periodo");
        }
    }

    private String normalizePeriodo(String periodo) {
        String normalized = periodo == null ? "" : periodo.trim();
        try {
            return YearMonth.parse(normalized).toString();
        } catch (Exception ex) {
            throw new BadRequestException("periodo debe tener formato yyyy-MM");
        }
    }

    private EstadoPagoCuota resolveEstadoInicial(java.time.LocalDate fechaVencimiento) {
        return fechaVencimiento.isBefore(java.time.LocalDate.now()) ? EstadoPagoCuota.VENCIDA : EstadoPagoCuota.PENDIENTE;
    }

    private String normalizeOptional(String value) {
        if (value == null) {
            return null;
        }
        String normalized = value.trim();
        return normalized.isEmpty() ? null : normalized;
    }
}
