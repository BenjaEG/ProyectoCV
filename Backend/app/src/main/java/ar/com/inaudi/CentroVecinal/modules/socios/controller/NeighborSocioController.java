package ar.com.inaudi.CentroVecinal.modules.socios.controller;

import ar.com.inaudi.CentroVecinal.dto.common.PageResponseDTO;
import ar.com.inaudi.CentroVecinal.modules.comprobantes.dto.ComprobanteDetailResponse;
import ar.com.inaudi.CentroVecinal.modules.comprobantes.service.ComprobanteService;
import ar.com.inaudi.CentroVecinal.modules.socios.dto.CuotaSocioResponse;
import ar.com.inaudi.CentroVecinal.modules.socios.dto.SocioDetailResponse;
import ar.com.inaudi.CentroVecinal.modules.socios.service.CuotaSocioService;
import ar.com.inaudi.CentroVecinal.modules.socios.service.SocioService;
import ar.com.inaudi.CentroVecinal.security.SecurityUtils;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/socios/me")
@PreAuthorize("hasRole('VECINO')")
public class NeighborSocioController {

    private final SocioService socioService;
    private final CuotaSocioService cuotaSocioService;
    private final ComprobanteService comprobanteService;

    public NeighborSocioController(
            SocioService socioService,
            CuotaSocioService cuotaSocioService,
            ComprobanteService comprobanteService
    ) {
        this.socioService = socioService;
        this.cuotaSocioService = cuotaSocioService;
        this.comprobanteService = comprobanteService;
    }

    @GetMapping
    public SocioDetailResponse getMySocio() {
        return socioService.getCurrentNeighborSocio(SecurityUtils.getCurrentUser());
    }

    @GetMapping("/cuotas")
    public PageResponseDTO<CuotaSocioResponse> getMyCuotas(
            @PageableDefault(size = 20, sort = "periodo") Pageable pageable
    ) {
        return cuotaSocioService.getCurrentNeighborCuotas(SecurityUtils.getCurrentUser(), pageable);
    }

    @GetMapping("/cuotas/{cuotaId}/comprobante")
    public ComprobanteDetailResponse getMyCuotaComprobante(@PathVariable Long cuotaId) {
        return comprobanteService.getCurrentNeighborComprobanteByCuotaId(SecurityUtils.getCurrentUser(), cuotaId);
    }
}
