package ar.com.inaudi.CentroVecinal;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.hamcrest.Matchers.matchesPattern;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.List;

import ar.com.inaudi.CentroVecinal.modules.vecino.model.Ticket;
import ar.com.inaudi.CentroVecinal.modules.vecino.model.TicketCategory;
import ar.com.inaudi.CentroVecinal.modules.vecino.model.enums.TicketPriority;
import ar.com.inaudi.CentroVecinal.modules.vecino.model.enums.TicketStatus;
import ar.com.inaudi.CentroVecinal.modules.vecino.repository.TicketCategoryRepository;
import ar.com.inaudi.CentroVecinal.modules.vecino.repository.AttachmentRepository;
import ar.com.inaudi.CentroVecinal.modules.vecino.repository.TicketRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
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
import org.springframework.mock.web.MockMultipartFile;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class TicketApiIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private TicketCategoryRepository categoryRepository;

    @Autowired
    private AttachmentRepository attachmentRepository;

    private TicketCategory lightingCategory;

    @BeforeEach
    void setUp() {
        ticketRepository.deleteAll();
        categoryRepository.deleteAll();

        lightingCategory = categoryRepository.save(new TicketCategory(null, "Iluminacion"));
    }

    @Test
    void unauthenticatedUserCannotAccessTickets() throws Exception {
        mockMvc.perform(get("/api/tickets"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void vecinoCanCreateTicket() throws Exception {
        String body = """
                {
                  "title": "Farola apagada",
                  "description": "No funciona desde ayer",
                  "location": "Calle San Martin 1234",
                  "priority": "MEDIUM",
                  "categoryId": %d
                }
                """.formatted(lightingCategory.getId());

        mockMvc.perform(post("/api/tickets")
                        .with(jwtFor("vecino-1", "vecino1", "vecino1@test.local", "ROLE_VECINO"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ticketCode").value("TKT-000001"))
                .andExpect(jsonPath("$.createdByUserId").value("vecino-1"))
                .andExpect(jsonPath("$.createdByUsername").value("vecino1"))
                .andExpect(jsonPath("$.location").value("Calle San Martin 1234"))
                .andExpect(jsonPath("$.attachments").isArray())
                .andExpect(jsonPath("$.comments").isArray());
    }

    @Test
    void vecinoOnlySeesOwnTicketsInList() throws Exception {
        ticketRepository.save(createTicket("TKT-000001", "Ticket propio", "vecino-1", "vecino1", TicketStatus.OPEN));
        ticketRepository.save(createTicket("TKT-000002", "Ticket ajeno", "vecino-2", "vecino2", TicketStatus.OPEN));

        mockMvc.perform(get("/api/tickets")
                        .with(jwtFor("vecino-1", "vecino1", "vecino1@test.local", "ROLE_VECINO")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(1))
                .andExpect(jsonPath("$.content[0].ticketCode").value("TKT-000001"))
                .andExpect(jsonPath("$.content[0].title").value("Ticket propio"));
    }

    @Test
    void operatorWithNeighborRoleStillSeesAllTickets() throws Exception {
        ticketRepository.save(createTicket("TKT-000001", "Ticket vecino uno", "vecino-1", "vecino1", TicketStatus.OPEN));
        ticketRepository.save(createTicket("TKT-000002", "Ticket vecino dos", "vecino-2", "vecino2", TicketStatus.OPEN));

        mockMvc.perform(get("/api/tickets")
                        .with(jwtFor("operador-1", "operador1", "operador1@test.local", "ROLE_OPERADOR", "ROLE_VECINO")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(2));
    }

    @Test
    void vecinoCannotReadAnotherUsersTicketDetail() throws Exception {
        Ticket otherTicket = ticketRepository.save(createTicket("TKT-000001", "Ticket ajeno", "vecino-2", "vecino2", TicketStatus.OPEN));

        mockMvc.perform(get("/api/tickets/{ticketId}", otherTicket.getId())
                        .with(jwtFor("vecino-1", "vecino1", "vecino1@test.local", "ROLE_VECINO")))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error").value("Forbidden"));
    }

    @Test
    void operatorCanAssignTicketToSelf() throws Exception {
        Ticket ticket = ticketRepository.save(createTicket("TKT-000001", "Sin asignar", "vecino-1", "vecino1", TicketStatus.OPEN));

        String body = """
                {
                  "assignedOperatorId": "operador-1"
                }
                """;

        mockMvc.perform(patch("/api/tickets/{ticketId}/assignment", ticket.getId())
                        .with(jwtFor("operador-1", "operador1", "operador1@test.local", "ROLE_OPERADOR"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.assignedOperatorId").value("operador-1"))
                .andExpect(jsonPath("$.assignedOperatorUsername").value("operador1"));
    }

    @Test
    void operatorCannotAssignTicketToAnotherOperator() throws Exception {
        Ticket ticket = ticketRepository.save(createTicket("TKT-000001", "Sin asignar", "vecino-1", "vecino1", TicketStatus.OPEN));

        String body = """
                {
                  "assignedOperatorId": "operador-2"
                }
                """;

        mockMvc.perform(patch("/api/tickets/{ticketId}/assignment", ticket.getId())
                        .with(jwtFor("operador-1", "operador1", "operador1@test.local", "ROLE_OPERADOR"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("Un operador solo puede asignarse tickets a si mismo"));
    }

    @Test
    void operatorCanChangeStatusWithValidTransition() throws Exception {
        Ticket ticket = ticketRepository.save(createTicket("TKT-000001", "Abierto", "vecino-1", "vecino1", TicketStatus.OPEN));

        String body = """
                {
                  "status": "IN_REVIEW"
                }
                """;

        mockMvc.perform(patch("/api/tickets/{ticketId}/status", ticket.getId())
                        .with(jwtFor("operador-1", "operador1", "operador1@test.local", "ROLE_OPERADOR"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("IN_REVIEW"));
    }

    @Test
    void operatorCanChangeStatusToAnyDifferentState() throws Exception {
        Ticket ticket = ticketRepository.save(createTicket("TKT-000001", "Abierto", "vecino-1", "vecino1", TicketStatus.OPEN));

        String body = """
                {
                  "status": "RESOLVED"
                }
                """;

        mockMvc.perform(patch("/api/tickets/{ticketId}/status", ticket.getId())
                        .with(jwtFor("operador-1", "operador1", "operador1@test.local", "ROLE_OPERADOR"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("RESOLVED"));
    }

    @Test
    void adminCanCreateCategoryAndDuplicateIsRejected() throws Exception {
        String createBody = objectMapper.writeValueAsString(new NamePayload("Basura"));

        mockMvc.perform(post("/api/ticket-categories")
                        .with(jwtFor("admin-1", "admin", "admin@test.local", "ROLE_ADMIN"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Basura"));

        mockMvc.perform(post("/api/ticket-categories")
                        .with(jwtFor("admin-1", "admin", "admin@test.local", "ROLE_ADMIN"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new NamePayload("  basura  "))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Ya existe una categoria con ese nombre"));
    }

    @Test
    void vecinoCanUploadAttachmentToOwnTicket() throws Exception {
        Ticket ticket = ticketRepository.save(createTicket("TKT-000001", "Ticket con foto", "vecino-1", "vecino1", TicketStatus.OPEN));
        byte[] jpegBytes = new byte[] {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, 0x00};

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "bache.jpg",
                MediaType.IMAGE_JPEG_VALUE,
                jpegBytes
        );

        mockMvc.perform(multipart("/api/tickets/{ticketId}/attachments", ticket.getId())
                        .file(file)
                        .with(jwtFor("vecino-1", "vecino1", "vecino1@test.local", "ROLE_VECINO")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fileName").value("bache.jpg"))
                .andExpect(jsonPath("$.filePath").value(matchesPattern("/api/tickets/attachments/\\d+/file")))
                .andExpect(jsonPath("$.contentType").value(MediaType.IMAGE_JPEG_VALUE));
    }

    @Test
    void rejectsAttachmentWithInvalidFileSignature() throws Exception {
        Ticket ticket = ticketRepository.save(createTicket("TKT-000001", "Ticket con foto", "vecino-1", "vecino1", TicketStatus.OPEN));

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "bache.jpg",
                MediaType.IMAGE_JPEG_VALUE,
                "esto-no-es-jpeg".getBytes(StandardCharsets.UTF_8)
        );

        mockMvc.perform(multipart("/api/tickets/{ticketId}/attachments", ticket.getId())
                        .file(file)
                        .with(jwtFor("vecino-1", "vecino1", "vecino1@test.local", "ROLE_VECINO")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("El archivo adjunto no es una imagen valida"));
    }

    @Test
    void neighborCannotDeleteOwnAttachment() throws Exception {
        Ticket ticket = ticketRepository.save(createTicket("TKT-000001", "Ticket con foto", "vecino-1", "vecino1", TicketStatus.OPEN));

        byte[] jpegBytes = new byte[] {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, 0x00};
        MockMultipartFile file = new MockMultipartFile("file", "foto.jpg", MediaType.IMAGE_JPEG_VALUE, jpegBytes);

        mockMvc.perform(multipart("/api/tickets/{ticketId}/attachments", ticket.getId())
                        .file(file)
                        .with(jwtFor("vecino-1", "vecino1", "vecino1@test.local", "ROLE_VECINO")))
                .andExpect(status().isOk());

        Long attachmentId = attachmentRepository.findByTicketIdOrderByUploadedAtAsc(ticket.getId()).getFirst().getId();

        mockMvc.perform(delete("/api/tickets/attachments/{attachmentId}", attachmentId)
                        .with(jwtFor("vecino-1", "vecino1", "vecino1@test.local", "ROLE_VECINO")))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/tickets/attachments/{attachmentId}/file", attachmentId)
                        .with(jwtFor("vecino-1", "vecino1", "vecino1@test.local", "ROLE_VECINO")))
                .andExpect(status().isOk());
    }

    @Test
    void operatorCanDeleteAttachment() throws Exception {
        Ticket ticket = ticketRepository.save(createTicket("TKT-000001", "Ticket con foto", "vecino-1", "vecino1", TicketStatus.OPEN));

        byte[] jpegBytes = new byte[] {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, 0x00};
        MockMultipartFile file = new MockMultipartFile("file", "foto.jpg", MediaType.IMAGE_JPEG_VALUE, jpegBytes);

        mockMvc.perform(multipart("/api/tickets/{ticketId}/attachments", ticket.getId())
                        .file(file)
                        .with(jwtFor("vecino-1", "vecino1", "vecino1@test.local", "ROLE_VECINO")))
                .andExpect(status().isOk());

        Long attachmentId = attachmentRepository.findByTicketIdOrderByUploadedAtAsc(ticket.getId()).getFirst().getId();

        mockMvc.perform(delete("/api/tickets/attachments/{attachmentId}", attachmentId)
                        .with(jwtFor("operador-1", "operador1", "operador1@test.local", "ROLE_OPERADOR")))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/tickets/attachments/{attachmentId}/file", attachmentId)
                        .with(jwtFor("operador-1", "operador1", "operador1@test.local", "ROLE_OPERADOR")))
                .andExpect(status().isNotFound());
    }

    private org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.JwtRequestPostProcessor jwtFor(
            String sub,
            String username,
            String email,
            String... roles) {

        List<GrantedAuthority> authorities = List.of(roles).stream()
                .map(SimpleGrantedAuthority::new)
                .map(GrantedAuthority.class::cast)
                .toList();

        return jwt()
                .jwt(jwt -> jwt
                        .subject(sub)
                        .claim("preferred_username", username)
                        .claim("email", email)
                        .claim("roles", List.of(roles)))
                .authorities(authorities);
    }

    private Ticket createTicket(String code, String title, String createdByUserId, String createdByUsername, TicketStatus status) {
        Ticket ticket = new Ticket();
        ticket.setTicketCode(code);
        ticket.setTitle(title);
        ticket.setDescription(title + " descripcion");
        ticket.setLocation("Ubicacion de prueba");
        ticket.setPriority(TicketPriority.MEDIUM);
        ticket.setStatus(status);
        ticket.setCreatedByUserId(createdByUserId);
        ticket.setCreatedByUsername(createdByUsername);
        ticket.setCreatedByEmail(createdByUsername + "@test.local");
        ticket.setCategory(lightingCategory);
        ticket.setCreatedAt(LocalDateTime.now());
        ticket.setUpdatedAt(LocalDateTime.now());
        return ticket;
    }

    private record NamePayload(String name) {
    }
}
