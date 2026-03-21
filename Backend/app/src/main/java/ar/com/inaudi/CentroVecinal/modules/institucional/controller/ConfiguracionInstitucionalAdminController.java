package ar.com.inaudi.CentroVecinal.modules.institucional.controller;

import ar.com.inaudi.CentroVecinal.modules.institucional.dto.ConfiguracionInstitucionalRequest;
import ar.com.inaudi.CentroVecinal.modules.institucional.dto.ConfiguracionInstitucionalResponse;
import ar.com.inaudi.CentroVecinal.modules.institucional.service.ConfiguracionInstitucionalService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/institucional")
@PreAuthorize("hasRole('ADMIN')")
public class ConfiguracionInstitucionalAdminController {

    private final ConfiguracionInstitucionalService configuracionInstitucionalService;

    public ConfiguracionInstitucionalAdminController(ConfiguracionInstitucionalService configuracionInstitucionalService) {
        this.configuracionInstitucionalService = configuracionInstitucionalService;
    }

    @GetMapping
    public ConfiguracionInstitucionalResponse getConfiguracionAdmin() {
        return configuracionInstitucionalService.getConfiguracionAdmin();
    }

    @PutMapping
    public ConfiguracionInstitucionalResponse updateConfiguracion(@Valid @RequestBody ConfiguracionInstitucionalRequest request) {
        return configuracionInstitucionalService.updateConfiguracion(request);
    }
}
