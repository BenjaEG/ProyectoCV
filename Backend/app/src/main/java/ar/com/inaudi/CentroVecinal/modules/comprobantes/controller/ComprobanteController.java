package ar.com.inaudi.CentroVecinal.modules.comprobantes.controller;

import ar.com.inaudi.CentroVecinal.dto.common.PageResponseDTO;
import ar.com.inaudi.CentroVecinal.modules.comprobantes.dto.ComprobanteCreateRequest;
import ar.com.inaudi.CentroVecinal.modules.comprobantes.dto.ComprobanteDetailResponse;
import ar.com.inaudi.CentroVecinal.modules.comprobantes.dto.ComprobanteListItemResponse;
import ar.com.inaudi.CentroVecinal.modules.comprobantes.model.EstadoComprobante;
import ar.com.inaudi.CentroVecinal.modules.comprobantes.model.OrigenComprobante;
import ar.com.inaudi.CentroVecinal.modules.comprobantes.model.TipoComprobante;
import ar.com.inaudi.CentroVecinal.modules.comprobantes.service.ComprobanteService;
import ar.com.inaudi.CentroVecinal.security.SecurityUtils;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/comprobantes")
@PreAuthorize("hasAnyRole('ADMIN','OPERADOR')")
public class ComprobanteController {

    private final ComprobanteService comprobanteService;

    public ComprobanteController(ComprobanteService comprobanteService) {
        this.comprobanteService = comprobanteService;
    }

    @GetMapping
    public PageResponseDTO<ComprobanteListItemResponse> getComprobantes(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) EstadoComprobante estado,
            @RequestParam(required = false) TipoComprobante tipo,
            @RequestParam(required = false) OrigenComprobante origen,
            @RequestParam(required = false) Long socioId,
            @PageableDefault(sort = "fechaEmision") Pageable pageable
    ) {
        return comprobanteService.getComprobantes(q, estado, tipo, origen, socioId, pageable);
    }

    @GetMapping("/{comprobanteId}")
    public ComprobanteDetailResponse getComprobante(@PathVariable Long comprobanteId) {
        return comprobanteService.getComprobanteById(comprobanteId);
    }

    @PostMapping
    public ComprobanteDetailResponse createComprobante(@Valid @RequestBody ComprobanteCreateRequest request) {
        return comprobanteService.createComprobante(request, SecurityUtils.getCurrentUser());
    }

    @PatchMapping("/{comprobanteId}/anular")
    public ComprobanteDetailResponse anularComprobante(@PathVariable Long comprobanteId) {
        return comprobanteService.anularComprobante(comprobanteId);
    }
}
