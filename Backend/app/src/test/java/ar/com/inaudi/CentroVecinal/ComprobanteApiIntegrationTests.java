package ar.com.inaudi.CentroVecinal;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import ar.com.inaudi.CentroVecinal.modules.comprobantes.model.Comprobante;
import ar.com.inaudi.CentroVecinal.modules.comprobantes.model.EstadoComprobante;
import ar.com.inaudi.CentroVecinal.modules.comprobantes.model.OrigenComprobante;
import ar.com.inaudi.CentroVecinal.modules.comprobantes.model.TipoComprobante;
import ar.com.inaudi.CentroVecinal.modules.comprobantes.repository.ComprobanteRepository;
import ar.com.inaudi.CentroVecinal.modules.socios.model.EstadoSocio;
import ar.com.inaudi.CentroVecinal.modules.socios.model.Socio;
import ar.com.inaudi.CentroVecinal.modules.socios.model.TipoSocio;
import ar.com.inaudi.CentroVecinal.modules.socios.repository.SocioRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class ComprobanteApiIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ComprobanteRepository comprobanteRepository;

    @Autowired
    private SocioRepository socioRepository;

    @BeforeEach
    void setUp() {
        comprobanteRepository.deleteAll();
        socioRepository.deleteAll();
    }

    @Test
    void adminCanCreateComprobanteWithSocio() throws Exception {
        Socio socio = socioRepository.save(createSocio("12345678", "Mario", "Lopez"));

        mockMvc.perform(post("/api/comprobantes")
                        .with(jwtFor("admin-1", "admin", "ROLE_ADMIN"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "socioId": %d,
                                  "tipoComprobante": "RECIBO",
                                  "origen": "PAGO_SOCIO",
                                  "fechaEmision": "2026-03-20",
                                  "concepto": "Pago cuota marzo",
                                  "descripcion": "Pago correspondiente al periodo marzo 2026",
                                  "monto": 15000,
                                  "medioPago": "EFECTIVO",
                                  "observaciones": "Mostrador"
                                }
                                """.formatted(socio.getId())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.numero").value("REC-000001"))
                .andExpect(jsonPath("$.socioId").value(socio.getId()))
                .andExpect(jsonPath("$.nombrePagador").value("Mario Lopez"))
                .andExpect(jsonPath("$.estado").value("EMITIDO"));
    }

    @Test
    void operatorCanCreateComprobanteWithoutSocio() throws Exception {
        mockMvc.perform(post("/api/comprobantes")
                        .with(jwtFor("operador-1", "operador1", "ROLE_OPERADOR"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "tipoComprobante": "COMPROBANTE_INTERNO",
                                  "origen": "GASTOS_USO_SALON_COMUNITARIO",
                                  "fechaEmision": "2026-03-20",
                                  "concepto": "Reserva salón",
                                  "descripcion": "Seña para alquiler del salon principal",
                                  "monto": 50000,
                                  "medioPago": "TRANSFERENCIA",
                                  "nombrePagador": "Juan Perez",
                                  "dniPagador": "20111222"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.numero").value("CMP-000001"))
                .andExpect(jsonPath("$.socioId").isEmpty())
                .andExpect(jsonPath("$.nombrePagador").value("Juan Perez"));
    }

    @Test
    void comprobantesCanBeFiltered() throws Exception {
        Socio socio = socioRepository.save(createSocio("12345678", "Mario", "Lopez"));
        comprobanteRepository.save(createComprobante("REC-000001", 1L, TipoComprobante.RECIBO, OrigenComprobante.PAGO_SOCIO, socio));
        comprobanteRepository.save(createComprobante("CMP-000002", 2L, TipoComprobante.COMPROBANTE_INTERNO, OrigenComprobante.OTRO, null));

        mockMvc.perform(get("/api/comprobantes")
                        .param("tipo", "RECIBO")
                        .param("socioId", String.valueOf(socio.getId()))
                        .with(jwtFor("operador-1", "operador1", "ROLE_OPERADOR")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].numero").value("REC-000001"));
    }

    @Test
    void adminCanAnularComprobante() throws Exception {
        Comprobante comprobante = comprobanteRepository.save(createComprobante("REC-000001", 1L, TipoComprobante.RECIBO, OrigenComprobante.PAGO_SOCIO, null));

        mockMvc.perform(patch("/api/comprobantes/{id}/anular", comprobante.getId())
                        .with(jwtFor("admin-1", "admin", "ROLE_ADMIN")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("ANULADO"));
    }

    @Test
    void vecinoCannotAccessComprobantes() throws Exception {
        mockMvc.perform(get("/api/comprobantes")
                        .with(jwtFor("vecino-1", "vecino1", "ROLE_VECINO")))
                .andExpect(status().isForbidden());
    }

    private Socio createSocio(String dni, String nombre, String apellido) {
        return new Socio(
                null,
                null,
                nombre,
                apellido,
                dni,
                "Calle 123",
                LocalDate.of(2026, 1, 10),
                null,
                TipoSocio.APORTANTE,
                EstadoSocio.ACTIVO,
                null,
                LocalDateTime.now(),
                LocalDateTime.now()
        );
    }

    private Comprobante createComprobante(String numero, Long secuencia, TipoComprobante tipo, OrigenComprobante origen, Socio socio) {
        Comprobante comprobante = new Comprobante();
        comprobante.setNumero(numero);
        comprobante.setSecuenciaNumero(secuencia);
        comprobante.setTipoComprobante(tipo);
        comprobante.setEstado(EstadoComprobante.EMITIDO);
        comprobante.setOrigen(origen);
        comprobante.setSocio(socio);
        comprobante.setFechaEmision(LocalDate.of(2026, 3, 20));
        comprobante.setConcepto("Concepto");
        comprobante.setDescripcion("Descripcion");
        comprobante.setMonto(new BigDecimal("15000.00"));
        comprobante.setNombrePagador(socio != null ? socio.getNombre() + " " + socio.getApellido() : "Juan Perez");
        comprobante.setDniPagador(socio != null ? socio.getDni() : "12345678");
        comprobante.setCreatedByUserId("admin-1");
        comprobante.setCreatedByUsername("admin");
        comprobante.setCreatedAt(LocalDateTime.now());
        comprobante.setUpdatedAt(LocalDateTime.now());
        return comprobante;
    }

    private org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.JwtRequestPostProcessor jwtFor(
            String subject,
            String username,
            String... roles
    ) {
        List<GrantedAuthority> authorities = java.util.Arrays.stream(roles)
                .map(SimpleGrantedAuthority::new)
                .map(GrantedAuthority.class::cast)
                .toList();

        return jwt()
                .jwt(jwt -> jwt
                        .subject(subject)
                        .claim("preferred_username", username)
                        .claim("email", username + "@inaudi.com.ar")
                        .claim("realm_access", java.util.Map.of(
                                "roles",
                                java.util.Arrays.stream(roles)
                                        .map(role -> role.startsWith("ROLE_") ? role.substring("ROLE_".length()) : role)
                                        .toList()
                        )))
                .authorities(authorities);
    }
}
