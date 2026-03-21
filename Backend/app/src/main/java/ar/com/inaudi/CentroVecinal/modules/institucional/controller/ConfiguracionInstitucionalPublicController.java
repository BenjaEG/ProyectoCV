package ar.com.inaudi.CentroVecinal.modules.institucional.controller;

import ar.com.inaudi.CentroVecinal.modules.institucional.dto.ConfiguracionInstitucionalResponse;
import ar.com.inaudi.CentroVecinal.modules.institucional.service.ConfiguracionInstitucionalService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public/institucional")
public class ConfiguracionInstitucionalPublicController {

    private final ConfiguracionInstitucionalService configuracionInstitucionalService;

    public ConfiguracionInstitucionalPublicController(ConfiguracionInstitucionalService configuracionInstitucionalService) {
        this.configuracionInstitucionalService = configuracionInstitucionalService;
    }

    @GetMapping
    public ConfiguracionInstitucionalResponse getConfiguracionPublica() {
        return configuracionInstitucionalService.getConfiguracionPublica();
    }
}
