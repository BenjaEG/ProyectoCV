package ar.com.inaudi.CentroVecinal;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

import ar.com.inaudi.CentroVecinal.modules.contenido.model.Event;
import ar.com.inaudi.CentroVecinal.modules.contenido.model.News;
import ar.com.inaudi.CentroVecinal.modules.contenido.repository.EventRepository;
import ar.com.inaudi.CentroVecinal.modules.contenido.repository.NewsRepository;
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

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class ContentApiIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private NewsRepository newsRepository;

    @Autowired
    private EventRepository eventRepository;

    @BeforeEach
    void setUp() {
        eventRepository.deleteAll();
        newsRepository.deleteAll();
    }

    @Test
    void unauthenticatedUserCanReadOnlyPublishedNews() throws Exception {
        newsRepository.save(createNews("Borrador", false, LocalDateTime.now().minusDays(1)));
        newsRepository.save(createNews("Publicada", true, LocalDateTime.now()));

        mockMvc.perform(get("/api/public/news"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].title").value("Publicada"))
                .andExpect(jsonPath("$[0].published").value(true));
    }

    @Test
    void unauthenticatedUserCannotReadDraftNewsDetail() throws Exception {
        News draft = newsRepository.save(createNews("Borrador", false, LocalDateTime.now()));

        mockMvc.perform(get("/api/public/news/{newsId}", draft.getId()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Noticia no encontrada"));
    }

    @Test
    void adminCanCreateAndUpdateNews() throws Exception {
        String createBody = """
                {
                  "title": "Nueva iluminacion LED en el barrio",
                  "content": "El municipio ha iniciado trabajos de modernizacion.",
                  "copete": "Modernizacion de luminarias LED en las calles principales del barrio.",
                  "imageUrl": "https://ejemplo.com/led.jpg",
                  "published": true
                }
                """;

        String response = mockMvc.perform(post("/api/news")
                        .with(jwtFor("admin-1", "admin", "admin@test.local", "ROLE_ADMIN"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Nueva iluminacion LED en el barrio"))
                .andExpect(jsonPath("$.copete").value("Modernizacion de luminarias LED en las calles principales del barrio."))
                .andExpect(jsonPath("$.published").value(true))
                .andReturn()
                .getResponse()
                .getContentAsString();

        Long newsId = objectMapper.readTree(response).get("id").asLong();

        String updateBody = """
                {
                  "title": "Nueva iluminacion LED actualizada",
                  "content": "Contenido actualizado.",
                  "copete": "Resumen actualizado de la noticia.",
                  "imageUrl": "",
                  "published": false
                }
                """;

        mockMvc.perform(put("/api/news/{newsId}", newsId)
                        .with(jwtFor("admin-1", "admin", "admin@test.local", "ROLE_ADMIN"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updateBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Nueva iluminacion LED actualizada"))
                .andExpect(jsonPath("$.copete").value("Resumen actualizado de la noticia."))
                .andExpect(jsonPath("$.imageUrl").doesNotExist())
                .andExpect(jsonPath("$.published").value(false));
    }

    @Test
    void adminCanCreateAndDeleteEvent() throws Exception {
        String createBody = """
                {
                  "title": "Asamblea General de Vecinos",
                  "description": "Reunion mensual para discutir temas del barrio.",
                  "copete": "Encuentro mensual para definir prioridades y actividades del barrio.",
                  "eventDate": "2026-03-20",
                  "eventTime": "19:00:00",
                  "location": "Sede del Centro Vecinal",
                  "imageUrl": "https://ejemplo.com/asamblea.jpg"
                }
                """;

        String response = mockMvc.perform(post("/api/events")
                        .with(jwtFor("admin-1", "admin", "admin@test.local", "ROLE_ADMIN"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Asamblea General de Vecinos"))
                .andExpect(jsonPath("$.copete").value("Encuentro mensual para definir prioridades y actividades del barrio."))
                .andExpect(jsonPath("$.eventDate").value("2026-03-20"))
                .andExpect(jsonPath("$.eventTime").value("19:00:00"))
                .andReturn()
                .getResponse()
                .getContentAsString();

        Long eventId = objectMapper.readTree(response).get("id").asLong();

        mockMvc.perform(delete("/api/events/{eventId}", eventId)
                        .with(jwtFor("admin-1", "admin", "admin@test.local", "ROLE_ADMIN")))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/events/{eventId}", eventId)
                        .with(jwtFor("admin-1", "admin", "admin@test.local", "ROLE_ADMIN")))
                .andExpect(status().isNotFound());
    }

    @Test
    void publicEventsAreReturnedSortedByDateAndTime() throws Exception {
        eventRepository.save(createEvent("Evento tarde", LocalDate.of(2026, 3, 20), LocalTime.of(19, 0)));
        eventRepository.save(createEvent("Evento temprano", LocalDate.of(2026, 3, 20), LocalTime.of(9, 0)));
        eventRepository.save(createEvent("Evento previo", LocalDate.of(2026, 3, 19), LocalTime.of(18, 0)));

        mockMvc.perform(get("/api/public/events"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(3))
                .andExpect(jsonPath("$[0].title").value("Evento previo"))
                .andExpect(jsonPath("$[1].title").value("Evento temprano"))
                .andExpect(jsonPath("$[2].title").value("Evento tarde"));
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

    private News createNews(String title, boolean published, LocalDateTime createdAt) {
        News news = new News();
        news.setTitle(title);
        news.setCopete(title + " copete");
        news.setContent(title + " contenido");
        news.setPublished(published);
        news.setAuthorId("admin-1");
        news.setAuthorUsername("admin");
        news.setCreatedAt(createdAt);
        news.setUpdatedAt(createdAt);
        return news;
    }

    private Event createEvent(String title, LocalDate eventDate, LocalTime eventTime) {
        Event event = new Event();
        event.setTitle(title);
        event.setCopete(title + " copete");
        event.setDescription(title + " descripcion");
        event.setEventDate(eventDate);
        event.setEventTime(eventTime);
        event.setLocation("Sede");
        event.setCreatedAt(LocalDateTime.now());
        event.setUpdatedAt(LocalDateTime.now());
        event.setCreatedByUserId("admin-1");
        event.setCreatedByUsername("admin");
        return event;
    }
}
