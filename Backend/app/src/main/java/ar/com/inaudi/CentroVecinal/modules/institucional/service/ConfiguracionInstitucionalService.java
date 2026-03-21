package ar.com.inaudi.CentroVecinal.modules.institucional.service;

import ar.com.inaudi.CentroVecinal.modules.institucional.dto.ConfiguracionInstitucionalRequest;
import ar.com.inaudi.CentroVecinal.modules.institucional.dto.ConfiguracionInstitucionalResponse;
import ar.com.inaudi.CentroVecinal.modules.institucional.model.ConfiguracionInstitucional;
import ar.com.inaudi.CentroVecinal.modules.institucional.repository.ConfiguracionInstitucionalRepository;
import java.time.LocalDateTime;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ConfiguracionInstitucionalService {

    private final ConfiguracionInstitucionalRepository configuracionInstitucionalRepository;

    public ConfiguracionInstitucionalService(ConfiguracionInstitucionalRepository configuracionInstitucionalRepository) {
        this.configuracionInstitucionalRepository = configuracionInstitucionalRepository;
    }

    @Transactional(readOnly = true)
    public ConfiguracionInstitucionalResponse getConfiguracionPublica() {
        return toResponse(getOrCreate());
    }

    @Transactional(readOnly = true)
    public ConfiguracionInstitucionalResponse getConfiguracionAdmin() {
        return toResponse(getOrCreate());
    }

    @Transactional
    public ConfiguracionInstitucionalResponse updateConfiguracion(ConfiguracionInstitucionalRequest request) {
        ConfiguracionInstitucional configuracion = getOrCreate();

        configuracion.setNombreCentroVecinal(normalizeRequired(request.nombreCentroVecinal()));
        configuracion.setDescripcionHome(normalizeRequired(request.descripcionHome()));
        configuracion.setDescripcionContacto(normalizeRequired(request.descripcionContacto()));
        configuracion.setMostrarTelefono(request.mostrarTelefono());
        configuracion.setTelefono(normalizeOptional(request.telefono()));
        configuracion.setMostrarEmail(request.mostrarEmail());
        configuracion.setEmail(normalizeOptional(request.email()));
        configuracion.setMostrarDireccion(request.mostrarDireccion());
        configuracion.setDireccion(normalizeOptional(request.direccion()));
        configuracion.setMostrarHorarioAtencion(request.mostrarHorarioAtencion());
        configuracion.setHorarioAtencion(normalizeOptional(request.horarioAtencion()));
        configuracion.setUpdatedAt(LocalDateTime.now());

        return toResponse(configuracionInstitucionalRepository.save(configuracion));
    }

    private ConfiguracionInstitucional getOrCreate() {
        return configuracionInstitucionalRepository.findById(ConfiguracionInstitucional.SINGLETON_ID)
                .orElseGet(this::createDefaultConfiguration);
    }

    private ConfiguracionInstitucional createDefaultConfiguration() {
        LocalDateTime now = LocalDateTime.now();
        ConfiguracionInstitucional configuracion = new ConfiguracionInstitucional();
        configuracion.setId(ConfiguracionInstitucional.SINGLETON_ID);
        configuracion.setNombreCentroVecinal("Barrio Inaudi");
        configuracion.setDescripcionHome("Portal comunitario para reclamos, noticias y comunicación vecinal. Trabajamos juntos por un barrio mejor.");
        configuracion.setDescripcionContacto("Comunicate con el Centro Vecinal para consultas, atención administrativa y actividades comunitarias.");
        configuracion.setMostrarTelefono(true);
        configuracion.setTelefono("+54 351 123-4567");
        configuracion.setMostrarEmail(true);
        configuracion.setEmail("contacto@cvbarrioinaudi.org");
        configuracion.setMostrarDireccion(true);
        configuracion.setDireccion("Calle Principal 1234, Barrio Inaudi, Córdoba, Argentina");
        configuracion.setMostrarHorarioAtencion(true);
        configuracion.setHorarioAtencion("Lunes a Viernes: 9:00 - 18:00");
        configuracion.setCreatedAt(now);
        configuracion.setUpdatedAt(now);
        return configuracionInstitucionalRepository.save(configuracion);
    }

    private ConfiguracionInstitucionalResponse toResponse(ConfiguracionInstitucional configuracion) {
        return new ConfiguracionInstitucionalResponse(
                configuracion.getId(),
                configuracion.getNombreCentroVecinal(),
                configuracion.getDescripcionHome(),
                configuracion.getDescripcionContacto(),
                configuracion.getMostrarTelefono(),
                configuracion.getTelefono(),
                configuracion.getMostrarEmail(),
                configuracion.getEmail(),
                configuracion.getMostrarDireccion(),
                configuracion.getDireccion(),
                configuracion.getMostrarHorarioAtencion(),
                configuracion.getHorarioAtencion(),
                configuracion.getCreatedAt(),
                configuracion.getUpdatedAt()
        );
    }

    private String normalizeRequired(String value) {
        String normalized = normalizeOptional(value);
        return normalized == null ? "" : normalized;
    }

    private String normalizeOptional(String value) {
        if (value == null) {
            return null;
        }
        String normalized = value.trim();
        return normalized.isBlank() ? null : normalized;
    }
}
