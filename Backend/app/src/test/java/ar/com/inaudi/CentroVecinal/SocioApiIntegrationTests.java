package ar.com.inaudi.CentroVecinal;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import ar.com.inaudi.CentroVecinal.modules.comprobantes.model.Comprobante;
import ar.com.inaudi.CentroVecinal.modules.comprobantes.model.EstadoComprobante;
import ar.com.inaudi.CentroVecinal.modules.comprobantes.model.OrigenComprobante;
import ar.com.inaudi.CentroVecinal.modules.comprobantes.model.TipoComprobante;
import ar.com.inaudi.CentroVecinal.modules.comprobantes.repository.ComprobanteRepository;
import ar.com.inaudi.CentroVecinal.modules.socios.model.CuotaSocio;
import ar.com.inaudi.CentroVecinal.modules.socios.model.EstadoPagoCuota;
import ar.com.inaudi.CentroVecinal.modules.socios.model.EstadoSocio;
import ar.com.inaudi.CentroVecinal.modules.socios.model.Socio;
import ar.com.inaudi.CentroVecinal.modules.socios.model.TipoSocio;
import ar.com.inaudi.CentroVecinal.modules.socios.repository.CuotaSocioRepository;
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
class SocioApiIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private SocioRepository socioRepository;

    @Autowired
    private CuotaSocioRepository cuotaSocioRepository;

    @Autowired
    private ComprobanteRepository comprobanteRepository;

    @BeforeEach
    void setUp() {
        comprobanteRepository.deleteAll();
        cuotaSocioRepository.deleteAll();
        socioRepository.deleteAll();
    }

    @Test
    void adminCanCreateSocio() throws Exception {
        String body = """
                {
                  "nombre": "Juan",
                  "apellido": "Perez",
                  "dni": "12345678",
                  "domicilio": "Calle 123",
                  "fechaAlta": "2026-03-01",
                  "tipoSocio": "APORTANTE",
                  "observaciones": "Socio fundador"
                }
                """;

        mockMvc.perform(post("/api/socios")
                        .with(jwtFor("admin-1", "admin", "ROLE_ADMIN"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nombre").value("Juan"))
                .andExpect(jsonPath("$.apellido").value("Perez"))
                .andExpect(jsonPath("$.estadoSocio").value("ACTIVO"))
                .andExpect(jsonPath("$.userId").doesNotExist());
    }

    @Test
    void duplicateDniIsRejected() throws Exception {
        socioRepository.save(createSocio("12345678", "Mario", "Lopez"));

        String body = """
                {
                  "nombre": "Juan",
                  "apellido": "Perez",
                  "dni": "12345678",
                  "domicilio": "Calle 123",
                  "fechaAlta": "2026-03-01",
                  "tipoSocio": "APORTANTE"
                }
                """;

        mockMvc.perform(post("/api/socios")
                        .with(jwtFor("admin-1", "admin", "ROLE_ADMIN"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Ya existe un socio con ese DNI"));
    }

    @Test
    void updateSocioPreservesOptionalUserLink() throws Exception {
        Socio socio = createSocio("12345678", "Mario", "Lopez");
        socio.setUserId("user-keycloak-1");
        socio = socioRepository.save(socio);

        String body = """
                {
                  "nombre": "Mario Alberto",
                  "apellido": "Lopez",
                  "dni": "12345678",
                  "domicilio": "Nueva direccion 456",
                  "fechaAlta": "2026-01-10",
                  "tipoSocio": "ADHERENTE",
                  "observaciones": "Actualizado"
                }
                """;

        mockMvc.perform(put("/api/socios/{id}", socio.getId())
                        .with(jwtFor("operador-1", "operador1", "ROLE_OPERADOR"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value("user-keycloak-1"))
                .andExpect(jsonPath("$.tipoSocio").value("ADHERENTE"))
                .andExpect(jsonPath("$.domicilio").value("Nueva direccion 456"));
    }

    @Test
    void adminCanUpdateSocioEstadoToBaja() throws Exception {
        Socio socio = socioRepository.save(createSocio("12345678", "Mario", "Lopez"));

        mockMvc.perform(patch("/api/socios/{id}/estado", socio.getId())
                        .with(jwtFor("admin-1", "admin", "ROLE_ADMIN"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "estadoSocio": "BAJA",
                                  "fechaBaja": "2026-03-19"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estadoSocio").value("BAJA"))
                .andExpect(jsonPath("$.fechaBaja").value("2026-03-19"));
    }

    @Test
    void listSociosCanFilterByEstadoAndTipo() throws Exception {
        socioRepository.save(createSocio("11111111", "Ana", "Activa"));
        Socio moroso = createSocio("22222222", "Beto", "Moroso");
        moroso.setEstadoSocio(EstadoSocio.MOROSO);
        socioRepository.save(moroso);
        Socio honorario = createSocio("33333333", "Carla", "Honoraria");
        honorario.setTipoSocio(TipoSocio.HONORARIO);
        honorario.setEstadoSocio(EstadoSocio.MOROSO);
        socioRepository.save(honorario);

        mockMvc.perform(get("/api/socios")
                        .param("estado", "MOROSO")
                        .param("tipo", "HONORARIO")
                        .with(jwtFor("operador-1", "operador1", "ROLE_OPERADOR")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].dni").value("33333333"));
    }

    @Test
    void operatorCanCreateAndPayCuotaWithComprobante() throws Exception {
        Socio socio = socioRepository.save(createSocio("12345678", "Mario", "Lopez"));

        mockMvc.perform(post("/api/socios/{id}/cuotas", socio.getId())
                        .with(jwtFor("operador-1", "operador1", "ROLE_OPERADOR"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "periodo": "2026-03",
                                  "monto": 15000,
                                  "fechaVencimiento": "2026-03-10",
                                  "tipoComprobante": "RECIBO",
                                  "numeroComprobante": "0001",
                                  "medioPago": "TRANSFERENCIA",
                                  "observacion": "Marzo"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.periodo").value("2026-03"))
                .andExpect(jsonPath("$.estadoPago").value("VENCIDA"));

        CuotaSocio cuota = cuotaSocioRepository.findBySocioIdOrderByPeriodoDesc(socio.getId())
                .stream()
                .findFirst()
                .orElseThrow();

        mockMvc.perform(patch("/api/socios/{socioId}/cuotas/{cuotaId}/pagar", socio.getId(), cuota.getId())
                        .with(jwtFor("operador-1", "operador1", "ROLE_OPERADOR"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "fechaPago": "2026-03-15",
                                  "tipoComprobante": "RECIBO",
                                  "numeroComprobante": "0002",
                                  "medioPago": "EFECTIVO",
                                  "observacion": "Pagada"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estadoPago").value("PAGADA"))
                .andExpect(jsonPath("$.fechaPago").value("2026-03-15"))
                .andExpect(jsonPath("$.numeroComprobante").value("0002"));
    }

    @Test
    void duplicatePeriodoForSameSocioIsRejected() throws Exception {
        Socio socio = socioRepository.save(createSocio("12345678", "Mario", "Lopez"));
        cuotaSocioRepository.save(createCuota(socio, "2026-03"));

        mockMvc.perform(post("/api/socios/{id}/cuotas", socio.getId())
                        .with(jwtFor("operador-1", "operador1", "ROLE_OPERADOR"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "periodo": "2026-03",
                                  "monto": 10000,
                                  "fechaVencimiento": "2026-03-20"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Ya existe una cuota registrada para ese periodo"));
    }

    @Test
    void operatorCanAnularCuota() throws Exception {
        Socio socio = socioRepository.save(createSocio("12345678", "Mario", "Lopez"));
        CuotaSocio cuota = cuotaSocioRepository.save(createCuota(socio, "2026-03"));

        mockMvc.perform(patch("/api/socios/{socioId}/cuotas/{cuotaId}/anular", socio.getId(), cuota.getId())
                        .with(jwtFor("operador-1", "operador1", "ROLE_OPERADOR")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estadoPago").value("ANULADA"));
    }

    @Test
    void vecinoCannotAccessSociosModule() throws Exception {
        mockMvc.perform(get("/api/socios")
                        .with(jwtFor("vecino-1", "vecino1", "ROLE_VECINO")))
                .andExpect(status().isForbidden());
    }

    @Test
    void socioWithLinkedUserIdReturnsLink() throws Exception {
        Socio socio = createSocio("12345678", "Mario", "Lopez");
        socio.setUserId("keycloak-user-1");
        socio = socioRepository.save(socio);

        mockMvc.perform(get("/api/socios/{id}", socio.getId())
                        .with(jwtFor("operador-1", "operador1", "ROLE_OPERADOR")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value("keycloak-user-1"));
    }

    @Test
    void vecinoVinculadoPuedeVerSoloSusCuotas() throws Exception {
        Socio socioVecino = createSocio("12345678", "Mario", "Lopez");
        socioVecino.setUserId("vecino-1");
        socioVecino = socioRepository.save(socioVecino);

        Socio otroSocio = createSocio("87654321", "Ana", "Perez");
        otroSocio.setUserId("vecino-2");
        otroSocio = socioRepository.save(otroSocio);

        cuotaSocioRepository.save(createCuota(socioVecino, "2026-03"));
        cuotaSocioRepository.save(createCuota(otroSocio, "2026-04"));

        mockMvc.perform(get("/api/socios/me")
                        .with(jwtFor("vecino-1", "vecino1", "ROLE_VECINO")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.dni").value("12345678"))
                .andExpect(jsonPath("$.userId").value("vecino-1"));

        mockMvc.perform(get("/api/socios/me/cuotas")
                        .with(jwtFor("vecino-1", "vecino1", "ROLE_VECINO")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].periodo").value("2026-03"));
    }

    @Test
    void vecinoSinSocioVinculadoRecibeNotFoundEnMisCuotas() throws Exception {
        mockMvc.perform(get("/api/socios/me/cuotas")
                        .with(jwtFor("vecino-9", "vecino9", "ROLE_VECINO")))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("No se encontro un socio vinculado a la cuenta actual"));
    }

    @Test
    void vecinoVinculadoPuedeVerElComprobanteDeUnPagoPropio() throws Exception {
        Socio socio = createSocio("12345678", "Mario", "Lopez");
        socio.setUserId("vecino-1");
        socio = socioRepository.save(socio);

        CuotaSocio cuota = createCuota(socio, "2026-03");
        cuota.setEstadoPago(EstadoPagoCuota.PAGADA);
        cuota.setFechaPago(LocalDate.of(2026, 3, 12));
        cuota.setTipoComprobante("RECIBO");
        cuota.setNumeroComprobante("REC-000123");
        cuota = cuotaSocioRepository.save(cuota);

        comprobanteRepository.save(createComprobante(socio, "REC-000123"));

        mockMvc.perform(get("/api/socios/me/cuotas/{cuotaId}/comprobante", cuota.getId())
                        .with(jwtFor("vecino-1", "vecino1", "ROLE_VECINO")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.numero").value("REC-000123"))
                .andExpect(jsonPath("$.socioId").value(socio.getId()));
    }

    @Test
    void vecinoNoPuedeVerElComprobanteDeUnPagoAjeno() throws Exception {
        Socio socioPropio = createSocio("12345678", "Mario", "Lopez");
        socioPropio.setUserId("vecino-1");
        socioPropio = socioRepository.save(socioPropio);

        Socio socioAjeno = socioRepository.save(createSocio("87654321", "Ana", "Perez"));
        CuotaSocio cuotaAjena = createCuota(socioAjeno, "2026-03");
        cuotaAjena.setEstadoPago(EstadoPagoCuota.PAGADA);
        cuotaAjena.setFechaPago(LocalDate.of(2026, 3, 12));
        cuotaAjena.setTipoComprobante("RECIBO");
        cuotaAjena.setNumeroComprobante("REC-999999");
        cuotaAjena = cuotaSocioRepository.save(cuotaAjena);

        comprobanteRepository.save(createComprobante(socioAjeno, "REC-999999"));

        mockMvc.perform(get("/api/socios/me/cuotas/{cuotaId}/comprobante", cuotaAjena.getId())
                        .with(jwtFor("vecino-1", "vecino1", "ROLE_VECINO")))
                .andExpect(status().isNotFound());
    }

    private Socio createSocio(String dni, String nombre, String apellido) {
        Socio socio = new Socio();
        socio.setNombre(nombre);
        socio.setApellido(apellido);
        socio.setDni(dni);
        socio.setDomicilio("Direccion " + dni);
        socio.setFechaAlta(LocalDate.of(2026, 1, 10));
        socio.setTipoSocio(TipoSocio.APORTANTE);
        socio.setEstadoSocio(EstadoSocio.ACTIVO);
        socio.setCreatedAt(LocalDateTime.now());
        socio.setUpdatedAt(LocalDateTime.now());
        return socio;
    }

    private CuotaSocio createCuota(Socio socio, String periodo) {
        CuotaSocio cuota = new CuotaSocio();
        cuota.setSocio(socio);
        cuota.setPeriodo(periodo);
        cuota.setMonto(BigDecimal.valueOf(10000));
        cuota.setEstadoPago(EstadoPagoCuota.PENDIENTE);
        cuota.setFechaVencimiento(LocalDate.of(2026, 3, 20));
        cuota.setCreatedAt(LocalDateTime.now());
        cuota.setUpdatedAt(LocalDateTime.now());
        return cuota;
    }

    private Comprobante createComprobante(Socio socio, String numero) {
        Comprobante comprobante = new Comprobante();
        LocalDateTime now = LocalDateTime.now();
        comprobante.setSecuenciaNumero(Math.abs(numero.hashCode()) + 1L);
        comprobante.setNumero(numero);
        comprobante.setTipoComprobante(TipoComprobante.RECIBO);
        comprobante.setEstado(EstadoComprobante.EMITIDO);
        comprobante.setOrigen(OrigenComprobante.PAGO_SOCIO);
        comprobante.setSocio(socio);
        comprobante.setFechaEmision(LocalDate.now());
        comprobante.setConcepto("Pago de cuota");
        comprobante.setDescripcion("Comprobante de prueba");
        comprobante.setMonto(new BigDecimal("10000"));
        comprobante.setMedioPago("EFECTIVO");
        comprobante.setNombrePagador((socio.getNombre() + " " + socio.getApellido()).trim());
        comprobante.setDniPagador(socio.getDni());
        comprobante.setCreatedByUserId("admin-1");
        comprobante.setCreatedByUsername("admin");
        comprobante.setCreatedAt(now);
        comprobante.setUpdatedAt(now);
        return comprobante;
    }

    private org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.JwtRequestPostProcessor jwtFor(
            String sub,
            String username,
            String... roles) {

        List<GrantedAuthority> authorities = java.util.Arrays.stream(roles)
                .map(SimpleGrantedAuthority::new)
                .map(GrantedAuthority.class::cast)
                .toList();

        return jwt().jwt(jwt -> jwt
                        .claim("sub", sub)
                        .claim("preferred_username", username)
                        .claim("email", username + "@test.local")
                        .claim("realm_access", java.util.Map.of("roles", java.util.Arrays.asList(roles))))
                .authorities(authorities);
    }
}
