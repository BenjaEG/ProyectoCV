package ar.com.inaudi.CentroVecinal.modules.socios.controller;

import ar.com.inaudi.CentroVecinal.dto.common.PageResponseDTO;
import ar.com.inaudi.CentroVecinal.modules.socios.dto.CuotaSocioCreateRequest;
import ar.com.inaudi.CentroVecinal.modules.socios.dto.CuotaSocioPagoRequest;
import ar.com.inaudi.CentroVecinal.modules.socios.dto.CuotaSocioResponse;
import ar.com.inaudi.CentroVecinal.modules.socios.dto.CuotaSocioUpdateRequest;
import ar.com.inaudi.CentroVecinal.modules.socios.dto.SocioCreateRequest;
import ar.com.inaudi.CentroVecinal.modules.socios.dto.SocioDetailResponse;
import ar.com.inaudi.CentroVecinal.modules.socios.dto.SocioEstadoUpdateRequest;
import ar.com.inaudi.CentroVecinal.modules.socios.dto.SocioListItemResponse;
import ar.com.inaudi.CentroVecinal.modules.socios.dto.SocioUpdateRequest;
import ar.com.inaudi.CentroVecinal.modules.socios.dto.SocioVinculoUsuarioRequest;
import ar.com.inaudi.CentroVecinal.modules.socios.model.EstadoSocio;
import ar.com.inaudi.CentroVecinal.modules.socios.model.TipoSocio;
import ar.com.inaudi.CentroVecinal.modules.socios.service.CuotaSocioService;
import ar.com.inaudi.CentroVecinal.modules.socios.service.SocioService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/socios")
@PreAuthorize("hasAnyRole('ADMIN','OPERADOR')")
public class SocioController {

    private final SocioService socioService;
    private final CuotaSocioService cuotaSocioService;

    public SocioController(SocioService socioService, CuotaSocioService cuotaSocioService) {
        this.socioService = socioService;
        this.cuotaSocioService = cuotaSocioService;
    }

    @GetMapping
    public PageResponseDTO<SocioListItemResponse> getSocios(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) EstadoSocio estado,
            @RequestParam(required = false) TipoSocio tipo,
            @RequestParam(required = false) Boolean vinculado,
            @PageableDefault(sort = "apellido") Pageable pageable) {
        return socioService.getSocios(q, estado, tipo, vinculado, pageable);
    }

    @GetMapping("/{socioId}")
    public SocioDetailResponse getSocio(@PathVariable Long socioId) {
        return socioService.getSocioById(socioId);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public SocioDetailResponse createSocio(@Valid @RequestBody SocioCreateRequest request) {
        return socioService.createSocio(request);
    }

    @PutMapping("/{socioId}")
    public SocioDetailResponse updateSocio(
            @PathVariable Long socioId,
            @Valid @RequestBody SocioUpdateRequest request) {
        return socioService.updateSocio(socioId, request);
    }

    @PatchMapping("/{socioId}/estado")
    public SocioDetailResponse updateEstado(
            @PathVariable Long socioId,
            @Valid @RequestBody SocioEstadoUpdateRequest request) {
        return socioService.updateEstado(socioId, request);
    }

    @PatchMapping("/{socioId}/vinculo-usuario")
    public SocioDetailResponse updateVinculoUsuario(
            @PathVariable Long socioId,
            @RequestBody SocioVinculoUsuarioRequest request) {
        return socioService.updateVinculoUsuario(socioId, request);
    }

    @GetMapping("/{socioId}/cuotas")
    public PageResponseDTO<CuotaSocioResponse> getCuotas(
            @PathVariable Long socioId,
            @PageableDefault(sort = "periodo") Pageable pageable) {
        return cuotaSocioService.getCuotasBySocio(socioId, pageable);
    }

    @PostMapping("/{socioId}/cuotas")
    public CuotaSocioResponse createCuota(
            @PathVariable Long socioId,
            @Valid @RequestBody CuotaSocioCreateRequest request) {
        return cuotaSocioService.createCuota(socioId, request);
    }

    @PutMapping("/{socioId}/cuotas/{cuotaId}")
    public CuotaSocioResponse updateCuota(
            @PathVariable Long socioId,
            @PathVariable Long cuotaId,
            @Valid @RequestBody CuotaSocioUpdateRequest request) {
        return cuotaSocioService.updateCuota(socioId, cuotaId, request);
    }

    @PatchMapping("/{socioId}/cuotas/{cuotaId}/pagar")
    public CuotaSocioResponse pagarCuota(
            @PathVariable Long socioId,
            @PathVariable Long cuotaId,
            @Valid @RequestBody CuotaSocioPagoRequest request) {
        return cuotaSocioService.pagarCuota(socioId, cuotaId, request);
    }

    @PatchMapping("/{socioId}/cuotas/{cuotaId}/anular")
    public CuotaSocioResponse anularCuota(
            @PathVariable Long socioId,
            @PathVariable Long cuotaId) {
        return cuotaSocioService.anularCuota(socioId, cuotaId);
    }
}
