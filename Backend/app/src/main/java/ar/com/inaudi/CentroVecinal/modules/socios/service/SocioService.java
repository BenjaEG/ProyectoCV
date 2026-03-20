package ar.com.inaudi.CentroVecinal.modules.socios.service;

import ar.com.inaudi.CentroVecinal.dto.common.PageResponseDTO;
import ar.com.inaudi.CentroVecinal.exception.BadRequestException;
import ar.com.inaudi.CentroVecinal.exception.ForbiddenException;
import ar.com.inaudi.CentroVecinal.exception.ResourceNotFoundException;
import ar.com.inaudi.CentroVecinal.modules.socios.dto.SocioCreateRequest;
import ar.com.inaudi.CentroVecinal.modules.socios.dto.SocioDetailResponse;
import ar.com.inaudi.CentroVecinal.modules.socios.dto.SocioEstadoUpdateRequest;
import ar.com.inaudi.CentroVecinal.modules.socios.dto.SocioListItemResponse;
import ar.com.inaudi.CentroVecinal.modules.socios.dto.SocioUpdateRequest;
import ar.com.inaudi.CentroVecinal.modules.socios.dto.SocioVinculoUsuarioRequest;
import ar.com.inaudi.CentroVecinal.modules.socios.mapper.SocioMapper;
import ar.com.inaudi.CentroVecinal.modules.socios.model.EstadoSocio;
import ar.com.inaudi.CentroVecinal.modules.socios.model.Socio;
import ar.com.inaudi.CentroVecinal.modules.socios.repository.SocioRepository;
import ar.com.inaudi.CentroVecinal.security.CurrentUser;
import ar.com.inaudi.CentroVecinal.modules.socios.repository.SocioSpecifications;
import java.time.LocalDate;
import java.time.LocalDateTime;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SocioService {

    private final SocioRepository socioRepository;

    public SocioService(SocioRepository socioRepository) {
        this.socioRepository = socioRepository;
    }

    @Transactional(readOnly = true)
    public PageResponseDTO<SocioListItemResponse> getSocios(
            String query,
            EstadoSocio estado,
            ar.com.inaudi.CentroVecinal.modules.socios.model.TipoSocio tipo,
            Boolean vinculado,
            Pageable pageable) {

        Specification<Socio> specification = Specification.allOf(
                SocioSpecifications.search(query),
                SocioSpecifications.hasEstado(estado),
                SocioSpecifications.hasTipo(tipo),
                SocioSpecifications.hasUserLinked(vinculado)
        );

        Page<Socio> page = socioRepository.findAll(specification, pageable);

        return PageResponseDTO.<SocioListItemResponse>builder()
                .content(page.getContent().stream().map(SocioMapper::toListItem).toList())
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .build();
    }

    @Transactional(readOnly = true)
    public SocioDetailResponse getSocioById(Long socioId) {
        return SocioMapper.toDetail(findExistingSocio(socioId));
    }

    @Transactional(readOnly = true)
    public SocioDetailResponse getCurrentNeighborSocio(CurrentUser currentUser) {
        if (!currentUser.isNeighbor()) {
            throw new ForbiddenException("No tienes permisos para consultar las cuotas de vecino");
        }

        return SocioMapper.toDetail(findSocioByUserId(currentUser.userId()));
    }

    @Transactional
    public SocioDetailResponse createSocio(SocioCreateRequest request) {
        String dni = normalizeDni(request.dni());
        validateUniqueDni(dni, null);

        LocalDateTime now = LocalDateTime.now();
        Socio socio = new Socio();
        socio.setNombre(normalizeText(request.nombre()));
        socio.setApellido(normalizeText(request.apellido()));
        socio.setDni(dni);
        socio.setDomicilio(normalizeText(request.domicilio()));
        socio.setFechaAlta(request.fechaAlta());
        socio.setFechaBaja(null);
        socio.setTipoSocio(request.tipoSocio());
        socio.setEstadoSocio(EstadoSocio.ACTIVO);
        socio.setObservaciones(normalizeOptional(request.observaciones()));
        socio.setCreatedAt(now);
        socio.setUpdatedAt(now);

        return SocioMapper.toDetail(socioRepository.save(socio));
    }

    @Transactional
    public SocioDetailResponse updateSocio(Long socioId, SocioUpdateRequest request) {
        Socio socio = findExistingSocio(socioId);
        String dni = normalizeDni(request.dni());
        validateUniqueDni(dni, socioId);

        socio.setNombre(normalizeText(request.nombre()));
        socio.setApellido(normalizeText(request.apellido()));
        socio.setDni(dni);
        socio.setDomicilio(normalizeText(request.domicilio()));
        socio.setFechaAlta(request.fechaAlta());
        socio.setTipoSocio(request.tipoSocio());
        socio.setObservaciones(normalizeOptional(request.observaciones()));
        socio.setUpdatedAt(LocalDateTime.now());

        if (socio.getEstadoSocio() != EstadoSocio.BAJA) {
            socio.setFechaBaja(null);
        }

        validateEstadoFechaBaja(socio.getEstadoSocio(), socio.getFechaBaja());
        return SocioMapper.toDetail(socioRepository.save(socio));
    }

    @Transactional
    public SocioDetailResponse updateEstado(Long socioId, SocioEstadoUpdateRequest request) {
        Socio socio = findExistingSocio(socioId);

        LocalDate fechaBaja = request.estadoSocio() == EstadoSocio.BAJA
                ? (request.fechaBaja() != null ? request.fechaBaja() : LocalDate.now())
                : null;

        validateEstadoFechaBaja(request.estadoSocio(), fechaBaja);

        socio.setEstadoSocio(request.estadoSocio());
        socio.setFechaBaja(fechaBaja);
        socio.setUpdatedAt(LocalDateTime.now());

        return SocioMapper.toDetail(socioRepository.save(socio));
    }

    @Transactional
    public SocioDetailResponse updateVinculoUsuario(Long socioId, SocioVinculoUsuarioRequest request) {
        Socio socio = findExistingSocio(socioId);
        socio.setUserId(normalizeOptional(request.userId()));
        socio.setUpdatedAt(LocalDateTime.now());
        return SocioMapper.toDetail(socioRepository.save(socio));
    }

    protected Socio findExistingSocio(Long socioId) {
        return socioRepository.findById(socioId)
                .orElseThrow(() -> new ResourceNotFoundException("Socio no encontrado"));
    }

    protected Socio findSocioByUserId(String userId) {
        return socioRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("No se encontro un socio vinculado a la cuenta actual"));
    }

    private void validateUniqueDni(String dni, Long currentSocioId) {
        boolean exists = currentSocioId == null
                ? socioRepository.existsByDni(dni)
                : socioRepository.existsByDniAndIdNot(dni, currentSocioId);

        if (exists) {
            throw new BadRequestException("Ya existe un socio con ese DNI");
        }
    }

    private void validateEstadoFechaBaja(EstadoSocio estado, LocalDate fechaBaja) {
        if (estado == EstadoSocio.BAJA && fechaBaja == null) {
            throw new BadRequestException("fechaBaja es obligatoria cuando el estado es BAJA");
        }
        if (estado != EstadoSocio.BAJA && fechaBaja != null) {
            throw new BadRequestException("fechaBaja solo puede informarse cuando el estado es BAJA");
        }
    }

    private String normalizeText(String value) {
        return value == null ? null : value.trim().replaceAll("\\s+", " ");
    }

    private String normalizeOptional(String value) {
        if (value == null) {
            return null;
        }
        String normalized = value.trim();
        return normalized.isEmpty() ? null : normalized;
    }

    private String normalizeDni(String dni) {
        return normalizeText(dni);
    }
}
